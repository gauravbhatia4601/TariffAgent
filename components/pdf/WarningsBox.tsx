/**
 * PDF Warnings Box Component
 *
 * Displays warnings for prohibited and restricted items
 * with appropriate color-coded boxes.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, STATUS_COLORS } from './styles';

export interface WarningsBoxProps {
  /** Whether the item is prohibited */
  prohibited: boolean;
  /** Whether the item is restricted */
  restricted: boolean;
  /** List of warning messages */
  warnings: string[];
}

/**
 * WarningsBox Component
 *
 * Color-coded warning boxes:
 * - Red box for prohibited items (import not allowed)
 * - Yellow box for restricted items (special approval required)
 * - List of additional warnings
 * - Contact information for UAE authorities
 *
 * Only renders if there are warnings to display.
 */
export const WarningsBox: React.FC<WarningsBoxProps> = ({
  prohibited,
  restricted,
  warnings,
}) => {
  // Don't render if no warnings
  const hasWarnings = prohibited || restricted || warnings.length > 0;
  if (!hasWarnings) {
    return null;
  }

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <Text style={styles.sectionHeader}>WARNINGS & RESTRICTIONS</Text>
      <View style={[styles.sectionDivider, { backgroundColor: STATUS_COLORS.warningRed }]} />

      {/* Prohibited Item Warning */}
      {prohibited && (
        <View style={styles.warningBoxRed}>
          <Text style={[styles.warningTitle, { color: '#721C24' }]}>
            PROHIBITED ITEM - IMPORT NOT ALLOWED
          </Text>
          <Text style={[styles.warningText, { color: '#721C24' }]}>
            This item is prohibited for import into the UAE under customs regulations.
            Attempting to import this item may result in seizure, fines, and legal action.
          </Text>
        </View>
      )}

      {/* Restricted Item Warning */}
      {restricted && !prohibited && (
        <View style={styles.warningBoxYellow}>
          <Text style={[styles.warningTitle, { color: '#856404' }]}>
            RESTRICTED ITEM - SPECIAL APPROVAL REQUIRED
          </Text>
          <Text style={[styles.warningText, { color: '#856404' }]}>
            This item requires special permits, licenses, or approvals from UAE authorities
            before import clearance can be granted. Contact the relevant authority for
            application procedures.
          </Text>
        </View>
      )}

      {/* Additional Warnings List */}
      {warnings.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.descriptionLabel}>Additional Warnings:</Text>
          {warnings.map((warning, index) => (
            <Text
              key={index}
              style={{
                fontSize: 10,
                fontFamily: 'Helvetica-Bold',
                color: STATUS_COLORS.warningRed,
                marginBottom: 4,
              }}
            >
              {'\u26A0'} {warning}
            </Text>
          ))}
        </View>
      )}

      {/* Contact Information */}
      <View style={styles.contactContainer}>
        <Text style={styles.contactText}>
          <Text style={styles.contactLabel}>UAE Federal Customs Authority Contact:</Text>
        </Text>
        <Text style={styles.contactText}>Phone: +971 2 401 2333</Text>
        <Text style={styles.contactText}>Email: info@fca.gov.ae</Text>
        <Text style={styles.contactText}>Website: www.fca.gov.ae</Text>
      </View>
    </View>
  );
};

export default WarningsBox;
