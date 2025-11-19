/**
 * Translation utilities for TariffAgent
 * Supports English and Arabic translations
 */

export type Language = 'en' | 'ar';

// Translation keys
export const translations = {
  en: {
    // Header
    tagline: 'Instant HS Code Classification • CEPA Savings • Compliance Reports',
    poweredBy: 'Powered by',
    stats: {
      importers: '50K+ Importers',
      savings: 'AED 500-5000 Saved per Shipment',
      speed: '<10s Results',
    },
    // Project Description
    projectTitle: 'What is TariffAgent?',
    projectDescription: [
      'Automates HS code classification for UAE imports using AI-powered analysis',
      'Calculates CEPA (Comprehensive Economic Partnership Agreement) duty savings for India-origin goods',
      'Identifies prohibited and restricted items to prevent customs rejections',
      'Generates compliance reports with required documents for faster clearance',
      'Processes invoices in seconds instead of hours of manual classification work',
      'Reduces classification errors that lead to delays and penalties',
      'Supports both English and Arabic for UAE importers',
    ],
    // Common
    error: 'Error',
    loading: 'Loading...',
    // Disclaimer
    disclaimerTitle: 'Legal Disclaimer',
    disclaimerText: 'For reference only. Final classification authority rests with UAE Customs (FCA). Always verify with official sources before submission. Data current as of November 2025.',
  },
  ar: {
    // Header
    tagline: 'تصنيف فوري لرموز النظام المنسق • توفير اتفاقية الشراكة الاقتصادية الشاملة • تقارير الامتثال',
    poweredBy: 'مدعوم من',
    stats: {
      importers: '50 ألف+ مستورد',
      savings: '500-5000 درهم إماراتي محفوظة لكل شحنة',
      speed: 'نتائج في أقل من 10 ثوانٍ',
    },
    // Project Description
    projectTitle: 'ما هو TariffAgent؟',
    projectDescription: [
      'أتمتة تصنيف رموز النظام المنسق للواردات الإماراتية باستخدام التحليل المدعوم بالذكاء الاصطناعي',
      'حساب توفير الرسوم الجمركية لاتفاقية الشراكة الاقتصادية الشاملة للبضائع ذات المنشأ الهندي',
      'تحديد المواد المحظورة والمقيدة لمنع رفض الجمارك',
      'إنشاء تقارير الامتثال مع المستندات المطلوبة لتسريع الإفراج',
      'معالجة الفواتير في ثوانٍ بدلاً من ساعات من العمل اليدوي للتصنيف',
      'تقليل أخطاء التصنيف التي تؤدي إلى التأخير والغرامات',
      'دعم اللغة الإنجليزية والعربية للمستوردين الإماراتيين',
    ],
    // Common
    error: 'خطأ',
    loading: 'جاري التحميل...',
    // Disclaimer
    disclaimerTitle: 'إخلاء مسؤولية قانوني',
    disclaimerText: 'للرجوع فقط. السلطة النهائية للتصنيف تقع على عاتق جمارك الإمارات (هيئة الفيدرالية للجمارك). تحقق دائماً من المصادر الرسمية قبل التقديم. البيانات محدثة حتى نوفمبر 2025.',
  },
};

/**
 * Get translation for current language
 */
export function getTranslation(lang: Language = 'en') {
  return translations[lang];
}

/**
 * Get current language from document
 */
export function getCurrentLanguage(): Language {
  if (typeof document === 'undefined') return 'en';
  return document.documentElement.lang === 'ar' ? 'ar' : 'en';
}

/**
 * Hook to use translations (for client components)
 * Note: This is a simple version. For reactive updates, components should
 * use useState/useEffect to watch for language changes.
 */
export function useTranslation() {
  if (typeof window === 'undefined') {
    return translations.en;
  }
  
  const lang = getCurrentLanguage();
  return translations[lang];
}

/**
 * Get translation by key (for server components or static usage)
 */
export function t(key: string, lang: Language = 'en'): string {
  const keys = key.split('.');
  let value: unknown = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English
      value = translations.en;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }
  
  return value || key;
}

