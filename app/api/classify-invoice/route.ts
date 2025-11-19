/**
 * Invoice Classification API Route
 * POST /api/classify-invoice
 *
 * Classifies all items in an invoice and returns aggregate results
 * with total duties, CEPA savings, and summary.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { classifyInvoice } from '@/lib/ai';
import { ClassificationError } from '@/lib/ai/types';

// Request validation schema
const ClassifyInvoiceRequestSchema = z.object({
  invoice_text: z.string()
    .min(1, 'Invoice text is required')
    .max(50000, 'Invoice text too long (max 50,000 characters)'),
  origin_country: z.string()
    .min(1, 'Origin country is required')
    .default('India'),
});

export type ClassifyInvoiceRequest = z.infer<typeof ClassifyInvoiceRequestSchema>;

// Response type
interface ClassifyInvoiceResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  error_type?: string;
}

/**
 * POST /api/classify-invoice
 * Classify all items in an invoice
 */
export async function POST(request: NextRequest): Promise<NextResponse<ClassifyInvoiceResponse>> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validationResult = ClassifyInvoiceRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      return NextResponse.json({
        success: false,
        error: `Validation error: ${errorMessage}`,
        error_type: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    const validated = validationResult.data;

    // Perform invoice classification
    const result = await classifyInvoice(
      validated.invoice_text,
      validated.origin_country
    );

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    // Handle classification errors
    if (error instanceof ClassificationError) {
      const statusCode = error.type === 'RATE_LIMIT' ? 429 : 400;

      return NextResponse.json({
        success: false,
        error: error.message,
        error_type: error.type,
      }, { status: statusCode });
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        error_type: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[API/classify-invoice] Error:', error);
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      error_type: 'UNKNOWN',
    }, { status: 500 });
  }
}
