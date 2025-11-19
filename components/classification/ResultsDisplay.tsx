'use client';

import { HSCodeClassification } from '@/lib/ai/types';
import { HSCodeDisplay } from './HSCodeDisplay';
import { ConfidenceMeter } from './ConfidenceMeter';
import { DutyCalculator } from './DutyCalculator';
import { CEPABanner } from './CEPABanner';
import { WarningsSection } from './WarningsSection';
import { DocumentChecklist } from './DocumentChecklist';
import { AIReasoning } from './AIReasoning';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ResultsDisplayProps {
  classification: HSCodeClassification | null;
  originCountry: string;
  cifValue: number;
  isLoading?: boolean;
  processingTime?: number;
  defaultExpanded?: boolean;
  itemIndex?: number;
  isInvoiceItem?: boolean;
}

export function ResultsDisplay({
  classification,
  originCountry,
  cifValue,
  isLoading = false,
  processingTime,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultExpanded = true,
  itemIndex = 0,
  isInvoiceItem = false,
}: ResultsDisplayProps) {
  // Show loading state
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-lg font-medium text-gray-700 animate-pulse">
              Analyzing with AI...
            </p>
            <p className="text-sm text-gray-500">
              This may take 10-15 seconds
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render if no classification
  if (!classification) {
    return null;
  }

  // Calculate duty amounts for display
  const standardDutyAmount = cifValue > 0
    ? (classification.standard_duty_pct / 100) * cifValue
    : 0;
  const cepaDutyAmount = cifValue > 0
    ? (classification.cepa_duty_pct / 100) * cifValue
    : 0;
  const savings = standardDutyAmount - cepaDutyAmount;

  // Determine if should show confetti animation
  const shouldAnimate =
    classification.cepa_applicable &&
    classification.cepa_duty_pct < classification.standard_duty_pct;

  // Format processing time badge
  const getTimingBadge = () => {
    if (!processingTime) return null;

    let variant: 'default' | 'secondary' | 'outline' = 'secondary';
    let text = `${processingTime.toFixed(1)}s`;
    let emoji = '⏱️';

    if (processingTime < 10) {
      variant = 'default';
      text = `${processingTime.toFixed(1)}s - Under Target!`;
      emoji = '⚡';
    } else if (processingTime < 15) {
      text = `${processingTime.toFixed(1)}s - Good`;
    }

    return (
      <Badge variant={variant} className="text-xs">
        {emoji} {text}
      </Badge>
    );
  };

  const content = (
    <div className="mt-6 space-y-6">
      {/* Results Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              {isInvoiceItem ? `📦 Item ${(itemIndex || 0) + 1}` : '📊 Classification Results'}
            </CardTitle>
            {getTimingBadge()}
          </div>
        </CardHeader>
      </Card>

      {/* CEPA Savings Banner */}
      {classification.cepa_applicable && cifValue > 0 && savings > 0 && (
        <CEPABanner
          savingsAmount={savings}
          standardDuty={standardDutyAmount}
          cepaDuty={cepaDutyAmount}
        />
      )}

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* HS Code Display */}
          <HSCodeDisplay
            hsCode={classification.hs_code_12_digit}
            descriptionEnglish={classification.description_english}
            descriptionArabic={classification.description_arabic}
            category={classification.category}
            animate={shouldAnimate}
          />

          {/* Confidence Meter */}
          <ConfidenceMeter confidence={classification.confidence} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Duty Calculator or Rates Display */}
          {cifValue > 0 ? (
            <DutyCalculator
              cifValue={cifValue}
              standardDutyPct={classification.standard_duty_pct}
              cepaDutyPct={classification.cepa_duty_pct}
              cepaApplicable={classification.cepa_applicable}
            />
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">💰 Duty Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Standard GCC Duty
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {classification.standard_duty_pct}%
                  </span>
                </div>
                {classification.cepa_applicable && (
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-700">
                      CEPA Duty
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {classification.cepa_duty_pct}%
                    </span>
                  </div>
                )}
                <p className="text-sm text-green-700 font-medium">
                  {classification.savings_explanation}
                </p>
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Enter a CIF value above to see detailed duty calculations
                  and savings!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Warnings Section */}
          <WarningsSection
            prohibited={classification.prohibited}
            restricted={classification.restricted}
            warnings={classification.warnings}
          />
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="space-y-6">
        {/* Required Documents */}
        <DocumentChecklist
          documents={classification.required_documents}
          cepaApplicable={classification.cepa_applicable}
        />

        {/* AI Reasoning */}
        <AIReasoning reasoning={classification.reasoning} />

        {/* Download Report Button */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              📥 Download Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button
                style={{ backgroundColor: '#00732F', color: 'white' }}
                className="hover:bg-[#005a25] w-full sm:w-auto"
                size="lg"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/generate-pdf', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        classification,
                        origin_country: originCountry,
                        cif_value: cifValue > 0 ? cifValue : undefined,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('PDF generation failed');
                    }

                    // Get PDF blob
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `TariffAgent_Report_${classification.hs_code_12_digit.replace(/\./g, '')}_${new Date().toISOString().split('T')[0]}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('PDF download error:', error);
                    alert('Failed to generate PDF. Please try again.');
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Generate & Download PDF Report
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Professional compliance report ready for customs submission
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // For invoice items, content is already wrapped in accordion in parent
  // For single items, return content directly
  return content;
}

export default ResultsDisplay;
