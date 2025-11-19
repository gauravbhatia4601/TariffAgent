'use client';

import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation, getCurrentLanguage } from '@/lib/utils/translations';

export function Header() {
  const t = useTranslation();

  useEffect(() => {
    // Update language when document language changes
    const updateLang = () => {
      getCurrentLanguage();
    };

    // Check on mount
    updateLang();

    // Listen for language changes
    const observer = new MutationObserver(updateLang);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['dir', 'lang'],
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm relative" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative">
        {/* Language Toggle - Top right, responsive */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 rtl:left-2 rtl:right-auto sm:rtl:left-4 z-10">
          <LanguageSwitcher />
        </div>

        {/* Main Header Content */}
        <div className="flex flex-col items-center text-center pt-8 sm:pt-0">
          {/* Branding */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <span className="text-2xl sm:text-3xl" role="img" aria-label="UAE Flag">
              🇦🇪
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#00732F' }}>
              TariffAgent
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-3 sm:mb-4 px-2">
            {t.tagline}
          </p>

          {/* Powered By Badge */}
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            <span>{t.poweredBy}</span>
            <Badge variant="secondary" className="font-semibold text-xs sm:text-sm">
              Google Gemini 2.5 Pro
            </Badge>
            <span>🤖</span>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-6">
            <Badge
              variant="outline"
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-50 border-gray-300"
            >
              🏢 {t.stats.importers}
            </Badge>
            <Badge
              variant="outline"
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-50 border-gray-300"
            >
              💰 {t.stats.savings}
            </Badge>
            <Badge
              variant="outline"
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-50 border-gray-300"
            >
              ⚡ {t.stats.speed}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
