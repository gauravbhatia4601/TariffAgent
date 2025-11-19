/**
 * Validation Utilities for TariffAgent
 * Custom validators for HS codes, CIF values, and origin countries
 */

import { z } from 'zod';

/**
 * HS Code format patterns
 */
export const HS_CODE_PATTERNS = {
  /** Full 12-digit format: XXXX.XX.XX.XXXX */
  FULL_12_DIGIT: /^\d{4}\.\d{2}\.\d{2}\.\d{4}$/,
  /** 12 digits without dots */
  DIGITS_ONLY_12: /^\d{12}$/,
  /** 8-digit format: XXXX.XX.XX */
  EIGHT_DIGIT: /^\d{4}\.\d{2}\.\d{2}$/,
  /** 6-digit format: XXXX.XX */
  SIX_DIGIT: /^\d{4}\.\d{2}$/,
  /** 4-digit chapter: XXXX */
  FOUR_DIGIT: /^\d{4}$/,
  /** Any valid format */
  ANY_VALID: /^\d{4}(\.\d{2}){0,3}$|^\d{4,12}$/,
};

/**
 * Normalize HS code to standard 12-digit format (XXXX.XX.XX.XXXX)
 * @param hsCode - HS code in any valid format
 * @returns Normalized 12-digit HS code with dots
 * @throws Error if format is invalid
 */
export function normalizeHSCode(hsCode: string): string {
  // Remove spaces and extra formatting
  const cleaned = hsCode.trim().replace(/\s+/g, '');

  // Extract only digits
  const digits = cleaned.replace(/[^\d]/g, '');

  // Validate digit count
  if (digits.length < 4) {
    throw new Error(
      `Invalid HS code: ${hsCode}. Must have at least 4 digits.`
    );
  }

  if (digits.length > 12) {
    throw new Error(
      `Invalid HS code: ${hsCode}. Cannot exceed 12 digits.`
    );
  }

  // Pad to 12 digits if needed
  const padded = digits.padEnd(12, '0');

  // Format as XXXX.XX.XX.XXXX
  return `${padded.slice(0, 4)}.${padded.slice(4, 6)}.${padded.slice(6, 8)}.${padded.slice(8, 12)}`;
}

/**
 * Validate HS code format
 * @param hsCode - HS code to validate
 * @returns true if valid, false otherwise
 */
export function isValidHSCode(hsCode: string): boolean {
  try {
    normalizeHSCode(hsCode);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract HS code chapter (first 2 digits)
 * @param hsCode - HS code in any format
 * @returns 2-digit chapter code
 */
export function getHSCodeChapter(hsCode: string): string {
  const normalized = normalizeHSCode(hsCode);
  return normalized.slice(0, 2);
}

/**
 * Extract HS code heading (first 4 digits)
 * @param hsCode - HS code in any format
 * @returns 4-digit heading code
 */
export function getHSCodeHeading(hsCode: string): string {
  const normalized = normalizeHSCode(hsCode);
  return normalized.slice(0, 4);
}

/**
 * Zod schema for HS code validation with auto-normalization
 */
export const HSCodeSchema = z.string().transform((val, ctx) => {
  try {
    return normalizeHSCode(val);
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: error instanceof Error ? error.message : 'Invalid HS code format',
    });
    return z.NEVER;
  }
});

/**
 * Valid origin countries (with CEPA status)
 */
export const VALID_ORIGIN_COUNTRIES = [
  { code: 'IN', name: 'India', hasCEPA: true },
  { code: 'CN', name: 'China', hasCEPA: false },
  { code: 'US', name: 'United States', hasCEPA: false },
  { code: 'DE', name: 'Germany', hasCEPA: false },
  { code: 'JP', name: 'Japan', hasCEPA: false },
  { code: 'KR', name: 'South Korea', hasCEPA: false },
  { code: 'IT', name: 'Italy', hasCEPA: false },
  { code: 'FR', name: 'France', hasCEPA: false },
  { code: 'GB', name: 'United Kingdom', hasCEPA: false },
  { code: 'TR', name: 'Turkey', hasCEPA: false },
  { code: 'TH', name: 'Thailand', hasCEPA: false },
  { code: 'VN', name: 'Vietnam', hasCEPA: false },
  { code: 'MY', name: 'Malaysia', hasCEPA: false },
  { code: 'ID', name: 'Indonesia', hasCEPA: false },
  { code: 'PK', name: 'Pakistan', hasCEPA: false },
  { code: 'BD', name: 'Bangladesh', hasCEPA: false },
  { code: 'EG', name: 'Egypt', hasCEPA: false },
  { code: 'SA', name: 'Saudi Arabia', hasCEPA: false },
] as const;

/**
 * Country name aliases for flexible matching
 */
