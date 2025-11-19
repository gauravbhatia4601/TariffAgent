/**
 * Type definitions for TariffAgent data layer
 * Matches structures from gcc_tariff_2025.json, cepa_schedules.json, prohibited_restricted.json
 */

// Base tariff item from GCC tariff data
export interface TariffItem {
  hs_code: string;
  category: string;
  description_en: string;
  description_ar: string;
  standard_duty_rate: number;
  vat_rate: number;
  unit_of_measure: string;
  additional_notes: string | null;
}

// CEPA schedule item with preferential rates
export interface CEPAScheduleItem {
  hs_code: string;
  category: string;
  description_en: string;
  description_ar: string;
  standard_duty_rate: number;
  cepa_duty_rate: number;
  phase_out_schedule: string;
  savings_percentage: number;
  origin_criteria: string;
  indian_competitive_advantage: string;
  notes: string;
}

// Prohibited item structure
export interface ProhibitedItem {
  item_id: string;
  category: string;
  item_name: string;
  description_en: string;
  description_ar: string;
  hs_codes_affected: string[];
  prohibition_level: string;
  penalty: string;
  warning_message: string;
  legal_reference: string;
  exemptions?: string;
  required_permits?: string[];
}

// Restricted item structure
export interface RestrictedItem {
  item_id: string;
  category: string;
  item_name: string;
  description_en: string;
  description_ar: string;
  hs_codes_affected: string[];
  restriction_level: string;
  penalty: string;
  warning_message: string;
  required_permits?: string[];
  issuing_authority?: string;
  personal_allowance?: string;
  additional_requirements?: string[];
  notes?: string;
}

// Search result from Fuse.js
export interface SearchResult {
  rank: number;
  confidence: number;
  hs_code: string;
  description_en: string;
  description_ar: string;
  category: string;
  standard_duty_rate: number;
  vat_rate: number;
  unit_of_measure: string;
  additional_notes: string | null;
  has_cepa: boolean;
  cepa_duty_rate?: number;
  cepa_schedule?: string;
  has_restrictions: boolean;
  restriction_type?: string;
}

// CEPA benefit calculation result
export interface CEPABenefitResult {
  eligible: boolean;
  standardDuty: number;
  cepaDuty: number;
  savingsPercent: number;
  originRequirements?: string;
  phaseOutSchedule?: string;
  notes?: string;
}

// CEPA savings calculation result
export interface CEPASavingsResult {
  standardDutyAmount: number;
  cepaDutyAmount: number;
  savingsAmount: number;
  savingsExplanation: string;
}

// Prohibited/restricted check result
export interface ProhibitedCheckResult {
  prohibited: boolean;
  restricted: boolean;
  warnings: string[];
  requiredPermits: string[];
  matchedKeywords: string[];
  matchedItems: Array<{
    type: 'prohibited' | 'restricted';
    itemName: string;
    description: string;
    penalty: string;
    warningMessage: string;
  }>;
}

// Unified search and enrich result
export interface SearchAndEnrichResult {
  searchResults: SearchResult[];
  cepaEligible: boolean;
  restrictions: {
    prohibited: boolean;
    restricted: boolean;
    warnings: string[];
  };
}

// Complete item information
export interface CompleteItemInfo {
  found: boolean;
  hs_code: string;
  description_en?: string;
  description_ar?: string;
  category?: string;
  unit_of_measure?: string;
  tariff_info?: {
    standard_duty_rate: number;
    cepa_duty_rate: number;
    has_cepa_benefit: boolean;
    savings_percent: number;
  };
  cepa_info?: CEPABenefitResult | null;
  restriction_info?: ProhibitedCheckResult;
  message?: string;
}

// JSON file structures
export interface GCCTariffJSON {
  metadata: {
    version: string;
    effective_date: string;
    source: string;
    currency: string;
    description: string;
    last_updated: string;
  };
  tariff_items: TariffItem[];
}

export interface CEPASchedulesJSON {
  metadata: {
    agreement_name: string;
    effective_date: string;
    version: string;
    description: string;
    coverage: string;
    trade_volume_target: string;
    last_updated: string;
  };
  general_provisions: {
    origin_requirement: string;
    documentation: string[];
    value_addition_requirement: string;
    cumulation: string;
    direct_consignment: string;
  };
  cepa_items: CEPAScheduleItem[];
}

export interface ProhibitedRestrictedJSON {
  metadata: {
    version: string;
    effective_date: string;
    authority: string;
    description: string;
    source: string;
    last_updated: string;
    important_note: string;
  };
  prohibited_items: ProhibitedItem[];
  restricted_items: RestrictedItem[];
  red_flag_keywords: {
    description: string;
    keywords: string[];
    action_on_detection: string;
  };
}
