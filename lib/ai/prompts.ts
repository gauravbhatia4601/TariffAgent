/**
 * Prompt Templates for TariffAgent AI Classification
 * Ported from Python ai_classifier.py system prompts
 */

import { SearchResult } from './types';

/**
 * Main system prompt for HS code classification
 * Defines the AI's role and classification rules
 */
export const SYSTEM_PROMPT = `You are TariffAgent, a strict UAE customs compliance officer.

STEP 1 - ALWAYS scan the entire invoice/item description for prohibited or restricted items FIRST using this list:
- Pork/lard/pig products
- CBD/THC/cannabis/marijuana products
- Vape/e-cigarette products
- Alcohol/liquor/beer/wine
- Ivory, narcotics, drugs
- Israeli origin or markings

If you find ANY match (even partial), immediately:
- Set prohibited=true or restricted=true
- Add clear warning in warnings field
- Do NOT show any duty savings or CEPA benefits
- Return confidence=100 for prohibited items

STEP 2 - Only proceed to HS code classification and CEPA calculations if the invoice is CLEAN (no prohibited items found).

STEP 3 - Classification Rules (only if clean):
- Always return 12-digit HS code in format XXXX.XX.XX.XXXX
- Be conservative with confidence scores (only >95% if certain)
- Check for CEPA eligibility if origin is India
- Flag all restricted/prohibited items with clear warnings
- Consider item description, material, use, and any technical specs
- Multilingual: Support English and Arabic descriptions
- Use the provided RAG search results as primary reference
- If multiple similar HS codes exist, choose the most specific one
- Calculate exact savings when CIF value is provided
- Always provide clear reasoning for your classification decision

CRITICAL: Prohibited items check comes FIRST. Never calculate savings for prohibited items.`;

/**
 * Create classification prompt with context
 * @param description - Item description to classify
 * @param originCountry - Country of origin
 * @param searchContext - Context from Fuse.js search results
 * @param cifValue - Optional CIF value for duty calculation
 * @returns Complete prompt for Gemini
 */
export function createClassificationPrompt(
  description: string,
  originCountry: string,
  searchContext: string,
  cifValue?: number
): string {
  let prompt = `${SYSTEM_PROMPT}

${searchContext}

ITEM TO CLASSIFY:
Description: ${description}
Origin Country: ${originCountry}
`;

  if (cifValue !== undefined && cifValue > 0) {
    prompt += `CIF Value: ${cifValue} AED
`;
  }

  prompt += `

INSTRUCTIONS:
**STEP 1 - PROHIBITED ITEMS CHECK (MANDATORY FIRST STEP):**
1. Scan the item description: "${description}" for prohibited keywords (WHOLE WORDS ONLY):
   - Pork/lard/pig (NOT "cotton" or "shirt")
   - CBD/THC/cannabis/marijuana (NOT "bed" or "bedsheet")
   - Vape/e-cigarette (NOT "grape" or "cape")
   - Alcohol/liquor/beer/wine (NOT "alcohol-free" unless it contains actual alcohol)
   - Ivory, narcotics, drugs (NOT "drugstore" unless it's actual narcotics)
   - Israeli origin/markings (NOT "Israel" in other contexts)
   
   IMPORTANT: Only match EXACT prohibited keywords. Textiles, food, electronics are NOT prohibited.
   Examples of FALSE POSITIVES to avoid:
   - "cotton shirts" → NOT prohibited (cotton is a fabric, not pork)
   - "bedsheets" → NOT prohibited (bed is furniture, not cannabis)
   - "kurtas" → NOT prohibited (traditional clothing, not restricted)
   
2. If ANY prohibited item found: Set prohibited=true, confidence=100, add warning, STOP - do NOT calculate savings

**STEP 2 - CLASSIFICATION (only if no prohibited items):**
3. Review the top matching HS codes from the database above - these are pre-filtered and ranked by relevance
4. **CRITICAL**: You MUST select an HS code from the provided database matches above. Do NOT invent or guess HS codes.
5. Choose the match with the HIGHEST confidence score that best describes the item
6. If origin is India, check CEPA eligibility from the provided data
7. Check for any restrictions (alcohol, tobacco require licenses)
8. Provide confidence score based on how well the selected match describes the item (be conservative - only >95% if certain)
9. List all required documents
10. Explain your reasoning clearly, referencing why you chose that specific HS code from the matches

IMPORTANT RULES:
- **MANDATORY**: Prohibited items check comes FIRST - no exceptions
- **MANDATORY**: Use ONLY HS codes from the provided database matches above. The matches are already ranked by relevance.
- If the top match has high confidence (>70%), prefer it over lower-ranked matches
- If item appears to be prohibited, set prohibited=true and confidence=100 - DO NOT show savings
- For restricted items (alcohol, tobacco, etc.), set restricted=true and list authority
- Always include Certificate of Origin in required_documents if CEPA applicable
- Calculate exact savings amounts if CIF value is provided (ONLY if not prohibited)
- If no match seems appropriate, use the highest confidence match but note uncertainty in reasoning

Return your response as a valid JSON object matching this schema:
{
  "hs_code_12_digit": "string (format: XXXX.XX.XX.XXXX)",
  "confidence": "number (0-100)",
  "description_english": "string",
  "description_arabic": "string",
  "category": "string",
  "standard_duty_pct": "number",
  "cepa_applicable": "boolean",
  "cepa_duty_pct": "number",
  "savings_explanation": "string",
  "restricted": "boolean",
  "prohibited": "boolean",
  "warnings": "string[]",
  "required_documents": "string[]",
  "reasoning": "string"
}`;

  return prompt;
}

