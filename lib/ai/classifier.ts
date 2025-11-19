/**
 * AI Classification Service for TariffAgent
 * Main classification logic using Google Gemini API
 * Ported from Python ai_classifier.py
 */

import { generateContent } from './gemini-client';
import {
  createClassificationPrompt,
  buildSearchContext,
  quickProhibitedCheck,
  createInvoiceParsePrompt,
} from './prompts';
import { fallbackClassification, errorFallbackClassification } from './fallback';
import {
  HSCodeClassification,
  HSCodeClassificationSchema,
  InvoiceClassification,
  SearchResult,
  RestrictionCheck,
  InvoiceLineItem,
  ClassificationError,
} from './types';
import { normalizeHSCode, normalizeCountryName, hasCEPABenefits } from '@/lib/utils/validators';
import { searchHSCodes as searchHSCodesFromData } from '@/lib/data/search';

/**
 * Classify a single item and return structured HS code classification
 *
 * @param description - Description of the item to classify
 * @param originCountry - Country of origin (default: India)
 * @param cifValue - CIF value in AED (optional, for duty calculation)
 * @returns HSCodeClassification with structured results
 */
export async function classifyItem(
  description: string,
  originCountry: string = 'India',
  cifValue?: number
): Promise<HSCodeClassification> {
  // Normalize inputs
  const normalizedCountry = normalizeCountryName(originCountry);
  const normalizedDescription = description.trim();

  if (!normalizedDescription) {
    throw new ClassificationError(
      'Item description is required',
      'VALIDATION_ERROR'
    );
  }

  // Step 1: Quick prohibited check
  const quickCheck = quickProhibitedCheck(normalizedDescription);
  
  // Debug logging
  if (quickCheck.hasProhibited) {
    console.log('⚠️ Prohibited check matched keywords:', quickCheck.matchedKeywords);
    console.log('⚠️ Description:', normalizedDescription);
  }
  
  const restrictions: RestrictionCheck = {
    prohibited: quickCheck.hasProhibited,
    restricted: quickCheck.hasRestricted,
    warnings: quickCheck.matchedKeywords.length > 0
      ? [`Detected keywords: ${quickCheck.matchedKeywords.join(', ')}`]
      : [],
  };

  // Step 2: Search for similar HS codes using knowledge base
  const searchResults = await searchHSCodesFromData(normalizedDescription, 5);

  if (!searchResults || searchResults.length === 0) {
    return fallbackClassification([], normalizedCountry, cifValue, restrictions);
  }

  try {
    // Step 3: Build context for Gemini
    const context = buildSearchContext(searchResults);

    // Step 4: Create classification prompt
    const prompt = createClassificationPrompt(
      normalizedDescription,
      normalizedCountry,
      context,
      cifValue
    );

    // Step 5: Call Gemini API
    const response = await generateContent(prompt);

    // Step 6: Parse and validate response
    const result = parseGeminiResponse(response);

    // Step 7: Validate HS code is from search results
    const validatedResult = validateAndEnrichResult(
      result,
      searchResults,
      normalizedCountry,
      cifValue
    );

    // Step 8: Apply restriction overrides
    if (restrictions.prohibited) {
      validatedResult.prohibited = true;
      validatedResult.cepa_applicable = false;
      validatedResult.savings_explanation = 'No savings - prohibited item';
      validatedResult.warnings = [
        'PROHIBITED ITEM: Import not allowed into UAE',
        ...restrictions.warnings,
        ...validatedResult.warnings,
      ];
    } else if (restrictions.restricted && !validatedResult.restricted) {
      validatedResult.restricted = true;
      validatedResult.warnings = [
        ...restrictions.warnings,
        ...validatedResult.warnings,
      ];
    }

    return validatedResult;

  } catch {
    // Use fallback classification
    return fallbackClassification(
      searchResults,
      normalizedCountry,
      cifValue,
      restrictions
    );
  }
}

/**
 * Classify all items in an invoice
 *
 * @param invoiceText - Full text of invoice
 * @param originCountry - Country of origin (default: India)
 * @returns InvoiceClassification with all items and totals
 */
