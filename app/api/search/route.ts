/**
 * HS Code Search API Route
 * GET /api/search
 *
 * Quick search for HS codes without full AI classification.
 * Useful for autocomplete, suggestions, and quick lookups.
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchHSCodes, getSearchSuggestions } from '@/lib/data';

// Response type
interface SearchResponse {
  success: boolean;
  data?: {
    query: string;
    results: Array<{
      hs_code: string;
      description_en: string;
      description_ar?: string;
      category?: string;
      standard_duty_rate?: number;
      has_cepa?: boolean;
      cepa_duty_rate?: number;
      confidence: number;
    }>;
    total: number;
  };
  error?: string;
  error_type?: string;
}

/**
 * GET /api/search
 * Search for HS codes matching query
 *
 * Query Parameters:
 * - q: Search query (required)
 * - limit: Maximum number of results (default: 5, max: 20)
 * - suggestions: If "true", return suggestions format (minimal data)
 */
export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const suggestionsMode = searchParams.get('suggestions') === 'true';

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required. Use ?q=your+search+term',
        error_type: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    // Validate query length
    if (query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters',
        error_type: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    if (query.trim().length > 200) {
      return NextResponse.json({
        success: false,
        error: 'Search query too long (max 200 characters)',
        error_type: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    // Parse and validate limit
    let limit = 5;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json({
          success: false,
          error: 'Limit must be a positive number',
          error_type: 'VALIDATION_ERROR',
        }, { status: 400 });
      }
      limit = Math.min(parsedLimit, 20); // Cap at 20
    }

    // Perform search
    const searchResults = await (suggestionsMode
      ? getSearchSuggestions(query.trim(), limit)
      : searchHSCodes(query.trim(), limit));

    // Format results
    const formattedResults = searchResults.map(result => ({
      hs_code: result.hs_code,
      description_en: result.description_en,
      description_ar: result.description_ar,
      category: result.category,
      standard_duty_rate: result.standard_duty_rate,
      has_cepa: result.has_cepa,
      cepa_duty_rate: result.cepa_duty_rate,
      confidence: result.confidence,
    }));

    return NextResponse.json({
      success: true,
      data: {
        query: query.trim(),
        results: formattedResults,
        total: formattedResults.length,
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[API/search] Error:', error);
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      error_type: 'UNKNOWN',
    }, { status: 500 });
  }
}
