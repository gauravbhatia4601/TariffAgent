/**
 * Enhanced search implementation matching Python knowledge_base_simple.py
 * Uses stop words, category matching, weighted keyword scoring, and confidence calculation
 */

import {
  getAllTariffItems,
  getCEPAItem,
  getProhibitedItems,
  getRestrictedItems,
  normalizeHSCode,
} from './tariff-data';
import type { SearchResult } from './types';

// Stop words to ignore in matching
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'made', 'value', 'aed', 'cif', 'quantity', 'pcs', 'pieces', 'item', 'items', 'product', 'products'
]);

// Category mapping for better matching - comprehensive keywords for each type
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  electronics: [
    'smartphone', 'phone', 'mobile', 'cell', 'earbud', 'earphone', 'headphone', 'bluetooth',
    'wireless', 'electronic', 'device', 'gadget', 'tablet', 'laptop', 'computer', '5g', '4g',
    'storage', 'gb', 'memory', 'charger', 'battery', 'cable', 'adapter', 'speaker', 'audio',
    'video', 'camera', 'monitor', 'television', 'tv', 'led', 'lcd'
  ],
  textiles: [
    'cotton', 'shirt', 't-shirt', 'fabric', 'textile', 'cloth', 'garment', 'apparel', 'clothing',
    'wear', 'knitted', 'woven', 'dress', 'trouser', 'pants', 'blouse', 'jacket', 'sweater',
    'sweatshirt', 'hoodie', 'sock', 'underwear', 'lingerie', 'scarf', 'shawl', 'towel', 'bed',
    'sheet', 'curtain', 'blanket', 'quilt', 'kurta', 'kurtas', 'bedsheet', 'bedsheets', 'printed'
  ],
  food: [
    'rice', 'basmati', 'spice', 'pepper', 'turmeric', 'tea', 'coffee', 'food', 'grain', 'cereal',
    'wheat', 'barley', 'pulse', 'lentil', 'bean', 'chickpea', 'sugar', 'honey', 'oil', 'ghee',
    'butter', 'cheese', 'milk', 'yogurt', 'fruit', 'vegetable', 'nut', 'almond', 'cashew', 'pistachio'
  ],
  spices: [
    'spice', 'pepper', 'turmeric', 'cumin', 'coriander', 'cardamom', 'cinnamon', 'clove', 'nutmeg',
    'saffron', 'ginger', 'garlic', 'onion', 'chili', 'paprika', 'curry', 'masala', 'herb', 'basil',
    'oregano', 'thyme'
  ],
  jewellery: [
    'gold', 'silver', 'diamond', 'jewel', 'jewellery', 'jewelry', 'ring', 'necklace', 'earring',
    'bangle', 'karat', 'carat', 'bracelet', 'pendant', 'chain', 'brooch', 'pin', 'gem', 'precious',
    'stone', 'pearl', 'ruby', 'emerald', 'sapphire', 'platinum', 'titanium'
  ],
  machinery: [
    'machine', 'machinery', 'equipment', 'industrial', 'sewing', 'cutting', 'manufacturing', 'engine',
    'motor', 'pump', 'compressor', 'generator', 'turbine', 'boiler', 'furnace', 'press', 'drill',
    'lathe', 'mill', 'grinder', 'cutter', 'welder', 'tool', 'instrument'
  ],
  plastics: [
    'plastic', 'polymer', 'polyethylene', 'polypropylene', 'pvc', 'polystyrene', 'resin', 'molding',
    'injection', 'extrusion', 'bag', 'container', 'bottle', 'pipe', 'tube', 'sheet', 'film'
  ],
  other: [
    'furniture', 'chair', 'table', 'sofa', 'bed', 'cabinet', 'shelf', 'vehicle', 'car', 'truck',
    'motorcycle', 'bicycle', 'fuel', 'petroleum', 'oil', 'gas', 'chemical', 'pharmaceutical',
    'medicine', 'drug'
  ]
};

// Important keywords that get higher weight
const HIGH_WEIGHT_KEYWORDS = {
  electronics: ['smartphone', 'phone', 'mobile', 'cell', 'earbud', 'earphone', 'headphone', 'bluetooth', 'wireless', '5g', '4g', 'tablet', 'laptop'],
  textiles: ['cotton', 'shirt', 't-shirt', 'dress', 'trouser', 'garment', 'apparel', 'fabric', 'textile', 'knitted', 'woven', 'kurta', 'bedsheet', 'bed', 'sheet'],
  food: ['rice', 'basmati', 'spice', 'pepper', 'turmeric', 'tea', 'coffee', 'cumin', 'coriander', 'cardamom', 'cinnamon'],
  jewellery: ['gold', 'silver', 'diamond', 'jewel', 'jewellery', 'ring', 'necklace', 'earring', 'bangle', 'karat', 'carat'],
  machinery: ['machine', 'machinery', 'equipment', 'industrial', 'sewing', 'cutting', 'engine', 'motor', 'pump']
};

