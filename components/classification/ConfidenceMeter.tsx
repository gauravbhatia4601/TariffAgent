'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface ConfidenceMeterProps {
  confidence: number;
  showLabel?: boolean;
}

function getConfidenceColor(confidence: number): {
  color: string;
  bgColor: string;
  label: string;
} {
  if (confidence >= 95) {
    return {
      color: '#22c55e', // Green
      bgColor: 'bg-green-100',
      label: 'High Confidence',
    };
  } else if (confidence >= 85) {
    return {
      color: '#eab308', // Yellow
      bgColor: 'bg-yellow-100',
      label: 'Medium Confidence',
    };
  } else {
    return {
      color: '#ef4444', // Red
      bgColor: 'bg-red-100',
      label: 'Low Confidence',
    };
  }
}

export function ConfidenceMeter({
  confidence,
  showLabel = true,
}: ConfidenceMeterProps) {
  const { color, bgColor, label } = getConfidenceColor(confidence);

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              Confidence Score
            </h4>
            <span
              className="text-lg font-bold"
              style={{ color }}
            >
              {confidence.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <Progress
              value={confidence}
              className="h-4 rounded-full bg-gray-200"
              style={
                {
                  '--progress-background': color,
                } as React.CSSProperties
              }
            />
            {/* Custom colored fill */}
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${confidence}%`,
                backgroundColor: color,
              }}
            />
          </div>

          {/* Confidence Label */}
          {showLabel && (
            <div className="flex items-center justify-center">
              <span
                className={`
                  inline-flex items-center
                  px-3 py-1
                  rounded-full
                  text-xs font-medium
                  ${bgColor}
                `}
                style={{ color }}
              >
                {confidence >= 95 && '✅ '}
                {confidence >= 85 && confidence < 95 && '⚠️ '}
                {confidence < 85 && '❗ '}
                {label}
              </span>
            </div>
          )}

          {/* Confidence Guide */}
          <div className="text-xs text-gray-500 text-center">
            {confidence >= 95 && 'Classification is highly reliable'}
            {confidence >= 85 && confidence < 95 && 'Review recommended before submission'}
            {confidence < 85 && 'Manual verification strongly recommended'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ConfidenceMeter;
