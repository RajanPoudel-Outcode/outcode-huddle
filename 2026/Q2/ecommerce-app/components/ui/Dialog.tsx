import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Button from "./Button";

interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  dismissText?: string;
  variant?: "info" | "success" | "warning" | "error";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialog: {
    backgroundColor: Colors.bg.primary,
    borderRadius: 12,
    padding: Spacing.lg,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  message: {
    marginBottom: Spacing.lg,
    color: Colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "flex-end",
  },
  button: {
    flex: 1,
  },
  iconContainer: {
    marginBottom: Spacing.md,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function Dialog({
  visible,
  title,
  message,
  onDismiss,
  onConfirm,
  confirmText = "Confirm",
  dismissText = "Cancel",
  variant = "info",
}: DialogProps) {
  const variantColors = {
    info: Colors.info,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
  };

  const iconColor = variantColors[variant];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.container} onPress={onDismiss}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <View
              style={[styles.iconContainer, { backgroundColor: iconColor }]}
            >
              <Text style={{ fontSize: 24 }}>
                {variant === "info" && "ℹ️"}
                {variant === "success" && "✓"}
                {variant === "warning" && "⚠️"}
                {variant === "error" && "✕"}
              </Text>
            </View>
            <Text style={[TextStyles.h3, styles.title]}>{title}</Text>
          </View>

          <Text style={[TextStyles.body, styles.message]}>{message}</Text>

          <View style={styles.actions}>
            <Button
              title={dismissText}
              onPress={onDismiss}
              variant="secondary"
              style={styles.button}
            />
            {onConfirm && (
              <Button
                title={confirmText}
                onPress={onConfirm}
                variant="primary"
                style={styles.button}
              />
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
