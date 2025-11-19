'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-full space-y-4 sm:space-y-6">
      {/* About TariffAgent */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            📖 About TariffAgent
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-3">
          <p>
            TariffAgent uses advanced AI to classify goods under the UAE customs
            tariff system and calculate CEPA benefits for foreign imports.
          </p>
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">Key Features:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                12-digit HS code classification
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                CEPA duty savings calculator
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Restriction & prohibition checks
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Document requirement lists
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                PDF compliance reports
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🔧 How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00732F] text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <div>
                <span className="font-semibold text-gray-900">Input</span>
                <p className="text-xs mt-0.5">
                  Paste invoice or describe item
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00732F] text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              <div>
                <span className="font-semibold text-gray-900">AI Analysis</span>
                <p className="text-xs mt-0.5">
                  Google Gemini 2.5 Pro + Knowledge base
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00732F] text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <div>
                <span className="font-semibold text-gray-900">Results</span>
                <p className="text-xs mt-0.5">
                  Instant HS code + CEPA savings
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Powered By */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🤖 Powered By
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-900">
              Google Gemini 2.5 Pro
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Advanced AI Classification Engine
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            📊 Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="space-y-1">
            <li>• GCC Harmonized Tariff 2025</li>
            <li>• UAE-India CEPA Schedules</li>
            <li>• UAE Customs Regulations</li>
            <li>• 53 CEPA-eligible HS codes</li>
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer Banner */}
      <Alert className="bg-amber-50 border-amber-400 border-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 font-bold">
          Important Legal Disclaimer
        </AlertTitle>
        <AlertDescription className="text-amber-700 text-xs mt-2">
          <strong>This tool provides AI-assisted classification for reference only.</strong>
          <br />
          Final classification authority rests with UAE Customs (FCA). Always
          verify HS codes and duty rates with official sources before
          submission. TariffAgent is not responsible for any classification
          errors, duty miscalculations, or compliance issues. Data is current
          as of November 2025.
        </AlertDescription>
      </Alert>

      {/* Contact */}
      <Card>
        <CardHeader className="pb-3">
          {/* <CardTitle className="text-lg flex items-center gap-2">
            📞 Contact
          </CardTitle> */}
        </CardHeader>
      </Card>
    </aside>
  );
}

export default Sidebar;
