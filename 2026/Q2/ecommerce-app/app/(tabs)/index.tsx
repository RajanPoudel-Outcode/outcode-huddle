import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={TextStyles.h1}>Welcome to Shop Hub</Text>
        <Text style={TextStyles.bodySmall}>Browse our collection</Text>
      </View>

      {/* Products section placeholder */}
      <View style={styles.section}>
        <Text style={TextStyles.h3}>Featured Products</Text>
        <View style={styles.placeholder}>
          <Text style={TextStyles.body}>Product listing coming soon</Text>
        </View>
      </View>

      {/* Categories section placeholder */}
      <View style={styles.section}>
        <Text style={TextStyles.h3}>Categories</Text>
        <View style={styles.placeholder}>
          <Text style={TextStyles.body}>Category browsing coming soon</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  placeholder: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
});
