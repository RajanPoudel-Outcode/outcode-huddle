export const Colors = {
  // Primary Brand Color
  primary: "#7D7D7D",
  primaryDark: "#000000",
  primaryLight: "#B3B3B3",

  // Secondary Brand Color
  secondary: "#7D7D7D",
  secondaryDark: "#000000",
  secondaryLight: "#B3B3B3",

  // Semantic Colors
  success: "#138F4D",
  error: "#F21A1A",
  warning: "#F21A1A",
  info: "#7D7D7D",

  // Neutral Colors
  white: "#FFFFFF",
  black: "#000000",

  // Grayscale
  gray: {
    10: "#E6E6E6", // Black10
    20: "#DFDFDF", // Black20
    30: "#B3B3B3", // Black30
    40: "#7D7D7D", // Black40
    50: "#F9F9FD", // Background
    100: "#FFFFFF",
  },

  bg: {
    primary: "#FFFFFF",
    secondary: "#F9F9FD",
    tertiary: "#F9F9FD",
  },

  // Text Colors
  text: {
    primary: "#000000",
    secondary: "#7D7D7D",
    tertiary: "#B3B3B3",
    inverse: "#FFFFFF",
  },

  // Border Colors
  border: "#DEDEDE",

  // Status Colors
  statusSuccess: "#138F4D",
  statusError: "#F21A1A",

  // Status Colors with opacity
  overlay: "rgba(0, 0, 0, 0.5)",
};

export type ColorKey = keyof typeof Colors;
