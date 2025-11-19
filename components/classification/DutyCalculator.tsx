'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface DutyCalculatorProps {
  cifValue: number;
  standardDutyPct: number;
  cepaDutyPct: number;
  cepaApplicable: boolean;
}

export function DutyCalculator({
  cifValue,
  standardDutyPct,
  cepaDutyPct,
  cepaApplicable,
}: DutyCalculatorProps) {
  // Calculate amounts
  const standardDutyAmount = (standardDutyPct / 100) * cifValue;
  const cepaDutyAmount = (cepaDutyPct / 100) * cifValue;
  const savings = standardDutyAmount - cepaDutyAmount;
  const vatRate = 5;
  const vatOnStandard = (standardDutyAmount + cifValue) * (vatRate / 100);
  const vatOnCepa = (cepaDutyAmount + cifValue) * (vatRate / 100);
  const totalStandard = cifValue + standardDutyAmount + vatOnStandard;
  const totalCepa = cifValue + cepaDutyAmount + vatOnCepa;

  // Format currency
  const formatAED = (value: number) =>
    new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          💰 Duty Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Standard Duty */}
          <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
            <h4 className="text-sm font-semibold text-red-700 mb-2">
              Standard GCC Duty
            </h4>
            <p className="text-sm text-red-600 mb-1">
              Rate: <strong>{standardDutyPct.toFixed(1)}%</strong>
            </p>
            <p className="text-2xl font-bold text-red-700">
              {formatAED(standardDutyAmount)}
            </p>
          </div>

          {/* CEPA Duty */}
          <div
            className={`p-4 rounded-lg border-2 ${
              cepaApplicable
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <h4
              className={`text-sm font-semibold mb-2 ${
                cepaApplicable ? 'text-green-700' : 'text-gray-600'
              }`}
            >
              {cepaApplicable ? 'CEPA Preferential Duty' : 'Standard Duty'}
            </h4>
            <p
              className={`text-sm mb-1 ${
                cepaApplicable ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              Rate:{' '}
              <strong>
                {cepaApplicable ? cepaDutyPct.toFixed(1) : standardDutyPct.toFixed(1)}%
              </strong>
            </p>
            <p
              className={`text-2xl font-bold ${
                cepaApplicable ? 'text-green-700' : 'text-gray-700'
              }`}
            >
              {formatAED(cepaApplicable ? cepaDutyAmount : standardDutyAmount)}
            </p>
          </div>
        </div>

        {/* Net Savings */}
        {cepaApplicable && savings > 0 && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
            <p className="text-green-800 font-bold text-xl">
              NET SAVINGS: {formatAED(savings)}
            </p>
          </div>
        )}

        {/* Detailed Breakdown */}
        <Accordion type="single" collapsible>
          <AccordionItem value="breakdown">
            <AccordionTrigger className="text-sm">
              📊 Detailed Breakdown
            </AccordionTrigger>
            <AccordionContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Standard GCC</TableHead>
                      {cepaApplicable && (
                        <TableHead className="text-right">CEPA</TableHead>
                      )}
                      {cepaApplicable && (
                        <TableHead className="text-right">Difference</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* CIF Value */}
                    <TableRow>
                      <TableCell>CIF Value</TableCell>
                      <TableCell className="text-right">
                        {formatAED(cifValue)}
                      </TableCell>
                      {cepaApplicable && (
                        <TableCell className="text-right">
                          {formatAED(cifValue)}
                        </TableCell>
                      )}
                      {cepaApplicable && (
                        <TableCell className="text-right">-</TableCell>
                      )}
                    </TableRow>

                    {/* Duty Rate */}
                    <TableRow>
                      <TableCell>Duty Rate</TableCell>
                      <TableCell className="text-right">
                        {standardDutyPct.toFixed(1)}%
                      </TableCell>
                      {cepaApplicable && (
                        <TableCell className="text-right">
                          {cepaDutyPct.toFixed(1)}%
                        </TableCell>
                      )}
                      {cepaApplicable && (
                        <TableCell className="text-right text-green-600 font-medium">
                          -{(standardDutyPct - cepaDutyPct).toFixed(1)}%
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Duty Amount */}
                    <TableRow>
                      <TableCell>Duty Amount</TableCell>
                      <TableCell className="text-right">
                        {formatAED(standardDutyAmount)}
                      </TableCell>
                      {cepaApplicable && (
                        <TableCell className="text-right">
                          {formatAED(cepaDutyAmount)}
                        </TableCell>
                      )}
                      {cepaApplicable && (
                        <TableCell className="text-right text-green-600 font-medium">
                          -{formatAED(savings)}
                        </TableCell>
                      )}
                    </TableRow>

                    {/* VAT */}
                    <TableRow>
                      <TableCell>VAT ({vatRate}%)</TableCell>
                      <TableCell className="text-right">
                        {formatAED(vatOnStandard)}
                      </TableCell>
                      {cepaApplicable && (
                        <TableCell className="text-right">
                          {formatAED(vatOnCepa)}
                        </TableCell>
                      )}
                      {cepaApplicable && (
                        <TableCell className="text-right text-green-600 font-medium">
                          -{formatAED(vatOnStandard - vatOnCepa)}
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Total */}
                    <TableRow className="bg-gray-50 font-bold">
                      <TableCell>Total Landed Cost</TableCell>
                      <TableCell className="text-right">
                        {formatAED(totalStandard)}
                      </TableCell>
                      {cepaApplicable && (
                        <TableCell className="text-right">
                          {formatAED(totalCepa)}
                        </TableCell>
                      )}
                      {cepaApplicable && (
                        <TableCell className="text-right text-green-600">
                          -{formatAED(totalStandard - totalCepa)}
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Savings Row */}
                    {cepaApplicable && savings > 0 && (
                      <TableRow className="bg-green-100">
                        <TableCell className="font-bold text-green-800">
                          YOUR SAVINGS
                        </TableCell>
                        <TableCell
                          colSpan={3}
                          className="text-center font-bold text-green-800"
                        >
                          {formatAED(savings)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default DutyCalculator;
