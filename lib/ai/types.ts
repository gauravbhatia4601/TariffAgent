/**
 * Type definitions for TariffAgent AI Classification Service
 */

import { z } from 'zod';

/**
 * Schema for validating HS code classification results
 */
export const HSCodeClassificationSchema = z.object({
  hs_code_12_digit: z.string().regex(
    /^\d{4}\.\d{2}\.\d{2}\.\d{4}$/,
    'HS code must be in format XXXX.XX.XX.XXXX'
  ),
  confidence: z.number().min(0).max(100),
  description_english: z.string(),
  description_arabic: z.string().default(''),
  category: z.string(),
  standard_duty_pct: z.number().min(0),
  cepa_applicable: z.boolean(),
  cepa_duty_pct: z.number().min(0),
  savings_explanation: z.string(),
  restricted: z.boolean(),
  prohibited: z.boolean(),
  warnings: z.array(z.string()).default([]),
  required_documents: z.array(z.string()).default([]),
  reasoning: z.string(),
});

export type HSCodeClassification = z.infer<typeof HSCodeClassificationSchema>;

/**
 * Schema for invoice classification results
 */
export const InvoiceClassificationSchema = z.object({
  items: z.array(HSCodeClassificationSchema),
  total_standard_duty: z.number().min(0),
  total_cepa_duty: z.number().min(0),
  total_savings: z.number().min(0),
  invoice_summary: z.string(),
});

export type InvoiceClassification = z.infer<typeof InvoiceClassificationSchema>;

/**
 * Search result from Fuse.js HS code search
 */
export interface SearchResult {
  hs_code: string;
  description_en: string;
  description_ar?: string;
  category?: string;
  gcc_duty_rate?: number;
  cepa_duty_rate?: number;
  cepa_schedule?: string;
  has_cepa?: boolean;
  has_restrictions?: boolean;
  restriction_type?: string;
  authority?: string;
  notes?: string;
  confidence: number;
}

/**
 * CEPA benefit information
 */
export interface CEPABenefit {
  found: boolean;
  hs_code: string;
  origin_country: string;
  cepa_duty_rate: number;
  cepa_schedule?: string;
  notes?: string;
}

/**
 * Prohibited/restricted check result
 */
export interface RestrictionCheck {
  prohibited: boolean;
  restricted: boolean;
  warnings: string[];
  restriction_type?: string;
  authority?: string;
}

/**
 * Parsed invoice line item
 */
export interface InvoiceLineItem {
  description: string;
  quantity?: number;
  cifValue?: number;
}

/**
 * Classification request input
 */
export interface ClassificationRequest {
  description: string;
  originCountry?: string;
  cifValue?: number;
}

/**
 * Invoice classification request
 */
export interface InvoiceClassificationRequest {
  invoiceText: string;
  originCountry?: string;
}

/**
 * Gemini API response structure (before validation)
 */
export interface GeminiClassificationResponse {
  hs_code_12_digit: string;
  confidence: number;
  description_english: string;
  description_arabic?: string;
  category: string;
  standard_duty_pct: number;
  cepa_applicable: boolean;
  cepa_duty_pct: number;
  savings_explanation: string;
  restricted: boolean;
  prohibited: boolean;
  warnings?: string[];
  required_documents?: string[];
  reasoning: string;
}

/**
 * Classification error types
 */
export type ClassificationErrorType =
  | 'API_ERROR'
  | 'VALIDATION_ERROR'
  | 'NO_RESULTS'
  | 'RATE_LIMIT'
  | 'UNKNOWN';

/**
 * Classification error
 */
export class ClassificationError extends Error {
  constructor(
    message: string,
    public readonly type: ClassificationErrorType,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ClassificationError';
  }
}
