'use client';

interface CEPABannerProps {
  savingsAmount: number;
  standardDuty: number;
  cepaDuty: number;
}

export function CEPABanner({
  savingsAmount,
  standardDuty,
  cepaDuty,
}: CEPABannerProps) {
  // Don't render if no savings
  if (savingsAmount <= 0) {
    return null;
  }

  // Calculate savings percentage
  const savingsPercentage =
    standardDuty > 0 ? ((standardDuty - cepaDuty) / standardDuty) * 100 : 0;

  // Format currency
  const formatAED = (value: number) =>
    new Intl.NumberFormat('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div
      className="
        relative
        overflow-hidden
        bg-gradient-to-r from-green-100 to-green-50
        border-2 border-[#00732F]
        rounded-xl
        p-6
        shadow-lg
        animate-cepa-pulse
      "
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] bg-repeat" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Title */}
        <h3 className="text-xl md:text-2xl font-extrabold text-[#00732F] text-center mb-4">
          🎉 YOU SAVE UNDER UAE-INDIA CEPA!
        </h3>

        {/* Savings Amount */}
        <div className="text-center">
          <p
            className="
              text-4xl md:text-5xl lg:text-6xl
              font-black
              text-[#00732F]
              animate-shimmer
              bg-gradient-to-r from-[#00732F] via-[#FFD700] to-[#00732F]
              bg-[length:200%_auto]
              bg-clip-text
            "
            style={{
              WebkitBackgroundClip: 'text',
            }}
          >
            AED {formatAED(savingsAmount)}
          </p>
        </div>

        {/* Savings Percentage */}
        <p className="text-center text-lg text-[#00732F] mt-3 font-semibold">
          ({savingsPercentage.toFixed(1)}% duty reduction)
        </p>

        {/* Decorative Elements */}
        <div className="absolute top-2 left-2 text-2xl animate-bounce-slow">
          🇮🇳
        </div>
        <div className="absolute top-2 right-2 text-2xl animate-bounce-slow delay-100">
          🇦🇪
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-lg opacity-60">
          ✨ CEPA Benefits Applied ✨
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes cepa-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.01);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-cepa-pulse {
          animation: cepa-pulse 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 100ms;
        }
      `}</style>
    </div>
  );
}

export default CEPABanner;
