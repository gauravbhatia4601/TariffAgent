/**
 * Prohibited and restricted item checking
 * Scans descriptions for red-flag keywords and returns warnings
 */

import {
  allProhibitedItems,
  allRestrictedItems,
  redFlagKeywords,
  getProhibitedItems,
  getRestrictedItems,
} from './tariff-data';
import type { ProhibitedCheckResult, ProhibitedItem, RestrictedItem } from './types';

/**
 * Normalize text for keyword matching
 * Converts to lowercase and removes extra whitespace
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if text contains any of the red-flag keywords
 *
 * @param text - Text to scan
 * @returns Array of matched keywords
 */
export function findRedFlagKeywords(text: string): string[] {
  const normalizedText = normalizeText(text);
  const matchedKeywords: string[] = [];

  for (const keyword of redFlagKeywords) {
    const normalizedKeyword = keyword.toLowerCase();
    if (normalizedText.includes(normalizedKeyword)) {
      matchedKeywords.push(keyword);
    }
  }

  return matchedKeywords;
}

/**
 * Check item description for prohibited keywords and return warnings
 * Scans against the red-flag keywords list and prohibited/restricted item descriptions
 *
 * @param description - Item description to check
 * @returns Prohibition check result with warnings and permits
 */
export function checkProhibited(description: string): ProhibitedCheckResult {
  const normalizedDescription = normalizeText(description);
  const matchedKeywords: string[] = [];
  const warnings: string[] = [];
  const requiredPermits: string[] = [];
  const matchedItems: ProhibitedCheckResult['matchedItems'] = [];

  let isProhibited = false;
  let isRestricted = false;

  // Check red-flag keywords
  const redFlags = findRedFlagKeywords(description);
  matchedKeywords.push(...redFlags);

  // Check against prohibited items
  for (const item of allProhibitedItems) {
    // Check if description matches item keywords
    const itemKeywords = [
      item.item_name.toLowerCase(),
      item.description_en.toLowerCase(),
      ...item.category.toLowerCase().split('_'),
    ];

    for (const keyword of itemKeywords) {
      if (
        keyword.length > 2 &&
        normalizedDescription.includes(keyword)
      ) {
        isProhibited = true;

        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }

        // Add warning message if not already added
        if (!warnings.includes(item.warning_message)) {
          warnings.push(item.warning_message);
        }

        // Add matched item
        const alreadyAdded = matchedItems.some(
          (m) => m.itemName === item.item_name && m.type === 'prohibited'
        );
        if (!alreadyAdded) {
          matchedItems.push({
            type: 'prohibited',
            itemName: item.item_name,
            description: item.description_en,
            penalty: item.penalty,
            warningMessage: item.warning_message,
          });
        }

        // Add required permits if any
        if (item.required_permits) {
          for (const permit of item.required_permits) {
            if (!requiredPermits.includes(permit)) {
              requiredPermits.push(permit);
            }
          }
        }

        break; // Found match for this item
      }
    }
  }

  // Check against restricted items
  for (const item of allRestrictedItems) {
    // Check if description matches item keywords
    const itemKeywords = [
      item.item_name.toLowerCase(),
      item.description_en.toLowerCase(),
      ...item.category.toLowerCase().split('_'),
    ];

    for (const keyword of itemKeywords) {
      if (
        keyword.length > 2 &&
        normalizedDescription.includes(keyword)
      ) {
        isRestricted = true;

        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }

        // Add warning message if not already added
        if (!warnings.includes(item.warning_message)) {
          warnings.push(item.warning_message);
        }

        // Add matched item
        const alreadyAdded = matchedItems.some(
          (m) => m.itemName === item.item_name && m.type === 'restricted'
        );
        if (!alreadyAdded) {
          matchedItems.push({
            type: 'restricted',
            itemName: item.item_name,
            description: item.description_en,
            penalty: item.penalty,
            warningMessage: item.warning_message,
          });
        }

        // Add required permits if any
        if (item.required_permits) {
          for (const permit of item.required_permits) {
            if (!requiredPermits.includes(permit)) {
              requiredPermits.push(permit);
            }
          }
        }

        break; // Found match for this item
      }
    }
  }

  // Add generic warning if red-flag keywords found but no specific item matched
  if (redFlags.length > 0 && !isProhibited && !isRestricted) {
    warnings.push(
      `Attention: Description contains sensitive keywords (${redFlags.join(', ')}). This item may require additional verification or documentation.`
    );
  }

  return {
    prohibited: isProhibited,
    restricted: isRestricted,
    warnings,
    requiredPermits,
    matchedKeywords,
    matchedItems,
  };
}

/**
 * Check if a specific keyword is prohibited
 *
 * @param keyword - Keyword to check
 * @returns True if keyword is in the red-flag list
 */
export function isProhibitedKeyword(keyword: string): boolean {
  const normalizedKeyword = keyword.toLowerCase().trim();
  return redFlagKeywords.some(
    (k) => k.toLowerCase() === normalizedKeyword
  );
}

/**
 * Get restriction details for a keyword
 * Returns the first matching prohibited or restricted item
 *
 * @param keyword - Keyword to search for
 * @returns Matching prohibited or restricted item, or undefined
 */