export async function classifyInvoice(
  invoiceText: string,
  originCountry: string = 'India'
): Promise<InvoiceClassification> {
  // Normalize country
  const normalizedCountry = normalizeCountryName(originCountry);

  // Step 1: Parse invoice for line items
  const items = await parseInvoiceItems(invoiceText);

  if (!items || items.length === 0) {
    // Fallback: treat entire text as single item
    const singleItem: InvoiceLineItem = {
      description: invoiceText.trim(),
      quantity: 1,
      cifValue: undefined,
    };
    items.push(singleItem);
  }

  // Step 2: Classify each item
  const classifications: HSCodeClassification[] = [];

  for (const item of items) {
    try {
      const classification = await classifyItem(
        item.description,
        normalizedCountry,
        item.cifValue
      );
      classifications.push(classification);
    } catch (error) {
      // Create error classification for failed items
      const errorMessage = error instanceof Error ? error.message : 'Classification failed';
      classifications.push(errorFallbackClassification(item.description, errorMessage));
    }
  }

  // Step 3: Calculate totals
  const totalStandardDuty = calculateTotalDuty(classifications, items, 'standard');
  const totalCEPADuty = calculateTotalDuty(classifications, items, 'cepa');
  const totalSavings = totalStandardDuty - totalCEPADuty;

  // Step 4: Generate summary
  const summary = generateSummary(classifications, normalizedCountry, totalSavings);

  return {
    items: classifications,
    total_standard_duty: Math.round(totalStandardDuty * 100) / 100,
    total_cepa_duty: Math.round(totalCEPADuty * 100) / 100,
    total_savings: Math.round(totalSavings * 100) / 100,
    invoice_summary: summary,
  };
}

/**
 * Parse Gemini response and validate against schema
 */