/**
 * Extract meaningful keywords from query
 */
function extractKeywords(query: string): string[] {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/);
  
  return words
    .map(w => w.replace(/[.,!?;:()\[\]{}]/g, ''))
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Determine likely category from query
 */
function detectCategory(query: string): string | null {
  const queryLower = query.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      return category;
    }
  }
  
  return null;
}

/**
 * Calculate keyword weight based on importance
 */
function getKeywordWeight(word: string): number {
  for (const keywords of Object.values(HIGH_WEIGHT_KEYWORDS)) {
    if (keywords.includes(word)) {
      return 4.0;
    }
  }
  return 1.0;
}

/**
 * Search for HS codes using enhanced algorithm matching Python implementation
 *
 * @param query - Search query (English, Arabic, or HS code)
 * @param topK - Number of results to return (default: 5)
 * @param minConfidence - Minimum confidence threshold (0.0 to 1.0, default: 0.0)
 * @returns Array of search results with confidence scores
 */
export async function searchHSCodes(
  query: string,
  topK: number = 5,
  minConfidence: number = 0.0
): Promise<SearchResult[]> {
  const queryLower = query.trim().toLowerCase();
  
  if (!queryLower) {
    return [];
  }

  const results: Array<SearchResult & { score: number }> = [];
  const queryWords = extractKeywords(query);
  const queryCategory = detectCategory(query);

  // Check if query looks like an HS code (numeric with possible dots)
  const isHSCodeQuery = /^[\d.\s-]+$/.test(queryLower.replace(/\s/g, ''));

  // Load tariff items
  const tariffItems = await getAllTariffItems();

  // Exact HS code match
  if (isHSCodeQuery) {
    const normalizedQuery = normalizeHSCode(query);
    const queryPrefix = normalizedQuery.slice(0, 8); // First 8 digits for partial match
    
    for (const item of tariffItems) {
      const normalizedHS = normalizeHSCode(item.hs_code);
      const itemPrefix = normalizedHS.slice(0, 8);
      
      // Exact match or prefix match (for partial HS codes like 6105.10.00 matching 6105.10.00.10.00)
      if (normalizedHS === normalizedQuery || 
          item.hs_code.includes(query) || 
          itemPrefix === queryPrefix ||
          normalizedHS.startsWith(normalizedQuery)) {
        const cepaItem = await getCEPAItem(item.hs_code);
        const prohibitedItems = await getProhibitedItems(item.hs_code);
        const restrictedItems = await getRestrictedItems(item.hs_code);
        
        results.push({
          rank: 1,
          confidence: 100,
          score: 1.0,
          hs_code: item.hs_code,
          description_en: item.description_en,
          description_ar: item.description_ar,
          category: item.category,
          standard_duty_rate: item.standard_duty_rate,
          vat_rate: item.vat_rate,
          unit_of_measure: item.unit_of_measure,
          additional_notes: item.additional_notes,
          has_cepa: cepaItem !== undefined,
          cepa_duty_rate: cepaItem?.cepa_duty_rate,
          cepa_schedule: cepaItem?.phase_out_schedule,
          has_restrictions: prohibitedItems.length > 0 || restrictedItems.length > 0,
          restriction_type: prohibitedItems.length > 0 ? 'prohibited' : (restrictedItems.length > 0 ? 'restricted' : undefined),
        });
        // Don't break - collect all matches for partial codes
        if (normalizedHS === normalizedQuery) break; // Exact match, stop here
      }
    }
  }

  // Description matching with relevance scoring
  for (const item of tariffItems) {
    const descEn = item.description_en.toLowerCase();
    const descAr = item.description_ar?.toLowerCase() || '';
    const itemCategory = item.category.toLowerCase();
    
    let score = 0.0;
    let matchCount = 0;

    // Exact phrase match (highest priority)
    if (descEn.includes(queryLower) || descAr.includes(queryLower)) {
      score += 10.0;
      matchCount = queryWords.length;
    } else {
      // Keyword matching with weights
      for (const word of queryWords) {
        if (word.length < 3) continue;

        // Exact word match
        if (descEn.includes(word) || descAr.includes(word)) {
          matchCount++;
          score += getKeywordWeight(word);
        } else {
          // Try partial match (e.g., "shirt" matching "shirts" or "t-shirt")
          const wordPattern = new RegExp(`\\b${word}\\w*\\b`, 'i');
          if (wordPattern.test(descEn) || wordPattern.test(descAr)) {
            matchCount++;
            score += getKeywordWeight(word) * 0.8; // Slightly lower weight for partial match
          }
        }
      }
    }

    // Category bonus - if query category matches item category
    if (queryCategory && itemCategory.includes(queryCategory)) {
      score += 5.0;
    }

    // Skip items with no matches
    if (matchCount === 0) continue;

    // Calculate confidence based on match quality
    let confidence: number;
    if (matchCount >= queryWords.length * 0.6) {
      // At least 60% of keywords match
      confidence = Math.min(0.3 + (score / 20.0), 0.95);
  } else {
      confidence = Math.min(0.1 + (score / 30.0), 0.7);
    }

    // Only include if we have meaningful matches
    if (score > 0.5 && confidence >= minConfidence) {
      const cepaItem = await getCEPAItem(item.hs_code);
      const prohibitedItems = await getProhibitedItems(item.hs_code);
      const restrictedItems = await getRestrictedItems(item.hs_code);

      results.push({
        rank: results.length + 1,
        confidence: Math.round(confidence * 100),
        score,
        hs_code: item.hs_code,
        description_en: item.description_en,
        description_ar: item.description_ar,
        category: item.category,
        standard_duty_rate: item.standard_duty_rate,
        vat_rate: item.vat_rate,
        unit_of_measure: item.unit_of_measure,
        additional_notes: item.additional_notes,
        has_cepa: cepaItem !== undefined,
        cepa_duty_rate: cepaItem?.cepa_duty_rate,
        cepa_schedule: cepaItem?.phase_out_schedule,
        has_restrictions: prohibitedItems.length > 0 || restrictedItems.length > 0,
        restriction_type: prohibitedItems.length > 0 ? 'prohibited' : (restrictedItems.length > 0 ? 'restricted' : undefined),
      });
    }
  }

  // Sort by score (descending) and filter by min_confidence
  results.sort((a, b) => b.score - a.score);
  
  // Filter by min confidence (convert percentage to 0-1 scale)
  const minConfidencePercent = minConfidence * 100;
  const filtered = results.filter(r => r.confidence >= minConfidencePercent);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return filtered.slice(0, topK).map(({ score, ...result }) => result);
}

