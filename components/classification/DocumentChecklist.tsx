'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, FileText, Package, Plane, ScrollText, Award } from 'lucide-react';

interface DocumentChecklistProps {
  documents: string[];
  cepaApplicable: boolean;
}

// Icon mapping for document types
function getDocumentIcon(doc: string): React.ReactNode {
  const docLower = doc.toLowerCase();

  if (docLower.includes('certificate of origin')) {
    return <Award className="h-5 w-5 text-[#00732F]" />;
  }
  if (docLower.includes('invoice')) {
    return <FileText className="h-5 w-5 text-blue-600" />;
  }
  if (docLower.includes('packing')) {
    return <Package className="h-5 w-5 text-orange-600" />;
  }
  if (docLower.includes('bill of lading') || docLower.includes('airway bill')) {
    return <Plane className="h-5 w-5 text-purple-600" />;
  }
  if (docLower.includes('permit') || docLower.includes('license')) {
    return <ScrollText className="h-5 w-5 text-amber-600" />;
  }
  return <CheckCircle2 className="h-5 w-5 text-gray-500" />;
}

// Check if document is CEPA-related
function isCEPADocument(doc: string): boolean {
  const docLower = doc.toLowerCase();
  return (
    docLower.includes('cepa') ||
    docLower.includes('certificate of origin') ||
    docLower.includes('preferential')
  );
}

export function DocumentChecklist({
  documents,
  cepaApplicable,
}: DocumentChecklistProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          📄 Required Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document List */}
        <div className="space-y-2">
          {documents.map((doc, index) => {
            const isCepa = isCEPADocument(doc);
            return (
              <div
                key={index}
                className={`
                  flex items-center gap-3
                  p-3
                  rounded-lg
                  border
                  transition-colors
                  ${
                    isCepa && cepaApplicable
                      ? 'bg-green-50 border-green-200 border-l-4 border-l-[#00732F]'
                      : 'bg-white border-gray-200 border-l-4 border-l-gray-400'
                  }
                `}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {getDocumentIcon(doc)}
                </div>

                {/* Document Name */}
                <div className="flex-1">
                  <span
                    className={`
                      text-sm
                      ${isCepa && cepaApplicable ? 'font-semibold text-green-800' : 'text-gray-700'}
                    `}
                  >
                    {doc}
                  </span>
                </div>

                {/* Visual Checkbox */}
                <div className="flex-shrink-0">
                  <div
                    className={`
                      w-5 h-5
                      rounded
                      border-2
                      flex items-center justify-center
                      ${
                        isCepa && cepaApplicable
                          ? 'border-[#00732F] bg-green-50'
                          : 'border-gray-300 bg-gray-50'
                      }
                    `}
                  >
                    {/* Empty checkbox - visual only */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CEPA Origin Requirements Info */}
        {cepaApplicable && (
          <Alert className="bg-green-50 border-green-200">
            <Award className="h-4 w-4 text-[#00732F]" />
            <AlertDescription className="text-green-800 text-xs">
              <strong>CEPA Origin Requirements:</strong>
              <ul className="mt-1 space-y-0.5">
                <li>
                  • Certificate of Origin must be issued by authorized Indian
                  authority
                </li>
                <li>
                  • Must prove goods qualify as Indian origin under CEPA rules
                </li>
                <li>• Valid for 12 months from date of issue</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Document Tips */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <p className="font-semibold mb-1">📋 Document Tips:</p>
          <ul className="space-y-0.5">
            <li>• Ensure all documents are in English or Arabic</li>
            <li>• Keep original copies for customs inspection</li>
            <li>• Verify document authenticity before submission</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentChecklist;
