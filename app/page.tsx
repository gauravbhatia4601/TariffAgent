'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ClassificationForm } from '@/components/classification/ClassificationForm';
import { ResultsDisplay } from '@/components/classification/ResultsDisplay';
import { useClassificationStore } from '@/lib/store/classification-store';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslation, getCurrentLanguage } from '@/lib/utils/translations';

export default function Home() {
  const {
    singleItemResult,
    invoiceResult,
    isLoading,
    error,
    showResults,
    mode,
    originCountry,
    cifValue,
    clearResults,
    setError,
    setShowResults,
  } = useClassificationStore();

  const t = useTranslation();

  // Update language when document language changes
  useEffect(() => {
    const updateLang = () => {
      getCurrentLanguage();
    };

    updateLang();

    const observer = new MutationObserver(updateLang);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['dir', 'lang'],
      });
    }

    return () => observer.disconnect();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // Get current result based on mode
  const currentResult = mode === 'single' ? singleItemResult : null;
  const currentInvoiceResult = mode === 'invoice' ? invoiceResult : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3 w-full">
            <Sidebar />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-4 sm:space-y-6 w-full">
            {/* Project Description Section */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <h2 className="font-bold text-blue-900 mb-3 sm:mb-4 text-lg sm:text-xl">
                  {t.projectTitle}
                </h2>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700 list-disc list-inside rtl:list-outside rtl:text-right">
                  {t.projectDescription.map((point, index) => (
                    <li key={index} className="leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t.error}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Disclaimer Banner - Prominent at top of main content */}
            <Card className="border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-md">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="flex items-start gap-2 sm:gap-3 rtl:flex-row-reverse">
                  <span className="text-2xl sm:text-3xl flex-shrink-0">⚠️</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-yellow-900 mb-2 text-base sm:text-lg">
                      {t.disclaimerTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
                      {t.disclaimerText}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classification Form */}
            <ClassificationForm />

            {/* Results Display */}
            {showResults && (
              <>
                {mode === 'single' && currentResult && (
                  <ResultsDisplay
                    classification={currentResult}
                    originCountry={originCountry}
                    cifValue={cifValue}
                    isLoading={isLoading}
                  />
                )}

                {mode === 'invoice' && currentInvoiceResult && (
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-2xl font-bold">Invoice Classification Results</h2>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              clearResults();
                              setShowResults(false);
                            }}
                            className="text-sm font-semibold"
                          >
                            🆕 New Invoice
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Items Classified:</span>
                              <span className="ml-2 font-semibold">
                                {currentInvoiceResult.items.length}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Origin:</span>
                              <span className="ml-2 font-semibold">{originCountry}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Total Savings:</span>
                              <span className="ml-2 font-semibold text-green-600">
                                AED {currentInvoiceResult.total_savings.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{currentInvoiceResult.invoice_summary || 'Invoice classification completed'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Individual Items - Wrapped in Accordion */}
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue="item-0"
                      className="w-full"
                    >
                      {currentInvoiceResult.items.map((item, index) => (
                        <AccordionItem
                          key={index}
                          value={`item-${index}`}
                          className="border rounded-lg mb-4"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-lg font-semibold">
                                  Item {index + 1}: {item.description_english.substring(0, 50)}
                                  {item.description_english.length > 50 ? '...' : ''}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                  {item.hs_code_12_digit}
                                </Badge>
                                {item.cepa_applicable && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    CEPA Eligible
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-0">
                            <ResultsDisplay
                              classification={item}
                              originCountry={originCountry}
                              cifValue={0}
                              isLoading={false}
                              isInvoiceItem={true}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
