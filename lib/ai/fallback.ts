/**
 * Fallback Classification for TariffAgent
 * Used when Gemini API fails or is unavailable
 */

import {
  HSCodeClassification,
  SearchResult,
  RestrictionCheck,
} from './types';
import { normalizeHSCode } from '@/lib/utils/validators';

/**
 * Generate fallback classification from search results
 * Uses Fuse.js results directly without AI enhancement
 *
 * @param searchResults - Results from Fuse.js HS code search
 * @param originCountry - Country of origin
 * @param cifValue - Optional CIF value for duty calculation
 * @param restrictions - Restriction check results
 * @returns HSCodeClassification based on search results
 */
export function fallbackClassification(
  searchResults: SearchResult[],
  originCountry: string = 'India',
  cifValue?: number,
  restrictions?: RestrictionCheck
): HSCodeClassification {
  // If no results, return a default unknown classification
  if (!searchResults || searchResults.length === 0) {
    return createUnknownClassification(originCountry, restrictions);
  }

  // Use top result
  const topResult = searchResults[0];

  // Normalize HS code
  let hsCode: string;
  try {
    hsCode = normalizeHSCode(topResult.hs_code);
  } catch {
    hsCode = topResult.hs_code;
  }

  // Determine CEPA applicability
  const isFromIndia = originCountry.toLowerCase() === 'india';
  const cepaApplicable = topResult.has_cepa === true && isFromIndia;

  // Get duty rates
  const gccDutyRate = topResult.gcc_duty_rate ?? 5;
  const cepaDutyRate = cepaApplicable ? (topResult.cepa_duty_rate ?? gccDutyRate) : gccDutyRate;

  // Calculate savings explanation
  const savingsExplanation = buildSavingsExplanation(
    cepaApplicable,
    gccDutyRate,
    cepaDutyRate,
    cifValue
  );

  // Build warnings
  const warnings: string[] = [];

  // Add restriction warnings
  if (restrictions?.prohibited) {
    warnings.push('PROHIBITED ITEM: Import not allowed into UAE');
    if (restrictions.warnings) {
      warnings.push(...restrictions.warnings);
    }
  } else if (restrictions?.restricted) {
    warnings.push(`RESTRICTED: Requires special permit from ${restrictions.authority || 'relevant authority'}`);
    if (restrictions.warnings) {
      warnings.push(...restrictions.warnings);
    }
  }

  // Check if top result has restrictions
  if (topResult.has_restrictions && topResult.restriction_type) {
    const restrictionType = topResult.restriction_type.toLowerCase();
    if (restrictionType === 'prohibited') {
      warnings.push(`PROHIBITED: ${topResult.notes || 'Import not allowed'}`);
    } else {
      warnings.push(`RESTRICTED: ${topResult.restriction_type} - ${topResult.notes || ''}`);
    }
  }

  // Build required documents
  const requiredDocuments = buildRequiredDocuments(
    cepaApplicable,
    restrictions?.restricted || topResult.has_restrictions || false,
    topResult.authority
  );

  // Determine if prohibited/restricted
  const isProhibited = restrictions?.prohibited ||
    topResult.restriction_type?.toLowerCase() === 'prohibited';
  const isRestricted = (restrictions?.restricted || topResult.has_restrictions || false) && !isProhibited;

  // Calculate confidence (reduce from search confidence due to fallback)
  const confidence = Math.min(topResult.confidence * 100 * 0.9, 85); // Cap at 85% for fallback

  return {
    hs_code_12_digit: hsCode,
    confidence: Math.round(confidence * 10) / 10,
    description_english: topResult.description_en,
    description_arabic: topResult.description_ar || '',
    category: topResult.category || 'Unknown',
    standard_duty_pct: gccDutyRate,
    cepa_applicable: cepaApplicable && !isProhibited,
    cepa_duty_pct: cepaDutyRate,
    savings_explanation: isProhibited ? 'No savings - prohibited item' : savingsExplanation,
    restricted: isRestricted,
    prohibited: isProhibited,
    warnings,
    required_documents: requiredDocuments,
    reasoning: buildFallbackReasoning(topResult, searchResults.length),
  };
}

/**
 * Create classification for unknown/unmatched items
 */
