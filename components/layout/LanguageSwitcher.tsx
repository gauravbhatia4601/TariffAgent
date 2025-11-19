'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Check if RTL is already set
    if (typeof document !== 'undefined') {
      const currentDir = document.documentElement.dir;
      setIsRTL(currentDir === 'rtl');
    }
  }, []);

  const toggleLanguage = () => {
    const newRTL = !isRTL;
    setIsRTL(newRTL);

    if (typeof document !== 'undefined') {
      document.documentElement.dir = newRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = newRTL ? 'ar' : 'en';
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span>{isRTL ? 'English' : 'العربية'}</span>
    </Button>
  );
}