function parseGeminiResponse(responseText: string): HSCodeClassification {
  let jsonText = responseText.trim();

  // Extract JSON from markdown code blocks if present
  if (jsonText.includes('```json')) {
    const match = jsonText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (match) {
      jsonText = match[1];
    }
  } else if (jsonText.includes('```')) {
    const match = jsonText.match(/```\s*(\{[\s\S]*?\})\s*```/);
    if (match) {
      jsonText = match[1];
    }
  }

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new ClassificationError(
      `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
      'VALIDATION_ERROR',
      { responseText: responseText.substring(0, 500) }
    );
  }

  // Validate with Zod schema
  const validationResult = HSCodeClassificationSchema.safeParse(parsed);

  if (!validationResult.success) {
    // Try to fix common issues
    const fixedData = fixCommonIssues(parsed as Record<string, unknown>);
    const retryResult = HSCodeClassificationSchema.safeParse(fixedData);

    if (retryResult.success) {
      return retryResult.data;
    }

    throw new ClassificationError(
      `Invalid classification response: ${validationResult.error.message}`,
      'VALIDATION_ERROR',
      validationResult.error
    );
  }

  return validationResult.data;
}

/**
 * Fix common issues in Gemini response
 */
function fixCommonIssues(data: Record<string, unknown>): Record<string, unknown> {
  const fixed = { ...data };

  // Fix HS code format
  if (typeof fixed.hs_code_12_digit === 'string') {
    try {
      fixed.hs_code_12_digit = normalizeHSCode(fixed.hs_code_12_digit);
    } catch {
      // Keep original if normalization fails
    }
  }

  // Ensure arrays
  if (!Array.isArray(fixed.warnings)) {
    fixed.warnings = fixed.warnings ? [String(fixed.warnings)] : [];
  }
  if (!Array.isArray(fixed.required_documents)) {
    fixed.required_documents = fixed.required_documents
      ? [String(fixed.required_documents)]
      : [];
  }

  // Ensure strings
  if (typeof fixed.description_arabic !== 'string') {
    fixed.description_arabic = '';
  }

  // Ensure numbers
  if (typeof fixed.confidence === 'string') {
    fixed.confidence = parseFloat(fixed.confidence) || 0;
  }
  if (typeof fixed.standard_duty_pct === 'string') {
    fixed.standard_duty_pct = parseFloat(fixed.standard_duty_pct) || 0;
  }
  if (typeof fixed.cepa_duty_pct === 'string') {
    fixed.cepa_duty_pct = parseFloat(fixed.cepa_duty_pct) || 0;
  }

  return fixed;
}

/**
 * Validate that returned HS code is in search results and enrich with CEPA data
 */
function validateAndEnrichResult(
  result: HSCodeClassification,
  searchResults: SearchResult[],
  originCountry: string,
  cifValue?: number
): HSCodeClassification {
  // Extract digits for comparison
  const returnedHsDigits = result.hs_code_12_digit.replace(/\./g, '');

  // Check if HS code is in search results
  let foundInResults = false;
  let matchingResult: SearchResult | undefined;

  for (const searchResult of searchResults) {
    const searchHsDigits = searchResult.hs_code.replace(/\./g, '');
    // Match if same code or if it's a parent code (first 6 digits match)
    if (returnedHsDigits === searchHsDigits ||
        returnedHsDigits.substring(0, 6) === searchHsDigits.substring(0, 6)) {
      foundInResults = true;
      matchingResult = searchResult;
      break;
    }
  }

  // If not found in results, use top search result
  if (!foundInResults && searchResults.length > 0) {
    const topResult = searchResults[0];

    try {
      result.hs_code_12_digit = normalizeHSCode(topResult.hs_code);
    } catch {
      result.hs_code_12_digit = topResult.hs_code;
    }

    result.description_english = topResult.description_en;
    result.description_arabic = topResult.description_ar || '';
    result.category = topResult.category || 'Unknown';
    result.standard_duty_pct = topResult.gcc_duty_rate ?? 5;
    result.cepa_duty_pct = topResult.cepa_duty_rate ?? topResult.gcc_duty_rate ?? 5;
    result.cepa_applicable = (topResult.has_cepa ?? false) &&
      hasCEPABenefits(originCountry);
    result.confidence = Math.min((topResult.confidence * 100), 95);
    result.reasoning = `Corrected: Using top search result ${topResult.hs_code}. ` +
      `Original AI response HS code was not in search results.`;

    matchingResult = topResult;
  }

  // Enrich with CEPA benefits if applicable
  if (matchingResult && hasCEPABenefits(originCountry)) {
    const cepaApplicable = matchingResult.has_cepa ?? false;
    result.cepa_applicable = cepaApplicable;

    if (cepaApplicable) {
      result.cepa_duty_pct = matchingResult.cepa_duty_rate ?? result.standard_duty_pct;

      // Update savings explanation if CIF value provided
      if (cifValue && cifValue > 0) {
        const savings = ((result.standard_duty_pct - result.cepa_duty_pct) / 100) * cifValue;
        if (savings > 0) {
          result.savings_explanation =
            `Under UAE-India CEPA, duty reduced from ${result.standard_duty_pct}% to ` +
            `${result.cepa_duty_pct}%. Savings: AED ${savings.toFixed(2)}`;
        }
      }

      // Ensure Certificate of Origin in documents
      if (!result.required_documents.some(doc =>
        doc.toLowerCase().includes('certificate of origin'))) {
        result.required_documents.push('Certificate of Origin (India)');
      }
    }
  }

  return result;
}

/**
 * Parse invoice text to extract line items
 * Uses Gemini for intelligent parsing or falls back to regex
 */
async function parseInvoiceItems(invoiceText: string): Promise<InvoiceLineItem[]> {
  // Try AI-powered parsing first
  try {
    const prompt = createInvoiceParsePrompt(invoiceText);
    const response = await generateContent(prompt);

    // Extract JSON
    let jsonText = response.trim();
    if (jsonText.includes('```json')) {
      const match = jsonText.match(/```json\s*(\[[\s\S]*?\])\s*```/);
      if (match) jsonText = match[1];
    } else if (jsonText.includes('```')) {
      const match = jsonText.match(/```\s*(\[[\s\S]*?\])\s*```/);
      if (match) jsonText = match[1];
    }

    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        description: String(item.description || ''),
        quantity: Number(item.quantity) || 1,
        cifValue: item.cifValue ? Number(item.cifValue) : undefined,
      })).filter(item => item.description.length > 0);
    }
  } catch {
    // Fall through to regex parsing
  }

  // Fallback: Simple regex-based parsing
  return parseInvoiceItemsRegex(invoiceText);
}

/**
 * Simple regex-based invoice parsing
 * Improved to only extract actual product lines, not metadata
 */
