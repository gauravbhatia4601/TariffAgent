/**
 * Tariff data loading and indexing
 * Loads GCC tariff, CEPA schedules, and prohibited/restricted items from public/data
 * Matches Python project structure
 * Uses fs for server-side and fetch for client-side
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  TariffItem,
} from './types';

// Data structures matching Python project
interface GCCItem {
  hs_code: string;
  description_en: string;
  description_ar?: string;
  duty_gcc: number;
  category: string;
}

interface CEPAIndiaItem {
  hs_prefix: string;
  cepa_2025_duty: number;
  base_duty: number;
  note: string;
}

interface ProhibitedRestrictedItem {
  keyword: string;
  type: 'prohibited' | 'restricted';
  warning: string;
}

// Get the path to public/data directory
function getDataPath(filename: string): string {
  // In Next.js, public folder is at the root level
  // When running in server context, we need to resolve from process.cwd()
  if (typeof window === 'undefined') {
    // Server-side: use fs
    return join(process.cwd(), 'public', 'data', filename);
  }
  // Client-side: use fetch (but this shouldn't be called client-side)
  throw new Error('Client-side data loading not supported - use API routes');
}

// In-memory caches
let gccDataCache: Map<string, GCCItem> | null = null;
let cepaIndiaCache: Map<string, CEPAIndiaItem> | null = null;
let cepaTurkeyCache: Map<string, CEPAIndiaItem> | null = null;
let prohibitedKeywordsCache: ProhibitedRestrictedItem[] | null = null;
let restrictedKeywordsCache: ProhibitedRestrictedItem[] | null = null;

/**
 * Load GCC tariff data from public/data
 */
