import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export type SnackbarVariant = "info" | "success" | "warning" | "error";

interface SnackbarProps {
  visible: boolean;
  message: string;
  duration?: number;
  variant?: SnackbarVariant;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.text.primary,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  message: {
    flex: 1,
    color: "#FFF",
  },
  action: {
    marginLeft: Spacing.md,
  },
  actionText: {
    color: Colors.primary,
    fontWeight: "600",
  },
});

export default function Snackbar({
  visible,
  message,
  duration = 3000,
  variant = "info",
  onDismiss,
  action,
}: SnackbarProps) {
  const [opacity] = useState(new Animated.Value(0));

  const variantColors = {
    info: "#2196F3",
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
  };

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss?.();
      });
    }
  }, [visible, duration, opacity, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: variantColors[variant],
          opacity,
        },
      ]}
    >
      <Text style={[TextStyles.body, styles.message]} numberOfLines={2}>
        {message}
      </Text>
      {action && (
        <View style={styles.action}>
          <Text style={styles.actionText} onPress={action.onPress}>
            {action.label}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