function createUnknownClassification(
  originCountry: string,
  restrictions?: RestrictionCheck
): HSCodeClassification {
  const warnings: string[] = [
    'Unable to classify item - no matches found in database',
  ];

  if (restrictions?.prohibited) {
    warnings.unshift('PROHIBITED ITEM: Import not allowed into UAE');
  } else if (restrictions?.restricted) {
    warnings.unshift('RESTRICTED: Requires special permit');
  }

  return {
    hs_code_12_digit: '0000.00.00.0000',
    confidence: 0,
    description_english: 'Unknown - requires manual classification',
    description_arabic: '',
    category: 'Unknown',
    standard_duty_pct: 5, // Default UAE rate
    cepa_applicable: false,
    cepa_duty_pct: 5,
    savings_explanation: 'Unable to determine - manual classification required',
    restricted: restrictions?.restricted || false,
    prohibited: restrictions?.prohibited || false,
    warnings,
    required_documents: [
      'Commercial Invoice',
      'Packing List',
      'Bill of Lading/Airway Bill',
      'Certificate of Origin',
    ],
    reasoning: 'No matching HS codes found in database. Manual classification by customs expert required.',
  };
}

/**
 * Build savings explanation text
 */
function buildSavingsExplanation(
  cepaApplicable: boolean,
  gccDutyRate: number,
  cepaDutyRate: number,
  cifValue?: number
): string {
  if (!cepaApplicable) {
    return 'No CEPA benefit available - origin country not eligible';
  }

  const savingsPct = gccDutyRate - cepaDutyRate;

  if (savingsPct <= 0) {
    return 'CEPA applicable but no duty reduction for this item';
  }

  let explanation = `Under UAE-India CEPA, duty reduced from ${gccDutyRate}% to ${cepaDutyRate}%. `;
  explanation += `Savings: ${savingsPct}% of CIF value`;

  if (cifValue && cifValue > 0) {
    const savingsAmount = (savingsPct / 100) * cifValue;
    explanation += ` (AED ${savingsAmount.toFixed(2)})`;
  }

  return explanation;
}

/**
 * Build list of required documents
 */
function buildRequiredDocuments(
  cepaApplicable: boolean,
  hasRestrictions: boolean,
  authority?: string
): string[] {
  const documents = [
    'Commercial Invoice',
    'Packing List',
    'Bill of Lading/Airway Bill',
  ];

  if (cepaApplicable) {
    documents.push('Certificate of Origin (India)');
    documents.push('CEPA Certificate of Origin Form');
  } else {
    documents.push('Certificate of Origin');
  }

  if (hasRestrictions) {
    const authorityName = authority || 'Relevant UAE authority';
    documents.push(`Import Permit from ${authorityName}`);
  }

  return documents;
}

/**
 * Build reasoning text for fallback classification
 */
function buildFallbackReasoning(
  topResult: SearchResult,
  totalResults: number
): string {
  const confidence = (topResult.confidence * 100).toFixed(1);

  let reasoning = `Fallback classification (AI service unavailable). `;
  reasoning += `Matched with ${confidence}% confidence based on semantic similarity. `;
  reasoning += `Selected top result from ${totalResults} database matches: `;
  reasoning += `${topResult.description_en.substring(0, 100)}`;

  if (topResult.description_en.length > 100) {
    reasoning += '...';
  }

  reasoning += '. ';
  reasoning += 'Recommend verification by customs specialist for accurate classification.';

  return reasoning;
}

/**
 * Quick fallback for API errors
 * Creates a minimal classification with error indication
 */
export function errorFallbackClassification(
  description: string,
  errorMessage: string
): HSCodeClassification {
  return {
    hs_code_12_digit: '0000.00.00.0000',
    confidence: 0,
    description_english: `Classification failed: ${description.substring(0, 50)}...`,
    description_arabic: '',
    category: 'Error',
    standard_duty_pct: 5,
    cepa_applicable: false,
    cepa_duty_pct: 5,
    savings_explanation: 'Unable to calculate - classification error',
    restricted: false,
    prohibited: false,
    warnings: [
      `Classification error: ${errorMessage}`,
      'Please try again or contact support',
    ],
    required_documents: [
      'Commercial Invoice',
      'Packing List',
      'Bill of Lading/Airway Bill',
    ],
    reasoning: `Classification failed due to: ${errorMessage}. Manual classification required.`,
  };
}
