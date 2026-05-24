/**
 * Spacing Scale
 * Consistent spacing values for padding, margin, and gaps
 */

export const Spacing = {
  xs: 4, // Extra small - tight spacing
  sm: 8, // Small - small gaps
  md: 16, // Medium - standard gap (default)
  lg: 24, // Large - large gaps
  xl: 32, // Extra large - extra large gaps
  xxl: 56, // 2x Large - maximum spacing
};

export type SpacingKey = keyof typeof Spacing;
