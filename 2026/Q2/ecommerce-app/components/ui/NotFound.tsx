import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import Button from "./Button";

interface NotFoundProps {
  title?: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  fullscreen?: boolean;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  fullscreen: {
    flex: 1,
    paddingVertical: Spacing.xxl,
  },
  icon: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: "center",
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  button: {
    minWidth: 150,
  },
});

export default function NotFound({
  title = "Not Found",
  description = "The item you're looking for doesn't exist or has been removed.",
  icon = "📭",
  actionLabel = "Go Back",
  onActionPress,
  fullscreen = false,
}: NotFoundProps) {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[TextStyles.h2, styles.title]}>{title}</Text>
      <Text style={[TextStyles.body, styles.description]}>{description}</Text>
      {onActionPress && (
        <Button
          title={actionLabel}
          onPress={onActionPress}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}
