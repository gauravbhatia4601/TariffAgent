'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-[#00732F] border-t-transparent animate-spin',
          sizeClasses[size]
        )}
        style={{
          borderTopColor: 'transparent',
          borderRightColor: '#00732F',
          borderBottomColor: '#00732F',
          borderLeftColor: '#00732F',
        }}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

// Alternative spinner with UAE colors
export function UAESpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer ring - UAE Green */}
      <div
        className="absolute inset-0 rounded-full border-4 border-t-[#00732F] border-r-transparent border-b-transparent border-l-transparent animate-spin"
        style={{ animationDuration: '1s' }}
      />
      {/* Middle ring - UAE Red */}
      <div
        className="absolute inset-1 rounded-full border-4 border-t-[#EF3340] border-r-transparent border-b-transparent border-l-transparent animate-spin"
        style={{ animationDuration: '1.2s', animationDirection: 'reverse' }}
      />
      {/* Inner ring - Gold */}
      <div
        className="absolute inset-2 rounded-full border-4 border-t-[#FFD700] border-r-transparent border-b-transparent border-l-transparent animate-spin"
        style={{ animationDuration: '1.4s' }}
      />
    </div>
  );
}

// Dots loader
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-1', className)}>
      <div
        className="w-2 h-2 bg-[#00732F] rounded-full animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <div
        className="w-2 h-2 bg-[#00732F] rounded-full animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <div
        className="w-2 h-2 bg-[#00732F] rounded-full animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
}

export default LoadingSpinner;
