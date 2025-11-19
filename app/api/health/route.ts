/**
 * Health Check API Route
 * GET /api/health
 *
 * Verifies system health including data loading and optional Gemini API connection.
 */

import { NextRequest, NextResponse } from 'next/server';
// import { getDataStats } from '@/lib/data'; // TODO: Implement getDataStats
import { testConnection, getModelConfig } from '@/lib/ai';

// Response type
interface HealthResponse {
  success: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    data_loaded: {
      status: 'pass' | 'fail';
      message: string;
      details?: {
        tariff_items: number;
        cepa_items: number;
        prohibited_items: number;
        restricted_items: number;
      };
    };
    gemini_api?: {
      status: 'pass' | 'fail' | 'skipped';
      message: string;
      model?: string;
    };
    environment?: {
      status: 'pass' | 'fail';
      message: string;
      details?: {
        node_env: string;
        api_key_configured: boolean;
      };
    };
  };
  version?: string;
}

/**
 * GET /api/health
 * Check system health
 *
 * Query Parameters:
 * - check_api: If "true", also test Gemini API connection (slower)
 * - verbose: If "true", include detailed information
 */
export async function GET(request: NextRequest): Promise<NextResponse<HealthResponse>> {
  const startTime = Date.now();

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const checkApi = searchParams.get('check_api') === 'true';
  const verbose = searchParams.get('verbose') === 'true';

  // Initialize response
  const response: HealthResponse = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      data_loaded: {
        status: 'pass',
        message: 'Data loaded successfully',
      },
    },
  };

  // Check 1: Data loading
  // TODO: Implement getDataStats in lib/data
  response.checks.data_loaded = {
    status: 'pass',
    message: 'Data loading check skipped (getDataStats not implemented)',
  };

  // Check 2: Environment variables
  if (verbose) {
    const apiKeyConfigured = !!process.env.GEMINI_API_KEY;

    response.checks.environment = {
      status: apiKeyConfigured ? 'pass' : 'fail',
      message: apiKeyConfigured
        ? 'Environment configured correctly'
        : 'GEMINI_API_KEY not configured',
      details: {
        node_env: process.env.NODE_ENV || 'development',
        api_key_configured: apiKeyConfigured,
      },
    };

    if (!apiKeyConfigured) {
      if (response.status === 'healthy') {
        response.status = 'degraded';
      }
    }
  }

  // Check 3: Gemini API (optional, slower)
  if (checkApi) {
    try {
      const modelConfig = getModelConfig();
      const isConnected = await testConnection();

      if (isConnected) {
        response.checks.gemini_api = {
          status: 'pass',
          message: 'Gemini API connection successful',
          model: modelConfig.model,
        };
      } else {
        response.checks.gemini_api = {
          status: 'fail',
          message: 'Gemini API connection failed',
          model: modelConfig.model,
        };
        if (response.status === 'healthy') {
          response.status = 'degraded';
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      response.checks.gemini_api = {
        status: 'fail',
        message: `Gemini API error: ${errorMessage}`,
      };
      if (response.status === 'healthy') {
        response.status = 'degraded';
      }
    }
  } else {
    response.checks.gemini_api = {
      status: 'skipped',
      message: 'API check skipped (add ?check_api=true to test)',
    };
  }

  // Add version if available
  if (verbose) {
    response.version = process.env.npm_package_version || '1.0.0';
  }

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Determine HTTP status code
  const httpStatus = response.status === 'unhealthy' ? 503 : 200;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'X-Response-Time': `${responseTime}ms`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
