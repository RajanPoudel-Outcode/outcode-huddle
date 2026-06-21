/**
 * HeaderBackButton
 * A reliable header back control. Pops the stack when possible, otherwise falls
 * back to the profile tab — so the button always navigates somewhere sensible
 * regardless of how the screen was reached.
 */

import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

export default function HeaderBackButton() {
  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  return (
    <Pressable onPress={handlePress} hitSlop={12} style={styles.button}>
      <MaterialIcons name="arrow-back" size={24} color={Colors.text.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 4,
  },
});
