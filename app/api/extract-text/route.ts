/**
 * Text Extraction API Route
 * POST /api/extract-text
 *
 * Extracts text from PDF documents and images using
 * pdf-parse for PDFs and Gemini Vision for images.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateWithVision, generateContent } from '@/lib/ai';

// Response type
interface ExtractTextResponse {
  success: boolean;
  data?: {
    text: string;
    source: 'pdf' | 'image';
    pages?: number;
    characters?: number;
    extractedCountry?: string;
    extractedCifValue?: number;
  };
  error?: string;
  error_type?: string;
}

// Supported MIME types
const SUPPORTED_PDF_TYPES = ['application/pdf'];
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Process and structure extracted text for better LLM consumption
 * Extracts country, CIF value, and formats text in human-readable way
 */
async function processExtractedText(
  rawText: string
): Promise<{
  formattedText: string;
  country?: string;
  cifValue?: number;
}> {
  try {
    // First, extract structured metadata (country, CIF value)
    const metadataPrompt = `Analyze this document text and extract key information. Return ONLY a JSON object with this exact structure:

{
  "country": "country name or null",
  "cifValue": number or null,
  "currency": "USD/AED/EUR or null"
}

EXTRACTION RULES:
1. Country: Look for "Country of Origin", "Origin", "Made in", "Exporter Country", or similar. Return the country name (e.g., "India", "China", "Turkey") or null if not found.
2. CIF Value: Look for "CIF Value", "CIF Amount", "Total CIF", or similar. Extract the numeric value. If in different currency, note the currency.
3. Currency: Extract the currency code if found (USD, AED, EUR, etc.)

DOCUMENT TEXT:
${rawText.substring(0, 5000)}

Return ONLY the JSON object, nothing else.`;

    let country: string | undefined;
    let cifValue: number | undefined;

    try {
      const metadataResponse = await generateContent(metadataPrompt);
      let jsonText = metadataResponse.trim();
      
      // Extract JSON from markdown code blocks if present
      if (jsonText.includes('```json')) {
        const match = jsonText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (match) jsonText = match[1];
      } else if (jsonText.includes('```')) {
        const match = jsonText.match(/```\s*(\{[\s\S]*?\})\s*```/);
        if (match) jsonText = match[1];
      }

      const metadata = JSON.parse(jsonText);
      country = metadata.country || undefined;
      
      if (metadata.cifValue) {
        cifValue = Number(metadata.cifValue);
        // Convert to AED if needed (rough conversion, user can adjust)
        if (metadata.currency === 'USD' && cifValue) {
          cifValue = cifValue * 3.67; // Approximate USD to AED
        }
      }
    } catch (metadataError) {
      // If metadata extraction fails, continue with text formatting
      console.warn('Metadata extraction failed, continuing with text formatting:', metadataError);
    }

    // Now format the text in human-readable way optimized for semantic search
    const formattingPrompt = `You are a document processing assistant. Format this extracted text in a clear, human-readable format optimized for semantic search and LLM processing.

ORIGINAL TEXT:
${rawText.substring(0, 8000)}

INSTRUCTIONS:
1. Format the text in a clear, structured way that preserves all important information
2. Group related information together (invoice header, line items, totals, etc.)
3. Make product/item descriptions clear and searchable
4. Preserve all numbers, quantities, prices, and technical details
5. Remove redundant formatting but keep structure
6. If this is an invoice, clearly separate:
   - Header information (dates, invoice numbers, parties)
   - Line items (products with descriptions, quantities, prices)
   - Totals and summary information
7. Use clear section headers and line breaks for readability
8. DO NOT return JSON - return plain, human-readable text
9. DO NOT add any interpretation or analysis - just format the existing text

Return the formatted text in a way that:
- Is easy for humans to read and understand
- Contains all key information for classification
- Is optimized for semantic search
- Preserves product descriptions, quantities, and values

Return ONLY the formatted text, nothing else.`;

    const formattedResponse = await generateContent(formattingPrompt);
    const formattedText = formattedResponse.trim();

    return {
      formattedText: formattedText || rawText, // Fallback to raw text if formatting fails
      country,
      cifValue,
    };
  } catch (error) {
    // If processing fails, return raw text with no metadata
    console.error('Text processing failed:', error);
    return {
      formattedText: rawText,
      country: undefined,
      cifValue: undefined,
    };
  }
}

