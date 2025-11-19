/**
 * PDF StyleSheet and Theme Configuration for TariffAgent Compliance Reports
 *
 * Defines consistent styling using @react-pdf/renderer StyleSheet API
 * with UAE national colors and professional B2B aesthetic.
 */

import { StyleSheet } from '@react-pdf/renderer';

/**
 * UAE National Theme Colors
 */
export const UAE_COLORS = {
  green: '#00732F',      // UAE flag green - primary brand color
  gold: '#FFD700',       // Gold accent
  red: '#EF3340',        // UAE flag red
  black: '#000000',
  white: '#FFFFFF',
};

/**
 * Semantic Colors for Status and Feedback
 */
export const STATUS_COLORS = {
  cepaGreen: '#28A745',      // Success/CEPA benefits
  warningYellow: '#FFC107',  // Warnings/restrictions
  warningRed: '#DC3545',     // Errors/prohibited
  lightGray: '#F5F5F5',      // Backgrounds
  darkGray: '#333333',       // Body text
  mediumGray: '#666666',     // Secondary text
  borderGray: '#E0E0E0',     // Borders
};

/**
 * Confidence Level Colors
 */
export const CONFIDENCE_COLORS = {
  high: '#28A745',       // >= 95%
  moderate: '#FFC107',   // >= 85%
  low: '#DC3545',        // < 85%
};

/**
 * Main StyleSheet for PDF Components
 */
export const styles = StyleSheet.create({
  // Page Layout
  page: {
    padding: 40,
    paddingTop: 100, // Space for header
    paddingBottom: 80, // Space for footer
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: UAE_COLORS.white,
  },

  // Header Styles
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: UAE_COLORS.green,
    padding: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: UAE_COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: UAE_COLORS.gold,
  },

  // Metadata Section
  metadataContainer: {
    marginBottom: 20,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metadataLabel: {
    width: 100,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: UAE_COLORS.green,
    textAlign: 'right',
    paddingRight: 10,
  },
  metadataValue: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.darkGray,
  },

  // Section Styles
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: UAE_COLORS.green,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: UAE_COLORS.green,
    marginBottom: 12,
  },

  // HS Code Display
  hsCodeContainer: {
    alignItems: 'center',
    marginVertical: 12,
    padding: 16,
    backgroundColor: STATUS_COLORS.lightGray,
    borderRadius: 4,
  },
  hsCodeText: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#667eea',
    letterSpacing: 2,
  },

  // Confidence Display
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: STATUS_COLORS.darkGray,
    marginRight: 8,
  },
  confidenceValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginRight: 8,
  },
  confidenceStatus: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },

  // Description Styles
  descriptionContainer: {
    marginBottom: 12,
  },
  descriptionLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: STATUS_COLORS.darkGray,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.darkGray,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
  arabicText: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.darkGray,
    textAlign: 'right',
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.darkGray,
  },

  // Table Styles
  table: {
    width: '100%',
    marginVertical: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: UAE_COLORS.green,
    padding: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: UAE_COLORS.white,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: STATUS_COLORS.borderGray,
    padding: 8,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: STATUS_COLORS.borderGray,
    padding: 8,
    backgroundColor: STATUS_COLORS.lightGray,
  },
  tableRowTotal: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#E8F5E9',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.darkGray,
  },
  tableCellBold: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: STATUS_COLORS.darkGray,
  },
  tableCellRight: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.darkGray,
    textAlign: 'right',
  },
  tableCellSavings: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: STATUS_COLORS.cepaGreen,
    textAlign: 'right',
  },
  tableCellTotal: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: UAE_COLORS.green,
    textAlign: 'right',
  },

  // Highlight Boxes
  cepaBox: {
    backgroundColor: '#D4EDDA',
    borderWidth: 2,
    borderColor: STATUS_COLORS.cepaGreen,
    padding: 15,
    marginVertical: 12,
    borderRadius: 4,
  },
  cepaBoxText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#155724',
    textAlign: 'center',
  },
  cepaSavingsText: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: UAE_COLORS.gold,
    textAlign: 'center',
    marginTop: 8,
  },

  warningBoxRed: {
    backgroundColor: '#F8D7DA',
    borderWidth: 3,
    borderColor: STATUS_COLORS.warningRed,
    padding: 15,
    marginVertical: 12,
    borderRadius: 4,
  },
  warningBoxYellow: {
    backgroundColor: '#FFF3CD',
    borderWidth: 2,
    borderColor: STATUS_COLORS.warningYellow,
    padding: 12,
    marginVertical: 12,
    borderRadius: 4,
  },
  warningTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },

  // Origin Requirements
  requirementsList: {
    marginTop: 8,
    paddingLeft: 10,
  },
  requirementItem: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.darkGray,
    marginBottom: 4,
  },

  // Documents List
  documentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  checkbox: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginRight: 8,
    width: 16,
  },
  documentText: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.darkGray,
  },

  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 0.5,
    borderTopColor: STATUS_COLORS.mediumGray,
    paddingTop: 8,
    paddingHorizontal: 40,
  },
  footerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  footerDisclaimer: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.mediumGray,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerGenerated: {
    fontSize: 8,
    fontFamily: 'Helvetica-Oblique',
    color: STATUS_COLORS.mediumGray,
  },
  footerTimestamp: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.mediumGray,
  },
  pageNumber: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.mediumGray,
  },

  // Utility Styles
  boldText: {
    fontFamily: 'Helvetica-Bold',
  },
  italicText: {
    fontFamily: 'Helvetica-Oblique',
  },
  centerText: {
    textAlign: 'center',
  },
  rightText: {
    textAlign: 'right',
  },
  spacer: {
    height: 12,
  },
  spacerLarge: {
    height: 20,
  },

  // Info Box (for notes and additional info)
  infoBox: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: STATUS_COLORS.warningYellow,
    padding: 10,
    marginVertical: 8,
    borderRadius: 4,
  },
  infoBoxText: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#856404',
    lineHeight: 1.3,
  },

  // Contact Info
  contactContainer: {
    marginTop: 12,
  },
  contactText: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: STATUS_COLORS.darkGray,
    marginBottom: 2,
  },
  contactLabel: {
    fontFamily: 'Helvetica-Bold',
  },
});

/**
 * Helper function to get confidence color based on score
 */
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 95) return CONFIDENCE_COLORS.high;
  if (confidence >= 85) return CONFIDENCE_COLORS.moderate;
  return CONFIDENCE_COLORS.low;
};

/**
 * Helper function to get confidence label based on score
 */
export const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 95) return 'High Confidence';
  if (confidence >= 85) return 'Moderate Confidence';
  return 'Low Confidence';
};

/**
 * Format currency in AED
 */
export const formatCurrency = (value: number): string => {
  return `AED ${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
