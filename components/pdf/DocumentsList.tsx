/**
 * PDF Documents List Component
 *
 * Displays a checklist of required documents for customs clearance.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';

export interface DocumentsListProps {
  /** List of required document names */
  documents: string[];
  /** Whether to show CEPA-specific requirements */
  showCepaRequirements?: boolean;
  /** Whether item is restricted (shows permit requirements) */
  isRestricted?: boolean;
}

/**
 * DocumentsList Component
 *
 * Compliance checklist showing:
 * - Required documents with checkboxes
 * - CEPA-specific requirements (if applicable)
 * - Special permit requirements (if restricted)
 */
export const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  showCepaRequirements = false,
  isRestricted = false,
}) => {
  // CEPA-specific document requirements
  const cepaRequirements = [
    'Certificate of Origin (Form CEPA) from India',
    'Proof of direct consignment',
    'Compliance with CEPA Rules of Origin',
    'Invoice showing Indian origin',
  ];

  // Restricted item permit requirements
  const permitRequirements = [
    'Import permit from relevant UAE authority',
    'Compliance certificates (if applicable)',
  ];

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <Text style={styles.sectionHeader}>COMPLIANCE CHECKLIST</Text>
      <View style={styles.sectionDivider} />

      {/* Required Documents */}
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.descriptionLabel}>Required Documents:</Text>
        {documents.map((doc, index) => (
          <View key={index} style={styles.documentItem}>
            <Text style={styles.checkbox}>{'\u2610'}</Text>
            <Text style={styles.documentText}>{doc}</Text>
          </View>
        ))}
      </View>

      {/* CEPA Requirements */}
      {showCepaRequirements && (
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.descriptionLabel}>CEPA Requirements:</Text>
          {cepaRequirements.map((req, index) => (
            <View key={index} style={styles.documentItem}>
              <Text style={styles.checkbox}>{'\u2610'}</Text>
              <Text style={styles.documentText}>{req}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Special Permit Requirements */}
      {isRestricted && (
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.descriptionLabel}>Special Permits Required:</Text>
          {permitRequirements.map((req, index) => (
            <View key={index} style={styles.documentItem}>
              <Text style={styles.checkbox}>{'\u2610'}</Text>
              <Text style={styles.documentText}>{req}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default DocumentsList;