function parseInvoiceItemsRegex(invoiceText: string): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = [];
  const lines = invoiceText.trim().split('\n');
  
  // Skip patterns that indicate metadata/headers
  const skipPatterns = [
    /^invoice\s*no/i,
    /^date:/i,
    /^exporter:/i,
    /^importer:/i,
    /^consignee:/i,
    /^country\s+of\s+origin:/i,
    /^port\s+of\s+loading/i,
    /^final\s+destination/i,
    /^terms?:/i,
    /^payment\s+terms/i,
    /^gstin:/i,
    /^trn:/i,
    /^po\s+box/i,
    /^total\s+(invoice\s+)?value/i,
    /^freight/i,
    /^insurance/i,
    /^cif\s+value/i,
    /^declaration/i,
    /^certificate/i,
    /^note:/i,
    /^---+/,
    /^s\.no/i,
    /^description.*qty.*unit.*rate/i,
    /^total\s+quantity/i,
    /^subtotal/i,
    /^tax/i,
    /^shipping/i,
    /^\d+\s+[A-Z][a-z]+\s+(Street|Park|Road|Avenue)/i, // Addresses
    /^[A-Z][a-z]+\s+\d+[A-Z]+\d+[A-Z]+\d+[A-Z]+\d+[A-Z]+\d+$/i, // GSTIN/TRN patterns
  ];
  
  let inItemSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    
    // Skip empty lines
    if (!trimmedLine || trimmedLine.length < 5) continue;
    
    // Check if we're in the item section (after finding item header)
    if (/^s\.no|^description.*qty|^item\s*no/i.test(trimmedLine)) {
      inItemSection = true;
      continue;
    }
    
    // If we found a separator or total line after items, stop looking
    if (/^---+/i.test(trimmedLine) || /^total\s+(invoice\s+)?value/i.test(trimmedLine)) {
      if (inItemSection) break;
      continue;
    }
    
    // Skip metadata lines
    let shouldSkip = false;
    for (const pattern of skipPatterns) {
      if (pattern.test(trimmedLine)) {
        shouldSkip = true;
        break;
      }
    }
    if (shouldSkip) continue;
    
    // Only process lines that look like product items
    // Product lines typically have:
    // 1. A number at the start (item number like "1", "2", etc.)
    // 2. Description text
    // 3. Numbers (quantity, price, amount)
    const hasItemNumber = /^\d+[\.\s]+/.test(trimmedLine);
    const hasProductKeywords = /\b(pcs|kg|pieces|units|sets|meters|boxes|cartons|bottles|bags|smartphone|earbuds|shirt|kurta|rice|pepper|spice|gold|fabric|textile|electronic|device)\b/i.test(trimmedLine);
    const hasQuantityPattern = /\d+\s*(pcs|kg|pieces|units|sets|meters|boxes)/i.test(trimmedLine);
    const hasPricePattern = /\$\s*\d+|usd\s*\d+|aed\s*\d+|\d+\.\d+\s*(usd|aed)/i.test(trimmedLine);
    const hasHSCode = /hs\s+code:/i.test(trimmedLine);
    
    const looksLikeItem = hasItemNumber && (
      hasProductKeywords ||
      hasQuantityPattern ||
      hasPricePattern ||
      hasHSCode ||
      (inItemSection && /\d+/.test(trimmedLine))
    );
    
    if (!looksLikeItem && !inItemSection) continue;
    
    // Extract item details
    const item: InvoiceLineItem = {
      description: trimmedLine,
      quantity: 1,
      cifValue: undefined,
    };
    
    // Extract HS code if present (usually on next line or same line)
    const hsCodeMatch = trimmedLine.match(/hs\s+code:\s*([\d\.]+)/i);
    if (hsCodeMatch) {
      // Remove HS code from description
      item.description = trimmedLine.replace(/hs\s+code:[\s\d\.]+/i, '').trim();
    }
    
    // Check next line for HS code
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      const nextLineHSCode = nextLine.match(/hs\s+code:\s*([\d\.]+)/i);
      if (nextLineHSCode) {
        // Skip the HS code line
        i++;
      }
    }
    
    // Try to extract quantity (e.g., "200 pcs", "500 kg")
    const qtyMatch = trimmedLine.match(/(\d+)\s*(pcs|kg|pieces|units|sets|meters|boxes|cartons|bottles|bags)/i);
    if (qtyMatch) {
      item.quantity = parseInt(qtyMatch[1], 10);
    }
    
    // Try to extract CIF value (look for USD/AED amounts in the line or nearby)
    // First check current line
    let valueMatch = trimmedLine.match(/(?:usd|aed)\s*([0-9,]+\.?\d*)/i);
    if (!valueMatch) {
      // Check for $ amounts
      valueMatch = trimmedLine.match(/\$\s*([0-9,]+\.?\d*)/i);
    }
    if (!valueMatch && i + 1 < lines.length) {
      // Check next line for amount
      const nextLine = lines[i + 1].trim();
      valueMatch = nextLine.match(/(?:usd|aed)\s*([0-9,]+\.?\d*)/i);
      if (valueMatch) {
        i++; // Skip the amount line
      }
    }
    
    if (valueMatch) {
      const valueStr = valueMatch[1].replace(/,/g, '');
      item.cifValue = parseFloat(valueStr);
    }
    
    // Clean up description - remove item number, quantities, prices
    item.description = item.description
      .replace(/^\d+[\.\s]+/, '') // Remove leading item number
      .replace(/\d+\s*(pcs|kg|pieces|units|sets|meters|boxes)/i, '') // Remove quantity
      .replace(/(?:usd|aed)\s*[0-9,]+\.?\d*/i, '') // Remove currency amounts
      .replace(/\$\s*[0-9,]+\.?\d*/g, '') // Remove $ amounts
      .replace(/\d+\.\d+\s*(usd|aed)/i, '') // Remove formatted amounts
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Only add if description is meaningful (not just numbers or empty)
    if (item.description && 
        item.description.length > 5 && 
        !/^\d+$/.test(item.description) &&
        !/^[A-Z\s]+$/.test(item.description)) { // Not just uppercase letters (like addresses)
      items.push(item);
      inItemSection = true; // Mark that we're in item section
    }
  }
  
  return items;
}

