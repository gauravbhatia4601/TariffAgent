/**
 * PDF Report Header Component
 *
 * Displays TariffAgent branding, report title, ID, and date.
 * Renders as a fixed header at the top of each PDF page.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';

export interface ReportHeaderProps {
  /** Unique report identifier (e.g., TCR-20250119143022) */
  reportId: string;
  /** Formatted date string for the report */
  date: string;
  /** Optional origin country for the shipment */
  originCountry?: string;
  /** Optional CIF value for display in header metadata */
  cifValue?: number;
}

/**
 * ReportHeader Component
 *
 * Fixed header that appears at the top of the PDF page with:
 * - TariffAgent brand name
 * - UAE Customs Compliance Report subtitle
 * - Report metadata (ID, date, origin, value)
 */
export const ReportHeader: React.FC<ReportHeaderProps> = ({
  reportId,
  date,
  originCountry,
  cifValue,
}) => {
  return (
    <>
      {/* Green header banner */}
      <View style={styles.header} fixed>
        <Text style={styles.headerTitle}>TariffAgent</Text>
        <Text style={styles.headerSubtitle}>UAE Customs Compliance Report</Text>
      </View>

      {/* Report metadata section */}
      <View style={styles.metadataContainer}>
        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Report ID:</Text>
          <Text style={styles.metadataValue}>{reportId}</Text>
        </View>

        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Date:</Text>
          <Text style={styles.metadataValue}>{date}</Text>
        </View>

        <View style={styles.metadataRow}>
          <Text style={styles.metadataLabel}>Time:</Text>
          <Text style={styles.metadataValue}>
            {new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Dubai',
            })} GST
          </Text>
        </View>

        {originCountry && (
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Origin:</Text>
            <Text style={styles.metadataValue}>{originCountry}</Text>
          </View>
        )}

        {cifValue !== undefined && cifValue > 0 && (
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>CIF Value:</Text>
            <Text style={styles.metadataValue}>
              AED {cifValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

export default ReportHeader;
