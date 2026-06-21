import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isDangerous?: boolean; // For logout/delete actions
}

export default function ProfileMenuItem({
  icon,
  label,
  onPress,
  isFirst = false,
  isLast = false,
  isDangerous = false,
}: ProfileMenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isFirst && styles.firstItem,
        isLast && styles.lastItem,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>{icon}</View>

      <Text
        style={[
          TextStyles.body,
          styles.label,
          isDangerous && styles.dangerousLabel,
        ]}
      >
        {label}
      </Text>

      <View style={styles.chevron}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={Colors.text.secondary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
    borderRadius: 8,
    elevation: 20,
  },
  firstItem: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  lastItem: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 0,
  },
  pressed: {
    backgroundColor: Colors.gray[100],
  },
  iconContainer: {
    marginRight: Spacing.md,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    flex: 1,
    color: Colors.text.primary,
  },
  dangerousLabel: {
    color: Colors.statusError,
  },
  chevron: {
    marginLeft: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
});