async function loadGCCData(): Promise<Map<string, GCCItem>> {
  if (gccDataCache) return gccDataCache;

  try {
    const filePath = getDataPath('gcc-hs-2025-dubai-common.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data: GCCItem[] = JSON.parse(fileContent);
    
    gccDataCache = new Map();
    data.forEach(item => {
      gccDataCache!.set(item.hs_code, item);
    });
    
    console.log(`✅ Loaded ${gccDataCache.size} GCC tariff items`);
    return gccDataCache;
  } catch (error) {
    console.error('Error loading GCC data:', error);
    return new Map();
  }
}

/**
 * Load CEPA India schedule from public/data
 */
async function loadCEPAIndia(): Promise<Map<string, CEPAIndiaItem>> {
  if (cepaIndiaCache) return cepaIndiaCache;

  try {
    const filePath = getDataPath('cepa-india-2025-schedule.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data: CEPAIndiaItem[] = JSON.parse(fileContent);
    
    cepaIndiaCache = new Map();
    data.forEach(item => {
      cepaIndiaCache!.set(item.hs_prefix, item);
    });
    
    console.log(`✅ Loaded ${cepaIndiaCache.size} CEPA India entries`);
    return cepaIndiaCache;
  } catch (error) {
    console.error('Error loading CEPA India data:', error);
    return new Map();
  }
}

/**
 * Load CEPA Turkey schedule from public/data
 */
async function loadCEPATurkey(): Promise<Map<string, CEPAIndiaItem>> {
  if (cepaTurkeyCache) return cepaTurkeyCache;

  try {
    const filePath = getDataPath('cepa-turkey-2025-schedule.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data: CEPAIndiaItem[] = JSON.parse(fileContent);
    
    cepaTurkeyCache = new Map();
    data.forEach(item => {
      cepaTurkeyCache!.set(item.hs_prefix, item);
    });
    
    console.log(`✅ Loaded ${cepaTurkeyCache.size} CEPA Turkey entries`);
    return cepaTurkeyCache;
  } catch (error) {
    console.error('Error loading CEPA Turkey data:', error);
    return new Map();
  }
}

/**
 * Load prohibited/restricted keywords from public/data
 */
async function loadProhibitedRestricted(): Promise<{
  prohibited: ProhibitedRestrictedItem[];
  restricted: ProhibitedRestrictedItem[];
}> {
  if (prohibitedKeywordsCache && restrictedKeywordsCache) {
    return {
      prohibited: prohibitedKeywordsCache,
      restricted: restrictedKeywordsCache,
    };
  }

  try {
    const filePath = getDataPath('uae-prohibited-restricted-2025.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data: ProhibitedRestrictedItem[] = JSON.parse(fileContent);
    
    prohibitedKeywordsCache = data.filter(item => item.type === 'prohibited');
    restrictedKeywordsCache = data.filter(item => item.type === 'restricted');
    
    console.log(`✅ Loaded ${prohibitedKeywordsCache.length} prohibited and ${restrictedKeywordsCache.length} restricted keywords`);
    return {
      prohibited: prohibitedKeywordsCache,
      restricted: restrictedKeywordsCache,
    };
  } catch (error) {
    console.error('Error loading prohibited/restricted data:', error);
    return { prohibited: [], restricted: [] };
  }
}

/**
 * Normalize HS code by removing dots and spaces
 */
export function normalizeHSCode(hsCode: string): string {
  return hsCode.replace(/[\.\s-]/g, '').trim();
}

/**
 * Format HS code to standard format with dots
 */
export function formatHSCode(hsCode: string): string {
  const normalized = normalizeHSCode(hsCode);
  if (normalized.length >= 10) {
    return `${normalized.slice(0, 4)}.${normalized.slice(4, 6)}.${normalized.slice(6, 8)}.${normalized.slice(8)}`;
  } else if (normalized.length >= 6) {
    return `${normalized.slice(0, 4)}.${normalized.slice(4, 6)}`;
  }
  return hsCode;
}

/**
 * Get HS code prefix (first 2 digits) for CEPA lookup
 */
function getHSPrefix(hsCode: string): string {
  const normalized = normalizeHSCode(hsCode);
  return normalized.length >= 2 ? normalized.slice(0, 2) : '';
}

/**
 * Convert GCC item to TariffItem format
 */
function convertGCCItem(item: GCCItem): TariffItem {
  return {
    hs_code: item.hs_code,
    description_en: item.description_en,
    description_ar: item.description_ar || '',
    category: item.category,
    standard_duty_rate: item.duty_gcc,
    vat_rate: 5.0, // Standard VAT
    unit_of_measure: 'pcs', // Default
    additional_notes: null,
  };
}

/**
 * Get all tariff items (synchronous wrapper - loads data first)
 */
export async function getAllTariffItems(): Promise<TariffItem[]> {
  const gccData = await loadGCCData();
  return Array.from(gccData.values()).map(convertGCCItem);
}

/**
 * Get tariff item by HS code
 */
export async function getTariffItem(hsCode: string): Promise<TariffItem | undefined> {
  const gccData = await loadGCCData();
  const item = gccData.get(hsCode) || gccData.get(formatHSCode(hsCode));
  return item ? convertGCCItem(item) : undefined;
}

/**
 * Get CEPA duty rate for HS code and origin country
 */
export async function getCEPAItem(
  hsCode: string,
  originCountry: string = 'India'
): Promise<{ cepa_duty_rate: number; phase_out_schedule?: string } | undefined> {
  if (originCountry.toLowerCase() !== 'india' && originCountry.toLowerCase() !== 'turkey') {
    return undefined;
  }

  const prefix = getHSPrefix(hsCode);
  if (!prefix) return undefined;

  const cepaData = originCountry.toLowerCase() === 'india'
    ? await loadCEPAIndia()
    : await loadCEPATurkey();

  const cepaItem = cepaData.get(prefix);
  if (!cepaItem) return undefined;

  return {
    cepa_duty_rate: cepaItem.cepa_2025_duty,
    phase_out_schedule: cepaItem.note,
  };
}

/**
 * Check if description contains prohibited/restricted keywords
 */
export async function checkProhibitedRestricted(
  description: string
): Promise<{
  prohibited: boolean;
  restricted: boolean;
  prohibited_items: Array<{ keyword: string; warning: string }>;
  restricted_items: Array<{ keyword: string; warning: string }>;
}> {
  const { prohibited, restricted } = await loadProhibitedRestricted();
  const descLower = description.toLowerCase();

  const prohibitedMatches: Array<{ keyword: string; warning: string }> = [];
  const restrictedMatches: Array<{ keyword: string; warning: string }> = [];

  prohibited.forEach(item => {
    const keywordLower = item.keyword.toLowerCase();
    // Use word boundary matching to avoid false positives
    // For Arabic keywords, use simple includes
    const isArabic = /[\u0600-\u06FF]/.test(item.keyword);
    if (isArabic) {
      if (descLower.includes(keywordLower)) {
        prohibitedMatches.push({
          keyword: item.keyword,
          warning: item.warning,
        });
      }
    } else {
      // For English keywords, use word boundary regex
      const wordPattern = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (wordPattern.test(descLower)) {
        prohibitedMatches.push({
          keyword: item.keyword,
          warning: item.warning,
        });
      }
    }
  });

  restricted.forEach(item => {
    const keywordLower = item.keyword.toLowerCase();
    // Use word boundary matching to avoid false positives
    const wordPattern = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (wordPattern.test(descLower)) {
      restrictedMatches.push({
        keyword: item.keyword,
        warning: item.warning,
      });
    }
  });

  return {
    prohibited: prohibitedMatches.length > 0,
    restricted: restrictedMatches.length > 0,
    prohibited_items: prohibitedMatches,
    restricted_items: restrictedMatches,
  };
}

/**
 * Get prohibited items for an HS code (by checking description)
 */
export async function getProhibitedItems(hsCode: string): Promise<Array<{ keyword: string; warning: string }>> {
  const item = await getTariffItem(hsCode);
  if (!item) return [];
  
  const check = await checkProhibitedRestricted(item.description_en);
  return check.prohibited_items;
}

/**
 * Get restricted items for an HS code (by checking description)
 */
export async function getRestrictedItems(hsCode: string): Promise<Array<{ keyword: string; warning: string }>> {
  const item = await getTariffItem(hsCode);
  if (!item) return [];
  
  const check = await checkProhibitedRestricted(item.description_en);
  return check.restricted_items;
}

/**
 * Preload all data (call this on app initialization)
 */
export async function preloadAllData(): Promise<void> {
  await Promise.all([
    loadGCCData(),
    loadCEPAIndia(),
    loadCEPATurkey(),
    loadProhibitedRestricted(),
  ]);
  console.log('✅ All knowledge base data preloaded');
}
