/**
 * Typography Styles
 * Consistent text styles across the app
 */

import { StyleSheet, TextStyle } from "react-native";
import { Colors } from "./colors";

export const TextStyles = StyleSheet.create<Record<string, TextStyle>>({
  // Heading Styles
  h1: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
    color: Colors.text.primary,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 32,
    color: Colors.text.primary,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
    color: Colors.text.primary,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    color: Colors.text.primary,
  },

  // Body Styles
  body: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 22,
    color: Colors.text.primary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 22,
    color: Colors.text.secondary,
  },

  // Caption Styles
  caption: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    color: Colors.text.secondary,
  },
  captionSmall: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    color: Colors.text.tertiary,
  },

  // Button Style
  button: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    color: Colors.white,
  },
  buttonSmall: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    color: Colors.white,
  },

  // Label Style
  label: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    color: Colors.text.secondary,
  },

  // Link Style
  link: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    color: Colors.primary,
  },
});

export type TextStyleKey = keyof typeof TextStyles;
