/**
 * PDF Generation API Route
 * POST /api/generate-pdf
 *
 * Generates a compliance report PDF from classification results.
 * Uses @react-pdf/renderer to create professional PDF documents.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request validation schema
const GeneratePDFRequestSchema = z.object({
  classification: z.object({
    hs_code_12_digit: z.string(),
    confidence: z.number(),
    description_english: z.string(),
    description_arabic: z.string().optional(),
    category: z.string(),
    standard_duty_pct: z.number(),
    cepa_applicable: z.boolean(),
    cepa_duty_pct: z.number(),
    savings_explanation: z.string(),
    restricted: z.boolean(),
    prohibited: z.boolean(),
    warnings: z.array(z.string()).optional(),
    required_documents: z.array(z.string()).optional(),
    reasoning: z.string(),
  }),
  origin_country: z.string(),
  cif_value: z.number().optional(),
  company_name: z.string().optional(),
  reference_number: z.string().optional(),
});

export type GeneratePDFRequest = z.infer<typeof GeneratePDFRequestSchema>;

// Response type
interface GeneratePDFResponse {
  success: boolean;
  error?: string;
  error_type?: string;
}

/**
 * POST /api/generate-pdf
 * Generate a compliance report PDF
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validationResult = GeneratePDFRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      return NextResponse.json({
        success: false,
        error: `Validation error: ${errorMessage}`,
        error_type: 'VALIDATION_ERROR',
      } as GeneratePDFResponse, { status: 400 });
    }

    const validated = validationResult.data;

    // Dynamically import React PDF components to avoid SSR issues
    const ReactPDF = await import('@react-pdf/renderer');
    const React = await import('react');

    const { Document, Page, Text, View, StyleSheet, renderToBuffer } = ReactPDF;

    // PDF Styles
    const styles = StyleSheet.create({
      page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
      },
      header: {
        marginBottom: 20,
        borderBottom: '2pt solid #2563eb',
        paddingBottom: 15,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e3a8a',
        marginBottom: 5,
      },
      subtitle: {
        fontSize: 12,
        color: '#6b7280',
      },
      section: {
        marginBottom: 15,
      },
      sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 8,
        paddingBottom: 4,
        borderBottom: '1pt solid #e5e7eb',
      },
      row: {
        flexDirection: 'row',
        marginBottom: 4,
      },
      label: {
        width: '40%',
        fontWeight: 'bold',
        color: '#374151',
      },
      value: {
        width: '60%',
        color: '#1f2937',
      },
      warningBox: {
        backgroundColor: '#fef2f2',
        border: '1pt solid #fecaca',
        padding: 10,
        marginBottom: 10,
        borderRadius: 4,
      },
      warningText: {
        color: '#dc2626',
        fontWeight: 'bold',
      },
      successBox: {
        backgroundColor: '#f0fdf4',
        border: '1pt solid #bbf7d0',
        padding: 10,
        marginBottom: 10,
        borderRadius: 4,
      },
      successText: {
        color: '#16a34a',
      },
      footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af',
        borderTop: '1pt solid #e5e7eb',
        paddingTop: 10,
      },
      disclaimer: {
        marginTop: 20,
        fontSize: 8,
        color: '#6b7280',
        fontStyle: 'italic',
      },
    });

    // Extract data
    const classification = validated.classification;
    const originCountry = validated.origin_country;
    const cifValue = validated.cif_value;
    const companyName = validated.company_name;
    const referenceNumber = validated.reference_number;

    const generatedDate = new Date().toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const standardDuty = cifValue ? (classification.standard_duty_pct / 100) * cifValue : 0;
    const cepaDuty = cifValue ? (classification.cepa_duty_pct / 100) * cifValue : 0;
    const savings = standardDuty - cepaDuty;

    // Build document elements
    const documentChildren: React.ReactElement[] = [];

    // Header
    documentChildren.push(
      React.createElement(View, { key: 'header', style: styles.header },
        React.createElement(Text, { style: styles.title }, 'TariffAgent Compliance Report'),
        React.createElement(Text, { style: styles.subtitle },
          `Generated: ${generatedDate}${referenceNumber ? ` | Ref: ${referenceNumber}` : ''}`
        )
      )
    );

    // Warnings for prohibited/restricted items
    if (classification.prohibited) {
      documentChildren.push(
        React.createElement(View, { key: 'prohibited-warning', style: styles.warningBox },
          React.createElement(Text, { style: styles.warningText },
            'PROHIBITED ITEM - Import not allowed into UAE'
          )
        )
      );
    }

    if (classification.restricted && !classification.prohibited) {
      documentChildren.push(
        React.createElement(View, { key: 'restricted-warning', style: styles.warningBox },
          React.createElement(Text, { style: styles.warningText },
            'RESTRICTED ITEM - Special permits required'
          )
        )
      );
    }

    // Classification Details Section
    documentChildren.push(
      React.createElement(View, { key: 'classification-section', style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Classification Details'),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'HS Code (12-digit):'),
          React.createElement(Text, { style: styles.value }, classification.hs_code_12_digit)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Description:'),
          React.createElement(Text, { style: styles.value }, classification.description_english)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Category:'),
          React.createElement(Text, { style: styles.value }, classification.category)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Confidence:'),
          React.createElement(Text, { style: styles.value }, `${classification.confidence}%`)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Origin Country:'),
          React.createElement(Text, { style: styles.value }, originCountry)
        )
      )
    );

    // Duty Information Section
    const dutyElements = [
      React.createElement(Text, { key: 'duty-title', style: styles.sectionTitle }, 'Duty Information'),
      React.createElement(View, { key: 'duty-rate', style: styles.row },
        React.createElement(Text, { style: styles.label }, 'Standard Duty Rate:'),
        React.createElement(Text, { style: styles.value }, `${classification.standard_duty_pct}%`)
      ),
    ];

    if (cifValue) {
      dutyElements.push(
        React.createElement(View, { key: 'cif-value', style: styles.row },
          React.createElement(Text, { style: styles.label }, 'CIF Value:'),
          React.createElement(Text, { style: styles.value }, `AED ${cifValue.toLocaleString()}`)
        ),
        React.createElement(View, { key: 'duty-amount', style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Standard Duty Amount:'),
          React.createElement(Text, { style: styles.value }, `AED ${standardDuty.toFixed(2)}`)
        )
      );
    }

    documentChildren.push(
      React.createElement(View, { key: 'duty-section', style: styles.section }, ...dutyElements)
    );

    // CEPA Benefits Section
    if (classification.cepa_applicable) {
      const cepaElements = [
        React.createElement(Text, { key: 'cepa-title', style: styles.sectionTitle }, 'CEPA Benefits'),
        React.createElement(View, { key: 'cepa-eligible', style: styles.successBox },
          React.createElement(Text, { style: styles.successText },
            'This item is eligible for UAE-India CEPA preferential rates'
          )
        ),
        React.createElement(View, { key: 'cepa-rate', style: styles.row },
          React.createElement(Text, { style: styles.label }, 'CEPA Duty Rate:'),
          React.createElement(Text, { style: styles.value }, `${classification.cepa_duty_pct}%`)
        ),
      ];

      if (cifValue) {
        cepaElements.push(
          React.createElement(View, { key: 'cepa-amount', style: styles.row },
            React.createElement(Text, { style: styles.label }, 'CEPA Duty Amount:'),
            React.createElement(Text, { style: styles.value }, `AED ${cepaDuty.toFixed(2)}`)
          )
        );

        if (savings > 0) {
          cepaElements.push(
            React.createElement(View, { key: 'savings', style: styles.row },
              React.createElement(Text, { style: styles.label }, 'Potential Savings:'),
              React.createElement(Text, { style: { ...styles.value, color: '#16a34a', fontWeight: 'bold' } },
                `AED ${savings.toFixed(2)}`
              )
            )
          );
        }
      }

      cepaElements.push(
        React.createElement(View, { key: 'savings-exp', style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Explanation:'),
          React.createElement(Text, { style: styles.value }, classification.savings_explanation)
        )
      );

      documentChildren.push(
        React.createElement(View, { key: 'cepa-section', style: styles.section }, ...cepaElements)
      );
    }

    // Required Documents Section
    if (classification.required_documents && classification.required_documents.length > 0) {
      const docElements = [
        React.createElement(Text, { key: 'docs-title', style: styles.sectionTitle }, 'Required Documents'),
        ...classification.required_documents.map((doc, index) =>
          React.createElement(Text, { key: `doc-${index}`, style: { marginBottom: 3 } },
            `${index + 1}. ${doc}`
          )
        ),
      ];

      documentChildren.push(
        React.createElement(View, { key: 'docs-section', style: styles.section }, ...docElements)
      );
    }

    // Warnings Section
    if (classification.warnings && classification.warnings.length > 0) {
      const warningElements = [
        React.createElement(Text, { key: 'warnings-title', style: styles.sectionTitle }, 'Warnings'),
        ...classification.warnings.map((warning, index) =>
          React.createElement(Text, { key: `warning-${index}`, style: { marginBottom: 3, color: '#dc2626' } },
            `- ${warning}`
          )
        ),
      ];

      documentChildren.push(
        React.createElement(View, { key: 'warnings-section', style: styles.section }, ...warningElements)
      );
    }

    // Reasoning Section
    documentChildren.push(
      React.createElement(View, { key: 'reasoning-section', style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Classification Reasoning'),
        React.createElement(Text, {}, classification.reasoning)
      )
    );

    // Disclaimer
    documentChildren.push(
      React.createElement(Text, { key: 'disclaimer', style: styles.disclaimer },
        'Disclaimer: This classification is provided for informational purposes only and should not be considered as legal or professional customs advice. Please consult with a licensed customs broker or relevant authorities for official classification decisions. TariffAgent uses AI to assist with HS code classification and actual duty rates may vary.'
      )
    );

    // Footer
    documentChildren.push(
      React.createElement(View, { key: 'footer', style: styles.footer },
        React.createElement(Text, {},
          `TariffAgent - AI-Powered HS Code Classification | ${companyName || 'Report'} | Page 1`
        )
      )
    );

    // Create document
    const pdfDocument = React.createElement(Document, {},
      React.createElement(Page, { size: 'A4', style: styles.page }, ...documentChildren)
    );

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(pdfDocument as React.ReactElement);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const hsCode = classification.hs_code_12_digit.replace(/\./g, '');
    const filename = `TariffAgent_Report_${hsCode}_${timestamp}.pdf`;

    // Return PDF as downloadable file
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer);
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[API/generate-pdf] Error:', error);
    }

    return NextResponse.json({
      success: false,
      error: `PDF generation failed: ${errorMessage}`,
      error_type: 'GENERATION_ERROR',
    } as GeneratePDFResponse, { status: 500 });
  }
}
