/**
 * Data Layer Index
 * Central export for all TariffAgent data functions
 * Provides unified search and data access
 */

// Export types
export type {
  TariffItem,
  CEPAScheduleItem,
  ProhibitedItem,
  RestrictedItem,
  SearchResult,
  CEPABenefitResult,
  CEPASavingsResult,
  ProhibitedCheckResult,
  SearchAndEnrichResult,
  CompleteItemInfo,
} from './types';

// Export from tariff-data
export {
  // Data access functions (all async)
  getTariffItem,
  getCEPAItem,
  getProhibitedItems,
  getRestrictedItems,
  getAllTariffItems,
  preloadAllData,
  // Utility functions
  normalizeHSCode,
  formatHSCode,
  checkProhibitedRestricted,
} from './tariff-data';

// Export from search
export {
  searchHSCodes,
  searchByCategory,
  searchMultipleTerms,
  searchCEPAEligibleItems,
  getSearchSuggestions,
  resetSearchIndex,
} from './search';

// Export from cepa-lookup
export {
  getCEPABenefit,
  calculateCEPASavings,
  isCEPAEligibleCountry,
  hasCEPABenefitForIndia,
  getCEPADocumentationRequirements,
  getCEPAValueAdditionRequirement,
  getCEPAOriginRequirement,
  getCEPADirectConsignmentRequirement,
  getCEPABenefitExplanation,
  calculateBulkCEPASavings,
} from './cepa-lookup';

// Export from prohibited-check
export {
  checkProhibited,
  isProhibitedKeyword,
  getRestrictionDetails,
  checkRestrictionsByHSCode,
  findRedFlagKeywords,
  getAllRedFlagKeywords,
  checkMultipleItems,
  formatProhibitionWarning,
  quickCheck,
} from './prohibited-check';

// Import for unified function
import { searchHSCodes } from './search';
import { getCEPABenefit, isCEPAEligibleCountry } from './cepa-lookup';
import { checkProhibited } from './prohibited-check';
import { getTariffItem, getCEPAItem, getProhibitedItems, getRestrictedItems, checkProhibitedRestricted } from './tariff-data';
import type { SearchAndEnrichResult, CompleteItemInfo } from './types';

/**
 * Unified search that combines all data sources
 * Returns search results enriched with CEPA and restriction info
 *
 * @param query - Search query
 * @param originCountry - Country of origin for CEPA check
 * @param topK - Number of results to return
 * @returns Enriched search results with CEPA eligibility and restrictions
 */
export async function searchAndEnrich(
  query: string,
  originCountry: string = 'India',
  topK: number = 5
): Promise<SearchAndEnrichResult> {
  // Perform search
  const searchResults = await searchHSCodes(query, topK);

  // Check CEPA eligibility for first result
  const cepaEligible = searchResults.length > 0
    ? isCEPAEligibleCountry(originCountry) && searchResults[0].has_cepa
    : false;

  // Check restrictions based on query
  const restrictions = checkProhibited(query);

  return {
    searchResults,
    cepaEligible,
    restrictions: {
      prohibited: restrictions.prohibited,
      restricted: restrictions.restricted,
      warnings: restrictions.warnings,
    },
  };
}

/**
 * Get complete information for an HS code
 * Combines tariff, CEPA, and restriction data
 *
 * @param hsCode - HS code to lookup
 * @param originCountry - Country of origin for CEPA calculation
 * @returns Complete item information
 */
export async function getCompleteInfo(
  hsCode: string,
  originCountry: string = 'India'
): Promise<CompleteItemInfo> {
  const tariffItem = await getTariffItem(hsCode);

  if (!tariffItem) {
    return {
      found: false,
      hs_code: hsCode,
      message: 'HS code not found in database',
    };
  }

  const cepaInfo = getCEPABenefit(hsCode, originCountry);
  const restrictionCheck = checkProhibited(tariffItem.description_en);

  // Also check by HS code for restrictions
  await getProhibitedItems(hsCode);
  await getRestrictedItems(hsCode);
  
  // Check prohibited/restricted keywords in description
  const keywordCheck = await checkProhibitedRestricted(tariffItem.description_en);

  // Merge restriction info from keyword check
  if (keywordCheck.prohibited) {
    restrictionCheck.prohibited = true;
    keywordCheck.prohibited_items.forEach((item) => {
      if (!restrictionCheck.warnings.includes(item.warning)) {
        restrictionCheck.warnings.push(item.warning);
      }
    });
  }

  if (keywordCheck.restricted) {
    restrictionCheck.restricted = true;
    keywordCheck.restricted_items.forEach((item) => {
      if (!restrictionCheck.warnings.includes(item.warning)) {
        restrictionCheck.warnings.push(item.warning);
      }
    });
  }

  return {
    found: true,
    hs_code: hsCode,
    description_en: tariffItem.description_en,
    description_ar: tariffItem.description_ar,
    category: tariffItem.category,
    unit_of_measure: tariffItem.unit_of_measure,
    tariff_info: {
      standard_duty_rate: tariffItem.standard_duty_rate,
      cepa_duty_rate: cepaInfo?.cepaDuty || tariffItem.standard_duty_rate,
      has_cepa_benefit: cepaInfo?.eligible || false,
      savings_percent: cepaInfo?.savingsPercent || 0,
    },
    cepa_info: cepaInfo,
    restriction_info: restrictionCheck,
  };
}

/**
 * Quick lookup for API responses
 * Returns minimal data for performance
 *
 * @param hsCode - HS code to lookup
 * @returns Quick lookup result
 */
export async function quickLookup(hsCode: string): Promise<{
  found: boolean;
  hs_code: string;
  description?: string;
  duty_rate?: number;
  has_cepa?: boolean;
  has_restrictions?: boolean;
}> {
  const tariffItem = await getTariffItem(hsCode);

  if (!tariffItem) {
    return {
      found: false,
      hs_code: hsCode,
    };
  }

  const cepaItem = await getCEPAItem(hsCode);
  const prohibitedItems = await getProhibitedItems(hsCode);
  const restrictedItems = await getRestrictedItems(hsCode);

  return {
    found: true,
    hs_code: hsCode,
    description: tariffItem.description_en,
    duty_rate: tariffItem.standard_duty_rate,
    has_cepa: cepaItem !== undefined,
    has_restrictions: prohibitedItems.length > 0 || restrictedItems.length > 0,
  };
}

/**
 * Classify an item based on description
 * Returns best matching HS code with confidence
 *
 * @param description - Item description
 * @param originCountry - Origin country for CEPA
 * @returns Classification result
 */
export async function classifyItem(
  description: string,
  originCountry: string = 'India'
): Promise<{
  hs_code: string | null;
  confidence: number;
  description_en: string | null;
  duty_rate: number | null;
  cepa_eligible: boolean;
  restrictions: {
    prohibited: boolean;
    restricted: boolean;
    warnings: string[];
  };
}> {
  const enriched = await searchAndEnrich(description, originCountry, 1);

  if (enriched.searchResults.length === 0) {
    return {
      hs_code: null,
      confidence: 0,
      description_en: null,
      duty_rate: null,
      cepa_eligible: false,
      restrictions: enriched.restrictions,
    };
  }

  const topResult = enriched.searchResults[0];

  return {
    hs_code: topResult.hs_code,
    confidence: topResult.confidence,
    description_en: topResult.description_en,
    duty_rate: topResult.standard_duty_rate,
    cepa_eligible: enriched.cepaEligible,
    restrictions: enriched.restrictions,
  };
}
