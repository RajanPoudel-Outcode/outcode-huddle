import { Button, Snackbar } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import type { RootState } from "@/store";
import {
  clearCart,
  removeFromCart,
  updateQuantity,
  type CartItem,
} from "@/store/slices/cartSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const SHIPPING = 15;

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s: RootState) => s.cart.items);
  const subtotal = useAppSelector((s: RootState) => s.cart.total);
  const [toast, setToast] = useState("");

  const total = items.length > 0 ? subtotal + SHIPPING : 0;

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        {item.brand ? <Text style={styles.brand}>{item.brand}</Text> : null}
        {item.color ? <Text style={styles.variant}>Color: {item.color}</Text> : null}
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => dispatch(removeFromCart(item.productId))} hitSlop={8}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.text.secondary} />
        </Pressable>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() =>
              dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))
            }
          >
            <MaterialCommunityIcons name="minus" size={16} color={Colors.text.primary} />
          </Pressable>
          <Text style={styles.qty}>{item.quantity}</Text>
          <Pressable
            style={styles.stepBtn}
            onPress={() =>
              dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))
            }
          >
            <MaterialCommunityIcons name="plus" size={16} color={Colors.text.primary} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={TextStyles.h1}>Cart</Text>
        {items.length > 0 ? (
          <Pressable onPress={() => dispatch(clearCart())} hitSlop={8}>
            <MaterialCommunityIcons name="trash-can-outline" size={24} color={Colors.text.primary} />
          </Pressable>
        ) : null}
      </View>

      {items.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="cart-outline" size={56} color={Colors.gray[30]} />
          <Text style={[TextStyles.h3, { marginTop: Spacing.sm }]}>Your cart is empty</Text>
          <Text style={TextStyles.body}>Add items to get started</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.productId}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Promo (UI only) */}
          <View style={styles.promo}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.promoInput}
              placeholder="Enter Promo Code"
              placeholderTextColor={Colors.text.secondary}
            />
            <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.text.secondary} />
          </View>

          {/* Summary */}
          <View style={styles.summary}>
            <Row label="Sub Total" value={`$${subtotal.toFixed(2)}`} />
            <Row label="Shipping & Tax" value={`$${SHIPPING.toFixed(2)}`} />
            <Row label="Total" value={`$${total.toFixed(2)}`} bold />
          </View>

          <Button
            title="Checkout"
            onPress={() => setToast("Checkout coming soon")}
            size="large"
            style={styles.checkout}
          />
        </>
      )}

      <Snackbar visible={!!toast} message={toast} variant="info" onDismiss={() => setToast("")} />
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[TextStyles.body, bold && styles.bold]}>{label}</Text>
      <Text style={[TextStyles.body, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary, paddingHorizontal: Spacing.md },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.xs },
  list: { paddingBottom: Spacing.md, gap: Spacing.md },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    gap: Spacing.md,
  },
  image: { width: 72, height: 72, borderRadius: 10, backgroundColor: Colors.gray[10] },
  info: { flex: 1, justifyContent: "center" },
  name: { ...TextStyles.h4 },
  brand: { ...TextStyles.caption, color: Colors.primary },
  variant: { ...TextStyles.caption, marginTop: 2 },
  price: { ...TextStyles.h4, marginTop: Spacing.xs },
  actions: { justifyContent: "space-between", alignItems: "flex-end" },
  stepper: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: { ...TextStyles.body, minWidth: 18, textAlign: "center" },
  promo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.md,
  },
  promoInput: { flex: 1, color: Colors.text.primary, fontSize: 15 },
  summary: { gap: Spacing.xs, marginBottom: Spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontWeight: "700", color: Colors.text.primary },
  checkout: { width: "100%", marginBottom: Spacing.lg },
});
