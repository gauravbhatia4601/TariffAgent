'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClassificationStore } from '@/lib/store/classification-store';

// Comprehensive sample invoices showcasing all response types for judges
const SAMPLE_INVOICES = [
  {
    text: `INVOICE

Invoice No: IND-TEX-251147
Date: 14 November 2025

Exporter: Shri Ganesh Textiles Pvt Ltd
123 Textile Street, Surat, Gujarat, India
GSTIN: 24AAECS1234F1Z5

Importer / Consignee: Al Noor Trading LLC
PO Box 12345, Deira, Dubai, UAE
TRN: 100123456700003

Country of Origin: INDIA
Port of Loading: Nhava Sheva, India
Final Destination: Jebel Ali, Dubai
Terms of Delivery: CIF Jebel Ali

------------------------------------------------------------
S.No  Description of Goods                  Qty    Unit    Rate USD    Amount USD
------------------------------------------------------------
1     Men's cotton shirts (knitted/crocheted) 500    pcs     8.50        4,250.00
      HS Code: 6105.10.00

2     Women's cotton kurtas                   800    pcs     12.00       9,600.00
      HS Code: 6206.30.00

3     Cotton bedsheets (printed)              300    sets    15.00       4,500.00
      HS Code: 6302.21.00

------------------------------------------------------------
Total Quantity: 1,600 pieces/sets
Total Invoice Value:                            USD 18,350.00
Freight + Insurance:                            USD 2,150.00
------------------------------------------------------------
CIF Value Jebel Ali:                            AED 71,565.00
------------------------------------------------------------

Declaration: We hereby certify that the goods are of Indian origin and qualify for preferential treatment under UAE-India CEPA.`,
    country: 'India',
    cifValue: 71565,
    description: 'CEPA Eligible - High Savings (Textiles from India)'
  },
  {
    text: `INVOICE

Invoice No: IND-GLD-2025-089
Date: 20 November 2025

Exporter: Mumbai Gold & Jewellery Export Ltd
456 Gold Street, Mumbai, Maharashtra, India
GSTIN: 27AABCM5678D1Z9

Importer: Dubai Luxury Trading LLC
PO Box 98765, Dubai, UAE

Country of Origin: INDIA
Port of Loading: Mumbai, India
Final Destination: Dubai, UAE
Terms: CIF Dubai

------------------------------------------------------------
S.No  Description                          Qty    Unit    Rate USD    Amount USD
------------------------------------------------------------
1     22K Gold Bangles, traditional design   50    pcs     450.00      22,500.00
      HS Code: 7113.19.00

2     18K Gold Necklace with diamonds        25    pcs     1,200.00    30,000.00
      HS Code: 7113.19.00

------------------------------------------------------------
Total Invoice Value:                            USD 52,500.00
Freight + Insurance:                            USD 1,500.00
------------------------------------------------------------
CIF Value Dubai:                                AED 198,450.00
------------------------------------------------------------

Certificate of Origin: India - CEPA Eligible`,
    country: 'India',
    cifValue: 198450,
    description: 'CEPA Eligible - Zero Duty (Gold Jewellery)'
  },
  {
    text: `INVOICE

Invoice No: CHN-ELC-2025-456
Date: 15 November 2025

Exporter: Shenzhen Electronics Co Ltd
789 Tech Park, Shenzhen, China

Importer: Dubai Electronics Trading LLC
PO Box 54321, Dubai, UAE

Country of Origin: CHINA
Port of Loading: Shenzhen, China
Final Destination: Jebel Ali, Dubai
Terms: CIF Jebel Ali

------------------------------------------------------------
S.No  Description                          Qty    Unit    Rate USD    Amount USD
------------------------------------------------------------
1     Smartphone, 5G, 256GB, Android       200    pcs     350.00      70,000.00
      HS Code: 8517.12.00

2     Wireless Earbuds, Bluetooth 5.0      500    pcs     25.00       12,500.00
      HS Code: 8518.62.00

------------------------------------------------------------
Total Invoice Value:                            USD 82,500.00
Freight + Insurance:                            USD 3,200.00
------------------------------------------------------------
CIF Value Jebel Ali:                            AED 314,850.00
------------------------------------------------------------

Note: No CEPA benefits - Standard GCC duty applies`,
    country: 'China',
    cifValue: 314850,
    description: 'No CEPA - Standard Duty (Electronics from China)'
  },
  {
    text: `INVOICE

Invoice No: IND-SPC-2025-234
Date: 18 November 2025

Exporter: Kerala Spices Export Corporation
321 Spice Road, Kochi, Kerala, India
GSTIN: 32AABCD9876E2Z3

Importer: Dubai Spice Trading LLC
PO Box 11111, Dubai, UAE

Country of Origin: INDIA
Port of Loading: Cochin, India
Final Destination: Jebel Ali, Dubai
Terms: CIF Jebel Ali

------------------------------------------------------------
S.No  Description                          Qty    Unit    Rate USD    Amount USD
------------------------------------------------------------
1     Premium Basmati Rice, aged 1 year   2000    kg      3.50        7,000.00
      HS Code: 1006.30.00

2     Black Pepper, whole, premium        500     kg      8.00        4,000.00
      HS Code: 0904.11.00

3     Cardamom, green, premium quality    200     kg      25.00       5,000.00
      HS Code: 0908.30.00

4     Turmeric powder, organic            300     kg      6.00        1,800.00
      HS Code: 0910.30.00

------------------------------------------------------------
Total Invoice Value:                            USD 17,800.00
Freight + Insurance:                            USD 1,200.00
------------------------------------------------------------
CIF Value Jebel Ali:                            AED 69,750.00
------------------------------------------------------------

Certificate of Origin: India - CEPA Eligible for all items`,
    country: 'India',
    cifValue: 69750,
    description: 'CEPA Eligible - Multiple Items (Spices & Rice)'
  },
  {
    text: `INVOICE

Invoice No: TUR-TXT-2025-789
Date: 22 November 2025

Exporter: Istanbul Textile Manufacturers
555 Fabric Avenue, Istanbul, Turkey

Importer: Dubai Fashion Trading LLC
PO Box 22222, Dubai, UAE

Country of Origin: TURKEY
Port of Loading: Istanbul, Turkey
Final Destination: Jebel Ali, Dubai
Terms: CIF Jebel Ali

------------------------------------------------------------
S.No  Description                          Qty    Unit    Rate USD    Amount USD
------------------------------------------------------------
1     Cotton Fabric, woven, premium        1000   meters  12.00       12,000.00
      HS Code: 5208.32.00

2     Silk Scarves, handwoven              200    pcs     35.00       7,000.00
      HS Code: 5007.20.00

------------------------------------------------------------
Total Invoice Value:                            USD 19,000.00
Freight + Insurance:                            USD 1,500.00
------------------------------------------------------------
CIF Value Jebel Ali:                            AED 75,225.00
------------------------------------------------------------

Note: Turkey-UAE CEPA may apply - Reduced duty rates`,
    country: 'Turkey',
    cifValue: 75225,
    description: 'CEPA Eligible - Turkey (Textiles)'
  }
];

