import { Button, Snackbar } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAuth } from "@/features/auth";
import { ordersService, PAYMENT_COD, SHIPPING_FEE } from "@/features/orders";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import type { RootState } from "@/store";
import { clearCart } from "@/store/slices/cartSlice";
import { ErrorHandler } from "@/utils/error-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const items = useAppSelector((s: RootState) => s.cart.items);
  const subtotal = useAppSelector((s: RootState) => s.cart.total);

  const [address, setAddress] = useState("");
  const [toast, setToast] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  const total = subtotal + SHIPPING_FEE;
  const addressValid =
    address.trim().length >= 10 && address.trim().length <= 500;
  const canPlace = items.length > 0 && addressValid && !isPlacing;

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={TextStyles.h3}>Please log in</Text>
        <Text style={[TextStyles.body, styles.muted]}>
          You need to be logged in to check out.
        </Text>
        <Button
          title="Go Back"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="cart-outline"
          size={56}
          color={Colors.gray[30]}
        />
        <Text style={TextStyles.h3}>Your cart is empty</Text>
        <Button
          title="Continue Shopping"
          variant="secondary"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    );
  }

  const handlePlaceOrder = async () => {
    if (!canPlace) return;
    setIsPlacing(true);
    try {
      const res = await ordersService.createOrder({
        orderItems: items.map((i) => ({
          product: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
        shippingAddress: address.trim(),
        paymentMethod: PAYMENT_COD,
        totalTax: 0,
        shippingPrice: SHIPPING_FEE,
        totalPrice: total,
      });
      dispatch(clearCart());
      router.replace(`/order-confirmation?id=${res.data.id}`);
    } catch (err) {
      setToast(ErrorHandler.getUserMessage(err));
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Order summary */}
        <Text style={[TextStyles.h4, styles.sectionTitle]}>Order Summary</Text>
        <View style={styles.card}>
          {items.map((item) => (
            <View key={item.productId} style={styles.itemRow}>
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta}>
                  Qty {item.quantity} × ${item.price.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping address */}
        <Text style={[TextStyles.h4, styles.sectionTitle]}>
          Shipping Address
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder="Full delivery address (street, city, ZIP)"
          placeholderTextColor={Colors.text.tertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        {address.length > 0 && !addressValid ? (
          <Text style={styles.hint}>Address must be 10–500 characters.</Text>
        ) : null}

        {/* Payment method — Cash on Delivery only */}
        <Text style={[TextStyles.h4, styles.sectionTitle]}>Payment Method</Text>
        <View style={[styles.card, styles.paymentRow]}>
          <MaterialCommunityIcons name="cash" size={24} color={Colors.success} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>Cash on Delivery</Text>
            <Text style={styles.itemMeta}>
              Pay with cash when your order arrives
            </Text>
          </View>
          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color={Colors.success}
          />
        </View>

        {/* Totals */}
        <View style={styles.summary}>
          <Row label="Sub Total" value={`$${subtotal.toFixed(2)}`} />
          <Row label="Shipping & Tax" value={`$${SHIPPING_FEE.toFixed(2)}`} />
          <Row label="Total" value={`$${total.toFixed(2)}`} bold />
        </View>

        <Button
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={isPlacing}
          disabled={!canPlace}
          size="large"
          style={styles.place}
        />
      </ScrollView>

      <Snackbar
        visible={!!toast}
        message={toast}
        variant="error"
        onDismiss={() => setToast("")}
      />
    </KeyboardAvoidingView>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[TextStyles.body, bold && styles.bold]}>{label}</Text>
      <Text style={[TextStyles.body, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg.secondary },
  container: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.bg.secondary,
  },
  muted: { color: Colors.text.secondary, textAlign: "center" },
  sectionTitle: { marginTop: Spacing.md, marginBottom: Spacing.sm },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  itemRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.gray[10],
  },
  itemInfo: { flex: 1 },
  itemName: { ...TextStyles.body, fontWeight: "600", color: Colors.text.primary },
  itemMeta: { ...TextStyles.caption, color: Colors.text.secondary, marginTop: 2 },
  itemTotal: { ...TextStyles.body, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text.primary,
    fontSize: 15,
    backgroundColor: Colors.bg.primary,
  },
  textArea: { minHeight: 96 },
  hint: { ...TextStyles.caption, color: Colors.error, marginTop: Spacing.xs },
  paymentRow: { flexDirection: "row", alignItems: "center" },
  summary: { gap: Spacing.xs, marginTop: Spacing.lg },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontWeight: "700", color: Colors.text.primary },
  place: { width: "100%", marginTop: Spacing.lg },
});
