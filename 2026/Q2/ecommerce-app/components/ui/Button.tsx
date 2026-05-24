import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  spinner: {
    marginRight: Spacing.sm,
  },
});

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  // Size configurations
  const sizeConfigs = {
    small: { padding: Spacing.sm, fontSize: 14 },
    medium: { padding: Spacing.md, fontSize: 16 },
    large: { padding: Spacing.lg, fontSize: 18 },
  };

  const sizeConfig = sizeConfigs[size];

  // Variant configurations
  const variantConfigs = {
    primary: {
      backgroundColor: Colors.primary,
      color: "#FFF",
    },
    secondary: {
      backgroundColor: "transparent",
      color: Colors.secondary,
    },
  };

  const variantConfig = variantConfigs[variant];

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variantConfig.backgroundColor,
          paddingHorizontal: sizeConfig.padding,
          paddingVertical: sizeConfig.padding * 0.75,
          opacity: pressed ? 0.8 : 1,
        },
        variant === "secondary" && [
          styles.secondaryButton,
          { borderColor: Colors.secondary },
        ],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantConfig.color}
          style={styles.spinner}
        />
      ) : (
        <Text
          style={[
            styles.text,
            TextStyles.button,
            {
              color: variantConfig.color,
              fontSize: sizeConfig.fontSize,
              fontWeight: "600",
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