/**
 * Search for tariff items by category
 */
export async function searchByCategory(category: string): Promise<SearchResult[]> {
  const tariffItems = await getAllTariffItems();
  const normalizedCategory = category.toLowerCase().trim();
  
  const filtered = tariffItems.filter(item => item.category.toLowerCase() === normalizedCategory);
  
  const results: SearchResult[] = [];
  for (let index = 0; index < filtered.length; index++) {
    const item = filtered[index];
    const cepaItem = await getCEPAItem(item.hs_code);
    const prohibitedItems = await getProhibitedItems(item.hs_code);
    const restrictedItems = await getRestrictedItems(item.hs_code);
    
    results.push({
    rank: index + 1,
      confidence: 100,
    hs_code: item.hs_code,
    description_en: item.description_en,
    description_ar: item.description_ar,
    category: item.category,
    standard_duty_rate: item.standard_duty_rate,
    vat_rate: item.vat_rate,
    unit_of_measure: item.unit_of_measure,
    additional_notes: item.additional_notes,
      has_cepa: cepaItem !== undefined,
      cepa_duty_rate: cepaItem?.cepa_duty_rate,
      cepa_schedule: cepaItem?.phase_out_schedule,
      has_restrictions: prohibitedItems.length > 0 || restrictedItems.length > 0,
      restriction_type: prohibitedItems.length > 0 ? 'prohibited' : (restrictedItems.length > 0 ? 'restricted' : undefined),
    });
  }
  
  return results;
}

/**
 * Get search suggestions based on partial input
 */
export async function getSearchSuggestions(
  partialQuery: string,
  limit: number = 5
): Promise<SearchResult[]> {
  if (partialQuery.trim().length < 2) {
    return [];
  }
  return searchHSCodes(partialQuery, limit);
}