export function getRestrictionDetails(
  keyword: string
): ProhibitedItem | RestrictedItem | undefined {
  const normalizedKeyword = keyword.toLowerCase().trim();

  // Check prohibited items first
  for (const item of allProhibitedItems) {
    if (
      item.item_name.toLowerCase().includes(normalizedKeyword) ||
      item.description_en.toLowerCase().includes(normalizedKeyword) ||
      item.category.toLowerCase().includes(normalizedKeyword)
    ) {
      return item;
    }
  }

  // Check restricted items
  for (const item of allRestrictedItems) {
    if (
      item.item_name.toLowerCase().includes(normalizedKeyword) ||
      item.description_en.toLowerCase().includes(normalizedKeyword) ||
      item.category.toLowerCase().includes(normalizedKeyword)
    ) {
      return item;
    }
  }

  return undefined;
}

/**
 * Check restrictions by HS code
 *
 * @param hsCode - HS code to check
 * @returns Prohibition check result
 */
export function checkRestrictionsByHSCode(hsCode: string): ProhibitedCheckResult {
  const warnings: string[] = [];
  const requiredPermits: string[] = [];
  const matchedKeywords: string[] = [];
  const matchedItems: ProhibitedCheckResult['matchedItems'] = [];

  let isProhibited = false;
  let isRestricted = false;

  // Get prohibited items for this HS code
  const prohibitedItems = getProhibitedItems(hsCode);
  for (const item of prohibitedItems) {
    isProhibited = true;
    warnings.push(item.warning_message);
    matchedKeywords.push(item.item_name);

    matchedItems.push({
      type: 'prohibited',
      itemName: item.item_name,
      description: item.description_en,
      penalty: item.penalty,
      warningMessage: item.warning_message,
    });

    if (item.required_permits) {
      requiredPermits.push(...item.required_permits);
    }
  }

  // Get restricted items for this HS code
  const restrictedItems = getRestrictedItems(hsCode);
  for (const item of restrictedItems) {
    isRestricted = true;
    warnings.push(item.warning_message);
    matchedKeywords.push(item.item_name);

    matchedItems.push({
      type: 'restricted',
      itemName: item.item_name,
      description: item.description_en,
      penalty: item.penalty,
      warningMessage: item.warning_message,
    });

    if (item.required_permits) {
      requiredPermits.push(...item.required_permits);
    }
  }

  return {
    prohibited: isProhibited,
    restricted: isRestricted,
    warnings,
    requiredPermits: Array.from(new Set(requiredPermits)), // Remove duplicates
    matchedKeywords,
    matchedItems,
  };
}

/**
 * Get all red-flag keywords
 *
 * @returns Array of all red-flag keywords
 */
export function getAllRedFlagKeywords(): string[] {
  return [...redFlagKeywords];
}

/**
 * Check multiple descriptions at once
 *
 * @param descriptions - Array of descriptions to check
 * @returns Array of results
 */
export function checkMultipleItems(
  descriptions: string[]
): ProhibitedCheckResult[] {
  return descriptions.map((desc) => checkProhibited(desc));
}

/**
 * Get a formatted warning message for display
 *
 * @param result - Prohibition check result
 * @returns Formatted warning string
 */
export function formatProhibitionWarning(result: ProhibitedCheckResult): string {
  if (!result.prohibited && !result.restricted) {
    return '';
  }

  let message = '';

  if (result.prohibited) {
    message += 'PROHIBITED ITEM DETECTED\n';
    message += '=========================\n\n';
  } else if (result.restricted) {
    message += 'RESTRICTED ITEM - PERMIT REQUIRED\n';
    message += '===================================\n\n';
  }

  if (result.warnings.length > 0) {
    message += 'Warnings:\n';
    result.warnings.forEach((warning, i) => {
      message += `${i + 1}. ${warning}\n`;
    });
    message += '\n';
  }

  if (result.requiredPermits.length > 0) {
    message += 'Required Permits/Documents:\n';
    result.requiredPermits.forEach((permit) => {
      message += `- ${permit}\n`;
    });
    message += '\n';
  }

  if (result.matchedKeywords.length > 0) {
    message += `Matched keywords: ${result.matchedKeywords.join(', ')}\n`;
  }

  return message;
}

/**
 * Quick check if an item is likely prohibited or restricted
 *
 * @param description - Item description
 * @returns Object with quick check results
 */
export function quickCheck(description: string): {
  hasIssues: boolean;
  severity: 'none' | 'warning' | 'restricted' | 'prohibited';
  summary: string;
} {
  const result = checkProhibited(description);

  if (result.prohibited) {
    return {
      hasIssues: true,
      severity: 'prohibited',
      summary: `PROHIBITED - ${result.matchedItems[0]?.itemName || 'Item matches prohibited category'}`,
    };
  }

  if (result.restricted) {
    return {
      hasIssues: true,
      severity: 'restricted',
      summary: `RESTRICTED - Requires permit: ${result.matchedItems[0]?.itemName || 'Special import license required'}`,
    };
  }

  if (result.matchedKeywords.length > 0) {
    return {
      hasIssues: true,
      severity: 'warning',
      summary: `Contains sensitive keywords: ${result.matchedKeywords.join(', ')}`,
    };
  }

  return {
    hasIssues: false,
    severity: 'none',
    summary: 'No restrictions detected',
  };
}
