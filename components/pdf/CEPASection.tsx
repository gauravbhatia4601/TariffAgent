/**
 * PDF CEPA Benefits Section Component
 *
 * Displays CEPA (Comprehensive Economic Partnership Agreement)
 * benefits, savings amount, and origin requirements.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, formatCurrency } from './styles';

export interface CEPASectionProps {
  /** Whether CEPA is applicable */
  applicable: boolean;
  /** Total savings amount in AED */
  savingsAmount: number;
  /** Explanation of the savings */
  savingsExplanation: string;
  /** Country of origin */
  originCountry: string;
}

/**
 * CEPASection Component
 *
 * Highlighted green box showing:
 * - CEPA qualification status
 * - Total savings amount (in gold)
 * - Explanation of benefits
 * - Origin requirements checklist
 * - Important notes about Certificate of Origin
 *
 * Only renders if CEPA is applicable.
 */
export const CEPASection: React.FC<CEPASectionProps> = ({
  applicable,
  savingsAmount,
  savingsExplanation,
  originCountry,
}) => {
  // Don't render if CEPA is not applicable
  if (!applicable) {
    return null;
  }

  // Origin requirements for CEPA
  const originRequirements = [
    `Goods must be consigned from ${originCountry} to UAE`,
    "Goods must qualify as 'originating' under CEPA Rules of Origin",
    "Valid Certificate of Origin (Form CEPA) required",
    `Certificate must be issued by authorized ${originCountry} authority`,
    "Direct consignment (trans-shipment allowed with conditions)",
  ];

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <Text style={styles.sectionHeader}>CEPA PREFERENTIAL BENEFITS</Text>
      <View style={[styles.sectionDivider, { backgroundColor: '#28A745' }]} />

      {/* CEPA Qualification Banner */}
      <View style={styles.cepaBox}>
        <Text style={styles.cepaBoxText}>
          THIS SHIPMENT QUALIFIES FOR CEPA PREFERENTIAL TARIFF
        </Text>

        {/* Savings Amount */}
        {savingsAmount > 0 && (
          <Text style={styles.cepaSavingsText}>
            Total Savings: {formatCurrency(savingsAmount)}
          </Text>
        )}
      </View>

      {/* Savings Explanation */}
      {savingsExplanation && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{savingsExplanation}</Text>
        </View>
      )}

      {/* Origin Requirements */}
      <View style={{ marginTop: 12 }}>
        <Text style={styles.descriptionLabel}>Origin Requirements:</Text>
        <View style={styles.requirementsList}>
          {originRequirements.map((req, index) => (
            <Text key={index} style={styles.requirementItem}>
              {'\u2022'} {req}
            </Text>
          ))}
        </View>
      </View>

      {/* Certificate of Origin Note */}
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxText}>
          <Text style={styles.boldText}>IMPORTANT: </Text>
          Certificate of Origin must be obtained before shipment. The certificate
          is valid for 12 months from date of issue. Ensure all information
          matches your commercial invoice exactly.
        </Text>
      </View>
    </View>
  );
};

export default CEPASection;