const COUNTRY_ALIASES: Record<string, string> = {
  'india': 'India',
  'in': 'India',
  'ind': 'India',
  'china': 'China',
  'cn': 'China',
  'chn': 'China',
  'united states': 'United States',
  'usa': 'United States',
  'us': 'United States',
  'germany': 'Germany',
  'de': 'Germany',
  'deu': 'Germany',
  'japan': 'Japan',
  'jp': 'Japan',
  'jpn': 'Japan',
  'uk': 'United Kingdom',
  'gb': 'United Kingdom',
  'united kingdom': 'United Kingdom',
  'britain': 'United Kingdom',
};

/**
 * Normalize country name to standard format
 * @param country - Country name or code
 * @returns Normalized country name
 */
export function normalizeCountryName(country: string): string {
  const normalized = country.trim().toLowerCase();

  // Check aliases first
  if (COUNTRY_ALIASES[normalized]) {
    return COUNTRY_ALIASES[normalized];
  }

  // Check against valid countries
  const found = VALID_ORIGIN_COUNTRIES.find(
    c => c.name.toLowerCase() === normalized || c.code.toLowerCase() === normalized
  );

  if (found) {
    return found.name;
  }

  // Return original with title case if not found
  return country.trim().split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if country has CEPA benefits
 * @param country - Country name or code
 * @returns true if country has CEPA benefits
 */
export function hasCEPABenefits(country: string): boolean {
  const normalized = normalizeCountryName(country);
  const found = VALID_ORIGIN_COUNTRIES.find(c => c.name === normalized);
  return found?.hasCEPA ?? false;
}

/**
 * Validate origin country
 * @param country - Country to validate
 * @returns true if valid
 */
export function isValidOriginCountry(country: string): boolean {
  try {
    const normalized = normalizeCountryName(country);
    return normalized.length > 0;
  } catch {
    return false;
  }
}

/**
 * Zod schema for origin country validation
 */
export const OriginCountrySchema = z.string()
  .min(1, 'Origin country is required')
  .transform((val) => normalizeCountryName(val));

/**
 * CIF Value validation constants
 */
export const CIF_VALUE_LIMITS = {
  /** Minimum CIF value */
  MIN: 0.01,
  /** Maximum CIF value (100 million AED) */
  MAX: 100_000_000,
  /** Maximum decimal places */
  DECIMAL_PLACES: 2,
};

/**
 * Validate CIF value
 * @param value - CIF value to validate
 * @returns Validation result
 */
export function validateCIFValue(value: number): {
  valid: boolean;
  error?: string;
  normalized?: number;
} {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: 'CIF value must be a number' };
  }

  if (value < CIF_VALUE_LIMITS.MIN) {
    return {
      valid: false,
      error: `CIF value must be at least ${CIF_VALUE_LIMITS.MIN} AED`,
    };
  }

  if (value > CIF_VALUE_LIMITS.MAX) {
    return {
      valid: false,
      error: `CIF value cannot exceed ${CIF_VALUE_LIMITS.MAX.toLocaleString()} AED`,
    };
  }

  // Round to 2 decimal places
  const normalized = Math.round(value * 100) / 100;

  return { valid: true, normalized };
}

/**
 * Zod schema for CIF value validation
 */
export const CIFValueSchema = z.number()
  .min(CIF_VALUE_LIMITS.MIN, `CIF value must be at least ${CIF_VALUE_LIMITS.MIN} AED`)
  .max(CIF_VALUE_LIMITS.MAX, `CIF value cannot exceed ${CIF_VALUE_LIMITS.MAX.toLocaleString()} AED`)
  .transform((val) => Math.round(val * 100) / 100);

/**
 * Zod schema for optional CIF value
 */
export const OptionalCIFValueSchema = z.number()
  .min(CIF_VALUE_LIMITS.MIN)
  .max(CIF_VALUE_LIMITS.MAX)
  .transform((val) => Math.round(val * 100) / 100)
  .optional();

/**
 * Format CIF value for display
 * @param value - CIF value in AED
 * @returns Formatted string
 */
export function formatCIFValue(value: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Combined validation schema for classification requests
 */
export const ClassificationRequestValidator = z.object({
  description: z.string().min(1, 'Item description is required').max(1000),
  origin_country: OriginCountrySchema,
  cif_value: OptionalCIFValueSchema,
});

/**
 * Validate a complete classification request
 */
export function validateClassificationRequest(request: {
  description: string;
  origin_country: string;
  cif_value?: number;
}) {
  return ClassificationRequestValidator.safeParse(request);
}

/**
 * Sanitize item description
 * Removes potentially harmful characters while preserving meaning
 */
export function sanitizeDescription(description: string): string {
  return description
    .trim()
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Limit length
    .slice(0, 1000);
}