/**
 * Build search context string from RAG results
 * @param results - Search results from Fuse.js
 * @returns Formatted context string
 */
export function buildSearchContext(results: SearchResult[]): string {
  if (!results || results.length === 0) {
    return 'TOP MATCHING HS CODES FROM DATABASE:\n\nNo matches found in database.';
  }

  let context = 'TOP MATCHING HS CODES FROM DATABASE:\n\n';

  results.forEach((result, index) => {
    context += `${index + 1}. HS Code: ${result.hs_code}\n`;
    context += `   Description (EN): ${result.description_en}\n`;

    if (result.description_ar) {
      context += `   Description (AR): ${result.description_ar}\n`;
    }

    context += `   Category: ${result.category || 'N/A'}\n`;
    context += `   Standard Duty: ${result.gcc_duty_rate ?? 0}%\n`;

    if (result.has_cepa) {
      context += `   CEPA Duty: ${result.cepa_duty_rate ?? 0}%\n`;
      if (result.cepa_schedule) {
        context += `   CEPA Schedule: ${result.cepa_schedule}\n`;
      }
    }

    if (result.has_restrictions) {
      context += `   RESTRICTION: ${result.restriction_type || 'Unknown'}\n`;
      if (result.authority) {
        context += `   Authority: ${result.authority}\n`;
      }
    }

    context += `   Confidence Match: ${(result.confidence * 100).toFixed(1)}%\n\n`;
  });

  return context;
}

/**
 * Create prompt for invoice parsing
 * @param invoiceText - Raw invoice text
 * @returns Prompt for extracting line items
 */
export function createInvoiceParsePrompt(invoiceText: string): string {
  return `You are an expert invoice parser. Extract ONLY the actual product/item lines from this invoice.

INVOICE TEXT:
${invoiceText}

CRITICAL INSTRUCTIONS:
1. Extract ONLY lines that represent actual products/items (not headers, addresses, dates, totals)
2. Look for lines with:
   - Item numbers (1, 2, 3...)
   - Product descriptions (Smartphone, Earbuds, Shirts, Rice, etc.)
   - Quantities (pcs, kg, units, etc.)
   - Prices or amounts (USD, AED, $)
3. IGNORE these lines completely:
   - Invoice headers (Invoice No, Date, Exporter, Importer)
   - Addresses and contact information (PO Box, Street addresses, GSTIN, TRN)
   - Shipping terms and metadata (Port of Loading, Final Destination, Terms)
   - Totals, subtotals, freight, insurance, CIF value lines
   - Separator lines (---)
   - Declarations, certificates, notes
4. Extract description, quantity (if present), and CIF/value (if present) for each product
5. If a line has "HS Code:" on it or the next line, that's fine - just extract the product description

Return your response as a valid JSON array:
[
  {
    "description": "Smartphone, 5G, 256GB, Android",
    "quantity": 200,
    "cifValue": 70000.00
  },
  {
    "description": "Wireless Earbuds, Bluetooth 5.0",
    "quantity": 500,
    "cifValue": 12500.00
  }
]

If no actual product items found, return an empty array [].
ONLY extract actual products - ignore everything else.`;
}