/**
 * POST /api/extract-text
 * Extract text from PDF or image file
 */
export async function POST(request: NextRequest): Promise<NextResponse<ExtractTextResponse>> {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate file presence
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided. Please upload a PDF or image file.',
        error_type: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        error_type: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    // Validate file type
    const isPDF = SUPPORTED_PDF_TYPES.includes(file.type);
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);

    if (!isPDF && !isImage) {
      return NextResponse.json({
        success: false,
        error: `Unsupported file type: ${file.type}. Supported types: PDF, JPEG, PNG, WebP, GIF.`,
        error_type: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    // Process PDF
    if (isPDF) {
      try {
        // Dynamic import of pdf-parse to avoid issues with server-side
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParseModule = await import('pdf-parse') as any;
        const pdfParse = pdfParseModule.default || pdfParseModule;

        const buffer = await file.arrayBuffer();
        const pdfData = await pdfParse(Buffer.from(buffer));

        const rawText = pdfData.text.trim();

        if (!rawText) {
          return NextResponse.json({
            success: false,
            error: 'Could not extract text from PDF. The file may be scanned or contain only images.',
            error_type: 'EXTRACTION_ERROR',
          }, { status: 422 });
        }

        // Process and structure the extracted text
        const processed = await processExtractedText(rawText);

        return NextResponse.json({
          success: true,
          data: {
            text: processed.formattedText,
            source: 'pdf',
            pages: pdfData.numpages,
            characters: processed.formattedText.length,
            extractedCountry: processed.country,
            extractedCifValue: processed.cifValue,
          },
        });

      } catch (pdfError) {
        const errorMessage = pdfError instanceof Error ? pdfError.message : 'PDF parsing failed';

        return NextResponse.json({
          success: false,
          error: `Failed to parse PDF: ${errorMessage}`,
          error_type: 'EXTRACTION_ERROR',
        }, { status: 422 });
      }
    }

    // Process Image with Gemini Vision
    if (isImage) {
      try {
        const base64Data = await fileToBase64(file);

        const extractionPrompt = `You are a text extraction assistant. Extract ALL text visible in this image.

Instructions:
1. Extract all text exactly as it appears in the image
2. Preserve the original formatting and layout as much as possible
3. Include all numbers, dates, amounts, and product descriptions
4. If the image contains a table, format it clearly with proper alignment
5. If the image is an invoice or document, maintain the document structure
6. Do not add any interpretation or summary - just extract the raw text

Return ONLY the extracted text, nothing else.`;

        const rawText = await generateWithVision(
          extractionPrompt,
          base64Data,
          file.type
        );

        const cleanedText = rawText.trim();

        if (!cleanedText || cleanedText.length < 5) {
          return NextResponse.json({
            success: false,
            error: 'Could not extract text from image. The image may not contain readable text.',
            error_type: 'EXTRACTION_ERROR',
          }, { status: 422 });
        }

        // Process and structure the extracted text
        const processed = await processExtractedText(cleanedText);

        return NextResponse.json({
          success: true,
          data: {
            text: processed.formattedText,
            source: 'image',
            characters: processed.formattedText.length,
            extractedCountry: processed.country,
            extractedCifValue: processed.cifValue,
          },
        });

      } catch (visionError) {
        const errorMessage = visionError instanceof Error ? visionError.message : 'Image processing failed';

        // Check for rate limiting
        if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
          return NextResponse.json({
            success: false,
            error: 'API rate limit exceeded. Please try again later.',
            error_type: 'RATE_LIMIT',
          }, { status: 429 });
        }

        return NextResponse.json({
          success: false,
          error: `Failed to extract text from image: ${errorMessage}`,
          error_type: 'EXTRACTION_ERROR',
        }, { status: 422 });
      }
    }

    // Should not reach here
    return NextResponse.json({
      success: false,
      error: 'Unknown processing error',
      error_type: 'UNKNOWN',
    }, { status: 500 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[API/extract-text] Error:', error);
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      error_type: 'UNKNOWN',
    }, { status: 500 });
  }
}
