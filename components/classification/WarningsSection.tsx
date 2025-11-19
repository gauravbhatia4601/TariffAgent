'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Ban, ShieldAlert } from 'lucide-react';

interface WarningsSectionProps {
  prohibited: boolean;
  restricted: boolean;
  warnings: string[];
  requiredPermits?: string[];
}

export function WarningsSection({
  prohibited,
  restricted,
  warnings,
  requiredPermits = [],
}: WarningsSectionProps) {
  // Don't render if no warnings
  if (!prohibited && !restricted && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Prohibited Item Alert */}
      {prohibited && (
        <Alert
          variant="destructive"
          className="border-2 border-red-600 bg-red-50"
        >
          <Ban className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 text-lg font-bold">
            🚫 PROHIBITED ITEM
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <p className="font-semibold mb-2">
              This item is <strong>PROHIBITED</strong> for import into the UAE.
            </p>
            <div className="bg-red-100 p-3 rounded-md border border-red-200">
              <p className="text-sm">
                <strong>⚠️ SHIPMENT WILL BE SEIZED</strong>
              </p>
              <p className="text-sm mt-1">
                Contact UAE Customs immediately. This shipment cannot proceed.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Restricted Item Alert */}
      {restricted && !prohibited && (
        <Alert className="border-2 border-amber-500 bg-amber-50">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800 text-lg font-bold">
            ⚠️ RESTRICTED ITEM
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="font-semibold mb-2">
              This item requires <strong>special permits or licenses</strong>{' '}
              for import.
            </p>
            <p className="text-sm">
              Ensure all required documentation is obtained before import.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Required Permits */}
      {requiredPermits.length > 0 && (
        <Alert className="border-2 border-blue-400 bg-blue-50">
          <ShieldAlert className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800 font-bold">
            📜 Required Permits
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {requiredPermits.map((permit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-blue-700"
                >
                  <span className="flex-shrink-0">•</span>
                  <span className="text-sm">{permit}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warning Messages */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Important Warnings
          </h4>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <Alert
                key={index}
                className="border border-amber-300 bg-amber-50 py-2"
              >
                <AlertDescription className="text-amber-700 text-sm">
                  {warning}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* General Compliance Note */}
      {(prohibited || restricted) && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs text-gray-600">
          <p className="font-semibold mb-1">📋 Compliance Reminder:</p>
          <p>
            For questions about restrictions and permits, contact UAE Customs
            (FCA) or a licensed customs broker before attempting import.
          </p>
        </div>
      )}
    </div>
  );
}

export default WarningsSection;
