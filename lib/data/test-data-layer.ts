/**
 * Test file for data layer
 * Run with: npx ts-node --skip-project lib/data/test-data-layer.ts
 * Or import in a Next.js page to test
 */

import {
  // Data access
  getDataStats,
  getTariffItem,
  // Search
  searchHSCodes,
  searchByCategory,
  // CEPA
  getCEPABenefit,
  calculateCEPASavings,
  // Prohibited check
  checkProhibited,
  quickCheck,
  findRedFlagKeywords,
  // Unified
  searchAndEnrich,
  getCompleteInfo,
  classifyItem,
} from './index';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function testSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60));
}

export function runDataLayerTests() {
  testSection('Data Layer Statistics');
  const stats = getDataStats();
  console.log('Total tariff items:', stats.totalTariffItems);
  console.log('Total CEPA items:', stats.totalCEPAItems);
  console.log('Total prohibited items:', stats.totalProhibitedItems);
  console.log('Total restricted items:', stats.totalRestrictedItems);
  console.log('Red flag keywords:', stats.totalRedFlagKeywords);
  console.log('Categories:', stats.categories.join(', '));

  testSection('Test 1: Direct HS Code Lookup');
  const hsCode = '8517.12.00.0000';
  const tariffItem = getTariffItem(hsCode);
  if (tariffItem) {
    log(`PASS: Found HS code ${hsCode}`, colors.green);
    console.log(`  Description: ${tariffItem.description_en}`);
    console.log(`  Duty rate: ${tariffItem.standard_duty_rate}%`);
    console.log(`  Category: ${tariffItem.category}`);
  } else {
    log(`FAIL: HS code ${hsCode} not found`, colors.red);
  }

  testSection('Test 2: Fuzzy Search - "coffee beans"');
  const coffeeResults = searchHSCodes('coffee beans', 3);
  if (coffeeResults.length > 0) {
    log(`PASS: Found ${coffeeResults.length} results`, colors.green);
    coffeeResults.forEach((result) => {
      console.log(`  #${result.rank}: ${result.hs_code} - ${result.description_en.substring(0, 50)}...`);
      console.log(`       Confidence: ${result.confidence}%`);
    });
  } else {
    log('FAIL: No results for "coffee beans"', colors.red);
  }

  testSection('Test 3: Fuzzy Search - "mobile phones"');
  const mobileResults = searchHSCodes('mobile phones', 3);
  if (mobileResults.length > 0) {
    log(`PASS: Found ${mobileResults.length} results`, colors.green);
    mobileResults.forEach((result) => {
      console.log(`  #${result.rank}: ${result.hs_code} - ${result.description_en.substring(0, 50)}...`);
      console.log(`       Confidence: ${result.confidence}%, CEPA: ${result.has_cepa}`);
    });
  } else {
    log('FAIL: No results for "mobile phones"', colors.red);
  }

  testSection('Test 4: Search by Category');
  const jewelryItems = searchByCategory('gems_jewellery');
  if (jewelryItems.length > 0) {
    log(`PASS: Found ${jewelryItems.length} items in gems_jewellery`, colors.green);
    jewelryItems.slice(0, 3).forEach((item) => {
      console.log(`  ${item.hs_code}: ${item.description_en.substring(0, 40)}...`);
    });
  } else {
    log('FAIL: No items in gems_jewellery category', colors.red);
  }

  testSection('Test 5: CEPA Benefit Lookup');
  const cepaHSCode = '6203.42.00.0000'; // Cotton trousers - should have CEPA
  const cepaBenefit = getCEPABenefit(cepaHSCode, 'India');
  if (cepaBenefit && cepaBenefit.eligible) {
    log(`PASS: CEPA benefit found for ${cepaHSCode}`, colors.green);
    console.log(`  Standard duty: ${cepaBenefit.standardDuty}%`);
    console.log(`  CEPA duty: ${cepaBenefit.cepaDuty}%`);
    console.log(`  Savings: ${cepaBenefit.savingsPercent}%`);
    console.log(`  Origin requirements: ${cepaBenefit.originRequirements?.substring(0, 50)}...`);
  } else {
    log(`FAIL: CEPA benefit not found for ${cepaHSCode}`, colors.red);
  }

  testSection('Test 6: CEPA Savings Calculation');
  const cifValue = 10000; // AED 10,000
  const savings = calculateCEPASavings(cepaHSCode, 'India', cifValue);
  console.log(`CIF Value: AED ${cifValue}`);
  console.log(`Standard duty amount: AED ${savings.standardDutyAmount.toFixed(2)}`);
  console.log(`CEPA duty amount: AED ${savings.cepaDutyAmount.toFixed(2)}`);
  log(`Savings: AED ${savings.savingsAmount.toFixed(2)}`, colors.green);
  console.log(`\nExplanation: ${savings.savingsExplanation}`);

  testSection('Test 7: Non-India Origin (No CEPA)');
  const chinaResult = getCEPABenefit(cepaHSCode, 'China');
  if (chinaResult && !chinaResult.eligible) {
    log('PASS: Correctly identified non-eligible country', colors.green);
    console.log(`  Message: ${chinaResult.originRequirements}`);
  } else {
    log('FAIL: Should not be eligible for China origin', colors.red);
  }

  testSection('Test 8: Prohibited Item Check');
  const prohibitedDesc = 'Cocaine powder for import';
  const prohibitedCheck = checkProhibited(prohibitedDesc);
  if (prohibitedCheck.prohibited) {
    log('PASS: Correctly identified prohibited item', colors.green);
    console.log(`  Keywords: ${prohibitedCheck.matchedKeywords.join(', ')}`);
    console.log(`  Warnings: ${prohibitedCheck.warnings.length}`);
  } else {
    log('FAIL: Should have detected prohibited item', colors.red);
  }

  testSection('Test 9: Restricted Item Check');
  const restrictedDesc = 'Alcoholic beverages wine import';
  const restrictedCheck = checkProhibited(restrictedDesc);
  if (restrictedCheck.restricted) {
    log('PASS: Correctly identified restricted item', colors.green);
    console.log(`  Permits required: ${restrictedCheck.requiredPermits.length}`);
    restrictedCheck.requiredPermits.forEach((permit) => {
      console.log(`    - ${permit}`);
    });
  } else {
    log('FAIL: Should have detected restricted item', colors.red);
  }

  testSection('Test 10: Quick Check');
  const quickProhibited = quickCheck('Import heroin powder');
  console.log('Test: "Import heroin powder"');
  console.log(`  Has issues: ${quickProhibited.hasIssues}`);
  console.log(`  Severity: ${quickProhibited.severity}`);
  log(`  Summary: ${quickProhibited.summary}`, colors.red);

  const quickSafe = quickCheck('Cotton t-shirts from India');
  console.log('\nTest: "Cotton t-shirts from India"');
  console.log(`  Has issues: ${quickSafe.hasIssues}`);
  console.log(`  Severity: ${quickSafe.severity}`);
  log(`  Summary: ${quickSafe.summary}`, colors.green);

  testSection('Test 11: Red Flag Keywords');
  const testText = 'We want to import some gambling casino equipment';
  const redFlags = findRedFlagKeywords(testText);
  if (redFlags.length > 0) {
    log(`PASS: Found ${redFlags.length} red flag keywords`, colors.yellow);
    console.log(`  Keywords: ${redFlags.join(', ')}`);
  } else {
    log('FAIL: Should have found red flag keywords', colors.red);
  }

  testSection('Test 12: Unified Search and Enrich');
  const enriched = searchAndEnrich('gold jewelry', 'India', 3);
  console.log(`Search results: ${enriched.searchResults.length}`);
  console.log(`CEPA eligible: ${enriched.cepaEligible}`);
  console.log(`Prohibited: ${enriched.restrictions.prohibited}`);
  console.log(`Restricted: ${enriched.restrictions.restricted}`);
  if (enriched.searchResults.length > 0) {
    log('Top result:', colors.green);
    const top = enriched.searchResults[0];
    console.log(`  ${top.hs_code}: ${top.description_en}`);
    console.log(`  Confidence: ${top.confidence}%`);
  }

  testSection('Test 13: Complete Info');
  const completeInfo = getCompleteInfo('7113.19.00.0000', 'India'); // Jewelry
  if (completeInfo.found) {
    log('PASS: Got complete info', colors.green);
    console.log(`  HS Code: ${completeInfo.hs_code}`);
    console.log(`  Description: ${completeInfo.description_en?.substring(0, 50)}...`);
    console.log(`  Standard duty: ${completeInfo.tariff_info?.standard_duty_rate}%`);
    console.log(`  CEPA duty: ${completeInfo.tariff_info?.cepa_duty_rate}%`);
    console.log(`  Has CEPA benefit: ${completeInfo.tariff_info?.has_cepa_benefit}`);
    console.log(`  Savings: ${completeInfo.tariff_info?.savings_percent}%`);
  } else {
    log('FAIL: Complete info not found', colors.red);
  }

  testSection('Test 14: Item Classification');
  const classification = classifyItem('laptop computer notebook', 'India');
  if (classification.hs_code) {
    log('PASS: Classified item', colors.green);
    console.log(`  HS Code: ${classification.hs_code}`);
    console.log(`  Confidence: ${classification.confidence}%`);
    console.log(`  Duty rate: ${classification.duty_rate}%`);
    console.log(`  CEPA eligible: ${classification.cepa_eligible}`);
  } else {
    log('FAIL: Could not classify item', colors.red);
  }

  testSection('Test 15: Arabic Search');
  const arabicResults = searchHSCodes('قهوة', 3); // Coffee in Arabic
  if (arabicResults.length > 0) {
    log(`PASS: Arabic search found ${arabicResults.length} results`, colors.green);
    arabicResults.forEach((result) => {
      console.log(`  #${result.rank}: ${result.hs_code}`);
      console.log(`       EN: ${result.description_en.substring(0, 40)}...`);
      console.log(`       AR: ${result.description_ar.substring(0, 40)}...`);
    });
  } else {
    log('FAIL: Arabic search returned no results', colors.yellow);
    console.log('  Note: Arabic search support depends on data having Arabic descriptions');
  }

  testSection('Test Summary');
  log('All data layer tests completed!', colors.bright + colors.green);
  console.log('\nThe data layer is ready for use in the TariffAgent Next.js app.');
  console.log('Import from: @/lib/data');
}

// Run tests if executed directly
if (typeof window === 'undefined' && require.main === module) {
  runDataLayerTests();
}

export default runDataLayerTests;
