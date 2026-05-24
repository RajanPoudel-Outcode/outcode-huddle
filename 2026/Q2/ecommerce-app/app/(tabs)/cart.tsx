import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAppSelector } from "@/hooks/useRedux";
import type { RootState } from "@/store";
import { StyleSheet, Text, View } from "react-native";

export default function CartScreen() {
  const cartItems = useAppSelector((state: RootState) => state.cart.items);
  const cartTotal = useAppSelector((state: RootState) => state.cart.total);
  const itemCount = useAppSelector((state: RootState) => state.cart.itemCount);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={TextStyles.h1}>Shopping Cart</Text>
        <Text style={TextStyles.bodySmall}>{itemCount} items</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={TextStyles.h3}>Your cart is empty</Text>
          <Text style={TextStyles.body}>Add items to get started</Text>
        </View>
      ) : (
        <>
          {/* Cart items list */}
          <View style={styles.section}>
            <Text style={TextStyles.h3}>Items</Text>
            <View style={styles.placeholder}>
              <Text style={TextStyles.body}>{itemCount} item(s) in cart</Text>
            </View>
          </View>

          {/* Summary section */}
          <View style={styles.section}>
            <View style={styles.summaryRow}>
              <Text style={TextStyles.body}>Subtotal</Text>
              <Text style={TextStyles.body}>${cartTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={TextStyles.body}>Shipping</Text>
              <Text style={TextStyles.body}>$0.00</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={TextStyles.h4}>Total</Text>
              <Text style={TextStyles.h4}>${cartTotal.toFixed(2)}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.md,
    // paddingTop: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    marginVertical: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[20],
    marginVertical: Spacing.md,
  },
});
