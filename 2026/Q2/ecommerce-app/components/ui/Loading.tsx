import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface LoadingProps {
  visible?: boolean;
  size?: "small" | "large";
  color?: string;
  message?: string;
  fullscreen?: boolean;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  message: {
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
});

export default function Loading({
  visible = true,
  size = "large",
  color = Colors.primary,
  message,
  fullscreen = false,
}: LoadingProps) {
  if (!visible) return null;

  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={[TextStyles.body, styles.message]}>{message}</Text>
      )}
    </View>
  );
}
