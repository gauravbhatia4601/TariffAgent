/**
 * PDF Duty Table Component
 *
 * Displays a detailed duty breakdown table comparing
 * Standard GCC duties vs CEPA preferential duties with savings.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, formatCurrency, formatPercentage } from './styles';

export interface DutyTableProps {
  /** Standard GCC duty percentage */
  standardDuty: number;
  /** CEPA preferential duty percentage */
  cepaDuty: number;
  /** CIF (Cost, Insurance, Freight) value in AED */
  cifValue: number;
  /** VAT rate (default 5%) */
  vatRate?: number;
}

/**
 * DutyTable Component
 *
 * Comprehensive duty breakdown table showing:
 * - CIF Value
 * - Duty rates (Standard vs CEPA)
 * - Customs duty amounts
 * - VAT calculations
 * - Total payable
 * - Highlighted savings
 */
export const DutyTable: React.FC<DutyTableProps> = ({
  standardDuty,
  cepaDuty,
  cifValue,
  vatRate = 5,
}) => {
  // Calculate duty amounts
  const standardDutyAmount = (standardDuty / 100) * cifValue;
  const cepaDutyAmount = (cepaDuty / 100) * cifValue;
  const savingsAmount = standardDutyAmount - cepaDutyAmount;

  // Calculate VAT (on CIF + Duty)
  const standardVatBase = cifValue + standardDutyAmount;
  const standardVat = (vatRate / 100) * standardVatBase;

  const cepaVatBase = cifValue + cepaDutyAmount;
  const cepaVat = (vatRate / 100) * cepaVatBase;

  const vatSavings = standardVat - cepaVat;

  // Total payable
  const standardTotal = standardDutyAmount + standardVat;
  const cepaTotal = cepaDutyAmount + cepaVat;
  const totalSavings = standardTotal - cepaTotal;

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <Text style={styles.sectionHeader}>DUTY CALCULATION BREAKDOWN</Text>
      <View style={styles.sectionDivider} />

      {/* Duty Table */}
      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Item</Text>
          <Text style={styles.tableHeaderCell}>Standard GCC</Text>
          <Text style={styles.tableHeaderCell}>CEPA Rate</Text>
          <Text style={styles.tableHeaderCell}>Savings</Text>
        </View>

        {/* CIF Value Row */}
        <View style={styles.tableRowAlt}>
          <Text style={[styles.tableCellBold, { flex: 2 }]}>CIF Value</Text>
          <Text style={styles.tableCellRight}>{formatCurrency(cifValue)}</Text>
          <Text style={styles.tableCellRight}>{formatCurrency(cifValue)}</Text>
          <Text style={styles.tableCellRight}>-</Text>
        </View>

        {/* Duty Rate Row */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableCellBold, { flex: 2 }]}>Duty Rate</Text>
          <Text style={styles.tableCellRight}>{formatPercentage(standardDuty)}</Text>
          <Text style={styles.tableCellRight}>{formatPercentage(cepaDuty)}</Text>
          <Text style={styles.tableCellSavings}>
            {formatPercentage(standardDuty - cepaDuty)}
          </Text>
        </View>

        {/* Customs Duty Row */}
        <View style={styles.tableRowAlt}>
          <Text style={[styles.tableCellBold, { flex: 2 }]}>Customs Duty</Text>
          <Text style={styles.tableCellRight}>{formatCurrency(standardDutyAmount)}</Text>
          <Text style={styles.tableCellRight}>{formatCurrency(cepaDutyAmount)}</Text>
          <Text style={styles.tableCellSavings}>{formatCurrency(savingsAmount)}</Text>
        </View>

        {/* VAT Row */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableCellBold, { flex: 2 }]}>VAT ({vatRate}%)</Text>
          <Text style={styles.tableCellRight}>{formatCurrency(standardVat)}</Text>
          <Text style={styles.tableCellRight}>{formatCurrency(cepaVat)}</Text>
          <Text style={styles.tableCellSavings}>{formatCurrency(vatSavings)}</Text>
        </View>

        {/* Total Row */}
        <View style={styles.tableRowTotal}>
          <Text style={[styles.tableCellBold, { flex: 2, color: '#00732F', fontSize: 11 }]}>
            TOTAL PAYABLE
          </Text>
          <Text style={styles.tableCellTotal}>{formatCurrency(standardTotal)}</Text>
          <Text style={styles.tableCellTotal}>{formatCurrency(cepaTotal)}</Text>
          <Text style={[styles.tableCellSavings, { fontSize: 11 }]}>
            {formatCurrency(totalSavings)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default DutyTable;