/**
 * Prohibited keywords for initial screening
 */
export const PROHIBITED_KEYWORDS = [
  // Pork products
  'pork', 'lard', 'pig', 'bacon', 'ham', 'swine',
  // Arabic: pork
  'خنزير', 'لحم خنزير',
  // Cannabis/CBD
  'cbd', 'thc', 'cannabis', 'marijuana', 'hemp oil', 'hemp extract',
  // Arabic: cannabis
  'حشيش',
  // Vaping
  'vape', 'vaping', 'e-cigarette', 'e-cig', 'juul', 'vaporizer',
  // Arabic: e-cigarette
  'شيشة إلكترونية', 'سجائر إلكترونية',
  // Alcohol
  'alcohol', 'liquor', 'beer', 'wine', 'whiskey', 'vodka', 'rum', 'gin', 'brandy',
  // Arabic: alcohol
  'خمر', 'كحول',
  // Other prohibited
  'ivory', 'narcotics', 'drugs', 'cocaine', 'heroin', 'opium',
  // Arabic: drugs
  'مخدرات',
  // Israeli origin
  'israel', 'israeli', 'made in israel',
];

/**
 * Restricted keywords requiring special permits
 */
export const RESTRICTED_KEYWORDS = [
  // Tobacco
  'tobacco', 'cigarettes', 'cigars', 'hookah', 'shisha',
  // Firearms/weapons
  'firearm', 'gun', 'ammunition', 'weapon',
  // Pharmaceuticals
  'medicine', 'pharmaceutical', 'prescription drug',
  // Chemicals
  'chemical', 'hazardous', 'explosive',
];

/**
 * Check description for prohibited/restricted keywords
 * @param description - Item description to check
 * @returns Quick scan result
 */
export function quickProhibitedCheck(description: string): {
  hasProhibited: boolean;
  hasRestricted: boolean;
  matchedKeywords: string[];
} {
  const lowerDesc = description.toLowerCase();
  const matchedKeywords: string[] = [];

  let hasProhibited = false;
  let hasRestricted = false;

  // Check prohibited keywords - use word boundary matching to avoid false positives
  for (const keyword of PROHIBITED_KEYWORDS) {
    const keywordLower = keyword.toLowerCase();
    // Use word boundary regex to match whole words only (avoid partial matches)
    // For Arabic keywords, use simple includes since word boundaries don't work well
    const isArabic = /[\u0600-\u06FF]/.test(keyword);
    if (isArabic) {
      if (lowerDesc.includes(keywordLower)) {
        hasProhibited = true;
        matchedKeywords.push(keyword);
      }
    } else {
      // For English keywords, use word boundary to avoid false positives
      // e.g., "cotton" should NOT match "on" in "cotton"
      const wordPattern = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (wordPattern.test(lowerDesc)) {
        hasProhibited = true;
        matchedKeywords.push(keyword);
      }
    }
  }

  // Check restricted keywords - use word boundary matching
  for (const keyword of RESTRICTED_KEYWORDS) {
    const keywordLower = keyword.toLowerCase();
    const wordPattern = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (wordPattern.test(lowerDesc)) {
      hasRestricted = true;
      matchedKeywords.push(keyword);
    }
  }

  return {
    hasProhibited,
    hasRestricted,
    matchedKeywords,
  };
}