// Form validation schema
const classificationFormSchema = z.object({
  description: z
    .string()
    .min(1, 'Item description is required')
    .max(10000, 'Description too long'),
  originCountry: z.string().min(1, 'Origin country is required'),
  cifValue: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().min(0, 'CIF value must be positive').optional()
  ),
  inputMode: z.enum(['single', 'invoice']),
});

type ClassificationFormValues = z.infer<typeof classificationFormSchema>;

export function ClassificationForm() {
  const {
    itemDescription,
    originCountry,
    cifValue,
    mode,
    isLoading,
    activeTab,
    showResults,
    setItemDescription,
    setOriginCountry,
    setCifValue,
    setMode,
    setLoading,
    setError,
    setActiveTab,
    setSingleItemResult,
    setInvoiceResult,
    clearResults,
    setUploadedFile,
    setExtractedText,
    setFileType,
    setExtractedCountry,
    setExtractedCifValue,
    extractedCountry,
    extractedCifValue,
    clearFile,
    reset,
  } = useClassificationStore();

  const form = useForm<ClassificationFormValues>({
    // @ts-expect-error - zodResolver type inference issue with optional union types
    resolver: zodResolver(classificationFormSchema),
    defaultValues: {
      description: itemDescription,
      originCountry: originCountry,
      cifValue: cifValue || '',
      inputMode: mode,
    },
  });

  // Sync form with store
  useEffect(() => {
    form.setValue('description', itemDescription);
    form.setValue('originCountry', originCountry);
    form.setValue('cifValue', cifValue || '');
    form.setValue('inputMode', mode);
  }, [itemDescription, originCountry, cifValue, mode, form]);

  const handleSubmit = async (values: ClassificationFormValues) => {
    try {
      setLoading(true);
      setError(null);
      clearResults();

      // Update store
      setItemDescription(values.description);
      setOriginCountry(values.originCountry);
      setCifValue(values.cifValue ? Number(values.cifValue) : 0);
      setMode(values.inputMode);

      const requestBody = {
      description: values.description,
        origin_country: values.originCountry,
        cif_value: values.cifValue ? Number(values.cifValue) : undefined,
      };

      if (values.inputMode === 'single') {
        // Single item classification
        const response = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Classification failed');
        }

        setSingleItemResult(data.data);
      } else {
        // Invoice classification
        const response = await fetch('/api/classify-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoice_text: values.description,
            origin_country: values.originCountry,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Invoice classification failed');
        }

        setInvoiceResult(data.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Classification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleInvoice = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_INVOICES.length);
    const sample = SAMPLE_INVOICES[randomIndex];
    form.setValue('description', sample.text);
    form.setValue('originCountry', sample.country);
    form.setValue('cifValue', sample.cifValue);
    form.setValue('inputMode', 'invoice');
    setItemDescription(sample.text);
    setOriginCountry(sample.country);
    setCifValue(sample.cifValue);
    setMode('invoice');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      let allExtractedText = '';

      // Process all files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
          setFileType(file.type === 'application/pdf' ? 'pdf' : 'image');

          // Extract text using API
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/extract-text', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || `Text extraction failed for ${file.name}`);
          }

          const extractedText = data.data?.text || '';
          
          // Extract and set country and CIF value if available
          if (data.data?.extractedCountry) {
            setExtractedCountry(data.data.extractedCountry);
            setOriginCountry(data.data.extractedCountry);
            form.setValue('originCountry', data.data.extractedCountry);
          }
          
          if (data.data?.extractedCifValue) {
            setExtractedCifValue(data.data.extractedCifValue);
            setCifValue(data.data.extractedCifValue);
            form.setValue('cifValue', data.data.extractedCifValue.toString());
          }
          
          // Combine text from all files with separator
          if (allExtractedText) {
            allExtractedText += '\n\n---\n\n';
          }
          allExtractedText += `[File: ${file.name}]\n${extractedText}`;
        } else if (file.type === 'text/plain') {
      const text = await file.text();
          if (allExtractedText) {
            allExtractedText += '\n\n---\n\n';
          }
          allExtractedText += `[File: ${file.name}]\n${text}`;
          setFileType(null);
    } else {
          throw new Error(`Unsupported file type: ${file.name}. Please use PDF, image, or text files.`);
        }
      }

      // Set the first file for display purposes
      if (files.length > 0) {
        setUploadedFile(files[0]);
      }

      // Set combined extracted text
      setExtractedText(allExtractedText);
      form.setValue('description', allExtractedText);
      setItemDescription(allExtractedText);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'File processing failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            📝 Classification Input
          </CardTitle>
          {showResults && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset all state
                reset();
                clearResults();
                clearFile();
                form.reset({
                  description: '',
                  originCountry: 'India',
                  cifValue: '',
                  inputMode: 'single',
                });
                setActiveTab('text');
                setError(null);
              }}
              className="text-sm font-semibold"
            >
              🆕 New Invoice
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'text' | 'file')}
            >
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="text" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                  <span className="hidden sm:inline">📄</span> Text
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                  <span className="hidden sm:inline">📁</span> File
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between mb-2">
                          <FormLabel>Invoice Details</FormLabel>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={loadSampleInvoice}
                              className="text-xs sm:text-sm"
                            >
                              📋 Sample
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Paste invoice details here... (English or Arabic)

