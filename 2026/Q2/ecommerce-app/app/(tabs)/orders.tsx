import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={TextStyles.h1}>My Orders</Text>
        <Text style={TextStyles.bodySmall}>Track your purchases</Text>
      </View>

      {/* Empty Orders State */}
      <View style={styles.emptyState}>
        <View style={styles.placeholder}>
          <Text style={TextStyles.h3}>No Orders Yet</Text>
          <Text style={TextStyles.body}>Your orders will appear here</Text>
        </View>
      </View>

      {/* Filter/Sort Options - Placeholder */}
      <View style={styles.section}>
        <Text style={TextStyles.h3}>Order Filters</Text>
        <View style={styles.filterContainer}>
          <View style={styles.filterChip}>
            <Text style={TextStyles.caption}>All Orders</Text>
          </View>
          <View style={styles.filterChip}>
            <Text style={TextStyles.caption}>Pending</Text>
          </View>
          <View style={styles.filterChip}>
            <Text style={TextStyles.caption}>Delivered</Text>
          </View>
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: "center",
    minHeight: 200,
    justifyContent: "center",
  },
  filterContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  filterChip: {
    backgroundColor: Colors.gray[20],
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
