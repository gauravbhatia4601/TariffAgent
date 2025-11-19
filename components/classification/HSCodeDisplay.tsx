'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HSCodeDisplayProps {
  hsCode: string;
  descriptionEnglish: string;
  descriptionArabic?: string;
  category: string;
  animate?: boolean;
}

export function HSCodeDisplay({
  hsCode,
  descriptionEnglish,
  descriptionArabic,
  category,
  animate = false,
}: HSCodeDisplayProps) {
  return (
    <Card
      className={`border-2 border-gray-200 shadow-lg ${
        animate ? 'animate-celebration' : ''
      }`}
    >
      <CardContent className="p-6">
        {/* HS Code Display */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
            HS Code
          </p>
          <div
            className={`
              bg-gradient-to-r from-gray-50 to-white
              border-2 border-gray-200
              rounded-xl
              p-6
              shadow-inner
              ${animate ? 'animate-pulse-once' : ''}
            `}
          >
            <p
              className="
                text-3xl md:text-4xl lg:text-5xl
                font-mono font-bold
                text-gray-900
                tracking-wider
              "
            >
              {hsCode}
            </p>
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-3">
          {/* English Description */}
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 uppercase mb-1">
              English Description
            </p>
            <p className="text-gray-900 font-medium">{descriptionEnglish}</p>
          </div>

          {/* Arabic Description */}
          {descriptionArabic && (
            <div
              className="bg-white p-4 rounded-lg border border-gray-100"
              dir="rtl"
            >
              <p className="text-xs text-gray-500 uppercase mb-1 text-right">
                الوصف بالعربية
              </p>
              <p className="text-gray-900 font-medium">{descriptionArabic}</p>
            </div>
          )}

          {/* Category Badge */}
          <div className="flex justify-center pt-2">
            <Badge
              variant="secondary"
              className="px-4 py-1 text-sm bg-gray-100 text-gray-700"
            >
              📦 {category}
            </Badge>
          </div>
        </div>
      </CardContent>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes celebration {
          0%,
          100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.02) rotate(1deg);
          }
          75% {
            transform: scale(1.02) rotate(-1deg);
          }
        }

        @keyframes pulse-once {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 115, 47, 0.4);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(0, 115, 47, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 115, 47, 0);
          }
        }

        .animate-celebration {
          animation: celebration 0.6s ease-in-out;
        }

        .animate-pulse-once {
          animation: pulse-once 1s ease-out;
        }
      `}</style>
    </Card>
  );
}

export default HSCodeDisplay;