Example:
Cotton t-shirts from India
Quantity: 1000 pcs
CIF Value: AED 5,000"
                              className="min-h-[150px] sm:min-h-[200px] resize-y w-full"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setItemDescription(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="file" className="mt-4 space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    multiple
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer text-gray-600"
                  >
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, PNG, JPG, or TXT (max 10MB per file)
                        <br />
                        {/* <span className="font-semibold text-blue-600">You can upload multiple files</span> */}
                      </p>
                    </div>
                  </Label>
                </div>
                {form.watch('description') && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Extracted Text (you can edit if needed)</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[150px] resize-y"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setItemDescription(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded">
                      💡 <strong>Note:</strong> After uploading files, review the extracted text above and click &quot;Classify &amp; Calculate&quot; to process.
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  <strong>Supported formats:</strong>
                  <br />• PDF invoices - Text will be extracted automatically
                  <br />• Clean images (PNG, JPG) - Text extraction using AI vision
                  <br />• Multiple files - Upload several invoices at once
                </p>
              </TabsContent>

            </Tabs>

            {/* Classification Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              {/* Origin Country */}
              <FormField
                control={form.control}
                name="originCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      🌍 Country of Origin
                      {extractedCountry && (
                        <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          ✓ Extracted
                        </span>
                      )}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setOriginCountry(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="India">India (CEPA)</SelectItem>
                        <SelectItem value="China">China</SelectItem>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="United States">
                          United States
                        </SelectItem>
                        <SelectItem value="United Kingdom">
                          United Kingdom
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {extractedCountry && (
                      <p className="text-xs text-gray-500">
                        Detected from document: <strong>{extractedCountry}</strong>
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CIF Value */}
              <FormField
                control={form.control}
                name="cifValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      💰 CIF Value (AED)
                      {extractedCifValue && (
                        <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          ✓ Extracted
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="any"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setCifValue(e.target.value ? Number(e.target.value) : 0);
                        }}
                      />
                    </FormControl>
                    {extractedCifValue && (
                      <p className="text-xs text-gray-500">
                        Detected from document: <strong>AED {extractedCifValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Input Mode */}
              <FormField
                control={form.control}
                name="inputMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input Mode</FormLabel>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="single"
                          checked={field.value === 'single'}
                          onChange={() => {
                            field.onChange('single');
                            setMode('single');
                          }}
                          className="text-[#00732F]"
                        />
                        <span className="text-sm">Single Item</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="invoice"
                          checked={field.value === 'invoice'}
                          onChange={() => {
                            field.onChange('invoice');
                            setMode('invoice');
                          }}
                          className="text-[#00732F]"
                        />
                        <span className="text-sm">Full Invoice</span>
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                style={{ 
                  backgroundColor: '#00732F',
                  color: 'white',
                }}
                className="hover:bg-[#005a25] font-semibold px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Classifying...
                  </>
                ) : (
                  <>
                    🚀 Classify & Calculate
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default ClassificationForm;
