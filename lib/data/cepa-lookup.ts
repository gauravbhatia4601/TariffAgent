/**
 * CEPA (Comprehensive Economic Partnership Agreement) benefit lookup
 * Calculates duty savings for India-origin goods
 */

import {
  getTariffItem,
  getCEPAItem,
  cepaGeneralProvisions,
} from './tariff-data';
import type { CEPABenefitResult, CEPASavingsResult } from './types';

// CEPA-eligible origin countries
const CEPA_ELIGIBLE_COUNTRIES = ['india', 'in', 'ind', 'republic of india'];

/**
 * Check if a country is eligible for CEPA benefits
 *
 * @param originCountry - Country name or code
 * @returns True if eligible for CEPA
 */
export function isCEPAEligibleCountry(originCountry: string): boolean {
  return CEPA_ELIGIBLE_COUNTRIES.includes(originCountry.toLowerCase().trim());
}

/**
 * Get CEPA benefit information for an HS code
 * Returns eligibility, duty rates, and savings
 *
 * @param hsCode - HS code to lookup
 * @param originCountry - Country of origin (must be India for CEPA)
 * @returns CEPA benefit information or null if not found
 */
export function getCEPABenefit(
  hsCode: string,
  originCountry: string
): CEPABenefitResult | null {
  // Check if country is CEPA-eligible (India)
  const isEligibleCountry = isCEPAEligibleCountry(originCountry);

  // Get base tariff item
  const tariffItem = getTariffItem(hsCode);
  if (!tariffItem) {
    return null;
  }

  // Get CEPA item if exists
  const cepaItem = getCEPAItem(hsCode);

  // Standard duty rate from GCC tariff
  const standardDuty = tariffItem.standard_duty_rate;

  // If country is not eligible for CEPA, return no benefit
  if (!isEligibleCountry) {
    return {
      eligible: false,
      standardDuty,
      cepaDuty: standardDuty, // Same as standard
      savingsPercent: 0,
      originRequirements: 'CEPA benefits only available for goods originating from India',
    };
  }

  // If no CEPA item exists for this HS code
  if (!cepaItem) {
    return {
      eligible: false,
      standardDuty,
      cepaDuty: standardDuty,
      savingsPercent: 0,
      originRequirements: 'This HS code is not covered under CEPA preferential tariff',
    };
  }

  // Calculate savings
  const cepaDuty = cepaItem.cepa_duty_rate;
  const savingsPercent = standardDuty - cepaDuty;

  return {
    eligible: true,
    standardDuty,
    cepaDuty,
    savingsPercent,
    originRequirements: cepaItem.origin_criteria,
    phaseOutSchedule: cepaItem.phase_out_schedule,
    notes: cepaItem.notes,
  };
}

/**
 * Calculate CEPA duty savings in monetary terms
 *
 * @param hsCode - HS code of the product
 * @param originCountry - Country of origin
 * @param cifValue - CIF (Cost, Insurance, Freight) value in AED
 * @returns Calculated savings with explanation
 */
export function calculateCEPASavings(
  hsCode: string,
  originCountry: string,
  cifValue: number
): CEPASavingsResult {
  const benefit = getCEPABenefit(hsCode, originCountry);

  if (!benefit) {
    return {
      standardDutyAmount: 0,
      cepaDutyAmount: 0,
      savingsAmount: 0,
      savingsExplanation: `HS code ${hsCode} not found in database`,
    };
  }

  // Calculate duty amounts
  const standardDutyAmount = (cifValue * benefit.standardDuty) / 100;
  const cepaDutyAmount = (cifValue * benefit.cepaDuty) / 100;
  const savingsAmount = standardDutyAmount - cepaDutyAmount;

  // Build explanation
  let savingsExplanation: string;

  if (!benefit.eligible) {
    if (!isCEPAEligibleCountry(originCountry)) {
      savingsExplanation = `No CEPA benefit available. Goods must originate from India to qualify for preferential tariff. Standard duty of ${benefit.standardDuty}% applies.`;
    } else {
      savingsExplanation = `This product (HS ${hsCode}) is not covered under CEPA preferential schedule. Standard GCC duty of ${benefit.standardDuty}% applies.`;
    }
  } else if (savingsAmount > 0) {
    savingsExplanation = `CEPA benefit available! Import from India qualifies for reduced duty of ${benefit.cepaDuty}% instead of standard ${benefit.standardDuty}%. You save AED ${savingsAmount.toFixed(2)} on this shipment (${benefit.savingsPercent}% reduction).`;

    if (benefit.phaseOutSchedule) {
      savingsExplanation += ` Schedule: ${benefit.phaseOutSchedule}.`;
    }

    if (benefit.originRequirements) {
      savingsExplanation += ` Origin requirement: ${benefit.originRequirements}.`;
    }
  } else {
    savingsExplanation = `This product already has zero duty under CEPA for India-origin goods.`;
  }

  return {
    standardDutyAmount,
    cepaDutyAmount,
    savingsAmount,
    savingsExplanation,
  };
}

