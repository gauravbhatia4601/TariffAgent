/**
 * TariffAgent AI Classification Service
 *
 * Main exports for AI-powered HS code classification using Google Gemini API.
 * This module provides:
 * - Single item classification
 * - Invoice/batch classification
 * - Gemini client utilities
 * - Prompt templates
 * - Fallback classification
 *
 * @example
 * ```typescript
 * import { classifyItem, classifyInvoice } from '@/lib/ai';
 *
 * // Classify single item
 * const result = await classifyItem(
 *   'Cotton t-shirts from India',
 *   'India',
 *   1000
 * );
 *
 * // Classify invoice
 * const invoiceResult = await classifyInvoice(invoiceText, 'India');
 * ```
 */

// Main classification functions
export {
  classifyItem,
  classifyInvoice,
  getCEPABenefit,
  checkProhibited,
} from './classifier';

// Gemini client utilities
export {
  generateContent,
  generateWithVision,
  getModel,
  testConnection,
  getModelConfig,
} from './gemini-client';

// Prompt utilities
export {
  SYSTEM_PROMPT,
  createClassificationPrompt,
  buildSearchContext,
  createInvoiceParsePrompt,
  quickProhibitedCheck,
  PROHIBITED_KEYWORDS,
  RESTRICTED_KEYWORDS,
} from './prompts';

// Fallback classification
export {
  fallbackClassification,
  errorFallbackClassification,
} from './fallback';

// Types
export type {
  HSCodeClassification,
  InvoiceClassification,
  SearchResult,
  CEPABenefit,
  RestrictionCheck,
  InvoiceLineItem,
  ClassificationRequest,
  InvoiceClassificationRequest,
  GeminiClassificationResponse,
  ClassificationErrorType,
} from './types';

// Schemas and error class
export {
  HSCodeClassificationSchema,
  InvoiceClassificationSchema,
  ClassificationError,
} from './types';