/**
 * Calculate total duty for all items
 */
function calculateTotalDuty(
  classifications: HSCodeClassification[],
  items: InvoiceLineItem[],
  type: 'standard' | 'cepa'
): number {
  let total = 0;

  classifications.forEach((classification, index) => {
    const item = items[index];
    if (item?.cifValue && item.cifValue > 0) {
      const rate = type === 'standard'
        ? classification.standard_duty_pct
        : classification.cepa_duty_pct;
      total += (rate / 100) * item.cifValue;
    }
  });

  return total;
}

/**
 * Generate invoice summary
 */
function generateSummary(
  classifications: HSCodeClassification[],
  originCountry: string,
  totalSavings: number
): string {
  const totalItems = classifications.length;
  const prohibitedItems = classifications.filter(c => c.prohibited).length;
  const restrictedItems = classifications.filter(c => c.restricted).length;

  let summary = `Classified ${totalItems} item(s) from invoice. Origin: ${originCountry}. `;

  if (prohibitedItems > 0) {
    summary += `WARNING: ${prohibitedItems} prohibited item(s) detected. `;
  }

  if (restrictedItems > 0) {
    summary += `Note: ${restrictedItems} item(s) require special permits. `;
  }

  if (totalSavings > 0) {
    summary += `Total potential CEPA savings: AED ${totalSavings.toFixed(2)}`;
  } else if (hasCEPABenefits(originCountry)) {
    summary += 'No CEPA savings available for these items.';
  }

  return summary;
}

/**
 * Search for HS codes matching the description
 * This is a placeholder that should be replaced with actual Fuse.js search
 * from lib/data when available
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function searchHSCodes(
  _query: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _topK: number = 5
): Promise<SearchResult[]> {
  // TODO: Replace with actual Fuse.js search from lib/data
  // This is a temporary placeholder that returns empty results
  // In production, this should call:
  // import { searchHSCodes } from '@/lib/data';
  // return searchHSCodes(query, topK);

  // For now, return empty to trigger fallback behavior
  // This will be connected to the data layer when lib/data is implemented
  return [];
}

/**
 * Get CEPA benefit for an HS code
 * Placeholder for lib/data integration
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCEPABenefit(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _hsCode: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _originCountry: string
): Promise<{ found: boolean; cepa_duty_rate: number; notes?: string }> {
  // TODO: Replace with actual CEPA lookup from lib/data
  // import { getCEPABenefit } from '@/lib/data';
  // return getCEPABenefit(hsCode, originCountry);

  return {
    found: false,
    cepa_duty_rate: 0,
    notes: 'CEPA data integration pending',
  };
}

/**
 * Check if item is prohibited or restricted
 * Placeholder for lib/data integration
 */
export function checkProhibited(description: string): RestrictionCheck {
  // Use quick check from prompts
  const quickCheck = quickProhibitedCheck(description);

  return {
    prohibited: quickCheck.hasProhibited,
    restricted: quickCheck.hasRestricted,
    warnings: quickCheck.matchedKeywords.length > 0
      ? [`Matched keywords: ${quickCheck.matchedKeywords.join(', ')}`]
      : [],
  };
}