/**
 * Get CEPA documentation requirements
 *
 * @returns Required documents for CEPA clearance
 */
export function getCEPADocumentationRequirements(): string[] {
  return cepaGeneralProvisions.documentation;
}

/**
 * Get CEPA value addition requirement
 *
 * @returns Value addition requirement description
 */
export function getCEPAValueAdditionRequirement(): string {
  return cepaGeneralProvisions.value_addition_requirement;
}

/**
 * Get CEPA origin requirement
 *
 * @returns Origin requirement description
 */
export function getCEPAOriginRequirement(): string {
  return cepaGeneralProvisions.origin_requirement;
}

/**
 * Get CEPA direct consignment requirement
 *
 * @returns Direct consignment requirement description
 */
export function getCEPADirectConsignmentRequirement(): string {
  return cepaGeneralProvisions.direct_consignment;
}

/**
 * Check if HS code has CEPA benefit for India
 *
 * @param hsCode - HS code to check
 * @returns True if CEPA benefit exists
 */
export function hasCEPABenefitForIndia(hsCode: string): boolean {
  const cepaItem = getCEPAItem(hsCode);
  return cepaItem !== undefined && cepaItem.cepa_duty_rate < cepaItem.standard_duty_rate;
}

/**
 * Get CEPA savings summary for multiple HS codes
 *
 * @param items - Array of {hsCode, cifValue} objects
 * @param originCountry - Country of origin
 * @returns Total savings summary
 */
export function calculateBulkCEPASavings(
  items: Array<{ hsCode: string; cifValue: number }>,
  originCountry: string
): {
  totalStandardDuty: number;
  totalCEPADuty: number;
  totalSavings: number;
  itemDetails: Array<{
    hsCode: string;
    cifValue: number;
    standardDutyAmount: number;
    cepaDutyAmount: number;
    savingsAmount: number;
    eligible: boolean;
  }>;
} {
  let totalStandardDuty = 0;
  let totalCEPADuty = 0;
  let totalSavings = 0;

  const itemDetails = items.map((item) => {
    const savings = calculateCEPASavings(item.hsCode, originCountry, item.cifValue);
    const benefit = getCEPABenefit(item.hsCode, originCountry);

    totalStandardDuty += savings.standardDutyAmount;
    totalCEPADuty += savings.cepaDutyAmount;
    totalSavings += savings.savingsAmount;

    return {
      hsCode: item.hsCode,
      cifValue: item.cifValue,
      standardDutyAmount: savings.standardDutyAmount,
      cepaDutyAmount: savings.cepaDutyAmount,
      savingsAmount: savings.savingsAmount,
      eligible: benefit?.eligible || false,
    };
  });

  return {
    totalStandardDuty,
    totalCEPADuty,
    totalSavings,
    itemDetails,
  };
}

/**
 * Get formatted CEPA benefit explanation
 *
 * @param hsCode - HS code
 * @param originCountry - Country of origin
 * @returns Formatted explanation string
 */
export function getCEPABenefitExplanation(
  hsCode: string,
  originCountry: string
): string {
  const benefit = getCEPABenefit(hsCode, originCountry);

  if (!benefit) {
    return `HS code ${hsCode} not found in the tariff database.`;
  }

  if (!benefit.eligible) {
    if (!isCEPAEligibleCountry(originCountry)) {
      return `CEPA benefits are only available for goods originating from India under the UAE-India Comprehensive Economic Partnership Agreement. For goods from ${originCountry}, the standard GCC duty rate of ${benefit.standardDuty}% applies.`;
    }
    return `This product (HS ${hsCode}) is not included in the CEPA preferential tariff schedule. The standard GCC duty rate of ${benefit.standardDuty}% applies.`;
  }

  let explanation = `Under CEPA, goods with HS code ${hsCode} originating from India qualify for preferential duty treatment.\n\n`;
  explanation += `- Standard GCC duty: ${benefit.standardDuty}%\n`;
  explanation += `- CEPA preferential duty: ${benefit.cepaDuty}%\n`;
  explanation += `- Duty savings: ${benefit.savingsPercent}%\n`;

  if (benefit.phaseOutSchedule) {
    explanation += `\nSchedule: ${benefit.phaseOutSchedule}`;
  }

  if (benefit.originRequirements) {
    explanation += `\n\nOrigin requirement: ${benefit.originRequirements}`;
  }

  explanation += `\n\nRequired documentation:\n`;
  getCEPADocumentationRequirements().forEach((doc) => {
    explanation += `- ${doc}\n`;
  });

  return explanation;
}
