/**
 * PDF HS Code Section Component
 *
 * Displays the classified HS code with confidence score,
 * descriptions in English and Arabic, and category.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, getConfidenceColor, getConfidenceLabel } from './styles';

export interface HSCodeSectionProps {
  /** 12-digit HS code (format: XXXX.XX.XX.XXXX) */
  hsCode: string;
  /** Confidence score (0-100) */
  confidence: number;
  /** English description of the tariff item */
  descriptionEn: string;
  /** Arabic description of the tariff item */
  descriptionAr: string;
  /** Tariff category */
  category: string;
}

/**
 * HSCodeSection Component
 *
 * Prominent display of the HS code classification result including:
 * - Large formatted HS code
 * - Color-coded confidence indicator
 * - Bilingual descriptions (English/Arabic)
 * - Tariff category
 */
export const HSCodeSection: React.FC<HSCodeSectionProps> = ({
  hsCode,
  confidence,
  descriptionEn,
  descriptionAr,
  category,
}) => {
  const confidenceColor = getConfidenceColor(confidence);
  const confidenceLabel = getConfidenceLabel(confidence);

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <Text style={styles.sectionHeader}>HS CODE CLASSIFICATION</Text>
      <View style={styles.sectionDivider} />

      {/* HS Code Display */}
      <View style={styles.hsCodeContainer}>
        <Text style={styles.hsCodeText}>{hsCode}</Text>
      </View>

      {/* Confidence Score */}
      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Confidence Score:</Text>
        <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
          {confidence.toFixed(1)}%
        </Text>
        <Text style={[styles.confidenceStatus, { color: confidenceColor }]}>
          {confidenceLabel}
        </Text>
      </View>

      {/* English Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>Description (English):</Text>
        <Text style={styles.descriptionText}>{descriptionEn}</Text>
      </View>

      {/* Arabic Description */}
      {descriptionAr && descriptionAr.trim() !== '' && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description (Arabic):</Text>
          <Text style={styles.arabicText}>{descriptionAr}</Text>
        </View>
      )}

      {/* Category */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.categoryText}>
          <Text style={styles.boldText}>Tariff Category: </Text>
          {category}
        </Text>
      </View>
    </View>
  );
};

export default HSCodeSection;
