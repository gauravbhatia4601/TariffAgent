/**
 * Single Item Classification API Route
 * POST /api/classify
 *
 * Classifies a single item description and returns HS code classification
 * with duty rates, CEPA benefits, and restriction information.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { classifyItem } from '@/lib/ai';
import { ClassificationError } from '@/lib/ai/types';

// Request validation schema
const ClassifyItemRequestSchema = z.object({
  description: z.string()
    .min(1, 'Item description is required')
    .max(10000, 'Description too long (max 10000 characters)'),
  origin_country: z.string()
    .min(1, 'Origin country is required')
    .default('India'),
  cif_value: z.number()
    .min(0.01, 'CIF value must be at least 0.01 AED')
    .max(100_000_000, 'CIF value cannot exceed 100,000,000 AED')
    .optional(),
});

export type ClassifyItemRequest = z.infer<typeof ClassifyItemRequestSchema>;

// Response type
interface ClassifyResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  error_type?: string;
}

/**
 * POST /api/classify
 * Classify a single item and return HS code classification
 */
export async function POST(request: NextRequest): Promise<NextResponse<ClassifyResponse>> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validationResult = ClassifyItemRequestSchema.safeParse(body);

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

    // Perform classification
    const result = await classifyItem(
      validated.description,
      validated.origin_country,
      validated.cif_value
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

    // Log error for debugging (in production, use proper logging)
    if (process.env.NODE_ENV === 'development') {
      console.error('[API/classify] Error:', error);
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      error_type: 'UNKNOWN',
    }, { status: 500 });
  }
}
