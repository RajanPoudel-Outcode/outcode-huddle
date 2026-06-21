import { Button, Dialog, Loading, NotFound, Snackbar } from "@/components/ui";
import { buildAssetUrl } from "@/constants/config";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_META,
  orderItemDisplay,
  useOrder,
} from "@/features/orders";
import { ErrorHandler } from "@/utils/error-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const formatDate = (iso?: string): string =>
  iso ? new Date(iso).toLocaleString() : "";

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order, isLoading, error, cancel, isCancelling } = useOrder(id);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toast, setToast] = useState("");

  if (isLoading) {
    return <Loading fullscreen message="Loading order…" />;
  }

  if (error || !order) {
    return (
      <NotFound
        fullscreen
        icon="⚠️"
        title="Order not found"
        description={error ?? "This order could not be loaded."}
        actionLabel="Go Back"
        onActionPress={() => router.back()}
      />
    );
  }

  const meta = ORDER_STATUS_META[order.status];
  const cancelled = order.status === "cancelled";
  const canCancel = order.status === "pending" || order.status === "processing";
  const currentStep = ORDER_STATUS_FLOW.indexOf(order.status);
  const subtotal = order.orderItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0,
  );

  const handleConfirmCancel = async () => {
    setConfirmVisible(false);
    try {
      await cancel();
      setToast("Order cancelled");
    } catch (err) {
      setToast(ErrorHandler.getUserMessage(err));
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.orderId}>
              #{order.id.slice(-6).toUpperCase()}
            </Text>
            <View style={[styles.badge, { backgroundColor: meta.color }]}>
              <Text style={styles.badgeText}>{meta.label}</Text>
            </View>
          </View>
          <Text style={styles.date}>Placed {formatDate(order.createdAt)}</Text>

          {cancelled ? (
            <View style={styles.cancelledRow}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={Colors.error}
              />
              <Text style={styles.cancelledText}>
                This order was cancelled.
              </Text>
            </View>
          ) : (
            <View style={styles.progress}>
              {ORDER_STATUS_FLOW.map((step, i) => {
                const done = i <= currentStep;
                const stepMeta = ORDER_STATUS_META[step];
                return (
                  <View key={step} style={styles.step}>
                    <View style={styles.stepLine}>
                      {i > 0 ? (
                        <View
                          style={[
                            styles.line,
                            {
                              backgroundColor: done
                                ? meta.color
                                : Colors.gray[20],
                            },
                          ]}
                        />
                      ) : (
                        <View style={styles.lineSpacer} />
                      )}
                      <View
                        style={[
                          styles.dot,
                          {
                            backgroundColor: done
                              ? meta.color
                              : Colors.gray[20],
                          },
                        ]}
                      />
                      {i < ORDER_STATUS_FLOW.length - 1 ? (
                        <View
                          style={[
                            styles.line,
                            {
                              backgroundColor:
                                i < currentStep ? meta.color : Colors.gray[20],
                            },
                          ]}
                        />
                      ) : (
                        <View style={styles.lineSpacer} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        done && {
                          color: Colors.text.primary,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {stepMeta.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Items */}
        <Text style={[TextStyles.h4, styles.sectionTitle]}>Items</Text>
        <View style={styles.card}>
          {order.orderItems.map((item, idx) => {
            const disp = orderItemDisplay(item);
            return (
              <View key={idx} style={styles.itemRow}>
                {disp.image ? (
                  <Image
                    source={{ uri: buildAssetUrl(disp.image) }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.itemImage} />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {disp.name}
                  </Text>
                  <Text style={styles.itemMeta}>
                    Qty {item.quantity} × ${item.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Delivery + payment */}
        <Text style={[TextStyles.h4, styles.sectionTitle]}>Delivery</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Shipping address</Text>
          <Text style={styles.value}>{order.shippingAddress}</Text>
          <View style={styles.divider} />
          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>
            {order.paymentMethod === "cash_on_delivery"
              ? "Cash on Delivery"
              : order.paymentMethod}
          </Text>
        </View>

        {/* Totals */}
        <View style={styles.summary}>
          <Row label="Sub Total" value={`$${subtotal.toFixed(2)}`} />
          <Row label="Shipping" value={`$${order.shippingPrice.toFixed(2)}`} />
          <Row label="Tax" value={`$${order.totalTax.toFixed(2)}`} />
          <Row label="Total" value={`$${order.totalPrice.toFixed(2)}`} bold />
        </View>
      </ScrollView>

      {canCancel ? (
        <View style={styles.footer}>
          <Button
            title="Cancel Order"
            variant="secondary"
            loading={isCancelling}
            onPress={() => setConfirmVisible(true)}
            size="large"
            style={styles.cancelBtn}
          />
        </View>
      ) : null}

      <Dialog
        visible={confirmVisible}
        title="Cancel order?"
        message="This will cancel your order and restore the items to stock. This can't be undone."
        variant="warning"
        confirmText="Cancel Order"
        dismissText="Keep Order"
        onDismiss={() => setConfirmVisible(false)}
        onConfirm={handleConfirmCancel}
      />

      <Snackbar
        visible={!!toast}
        message={toast}
        variant="info"
        onDismiss={() => setToast("")}
      />
    </View>
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
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderId: { ...TextStyles.h3 },
  badge: {
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: "700" },
  date: { ...TextStyles.caption, color: Colors.text.secondary, marginTop: 2 },
  cancelledRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  cancelledText: { ...TextStyles.body, color: Colors.error },
  progress: {
    flexDirection: "row",
    marginTop: Spacing.lg,
  },
  step: { flex: 1, alignItems: "center" },
  stepLine: { flexDirection: "row", alignItems: "center", width: "100%" },
  line: { flex: 1, height: 2 },
  lineSpacer: { flex: 1 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  stepLabel: {
    ...TextStyles.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  sectionTitle: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
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
  itemName: {
    ...TextStyles.body,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  itemMeta: {
    ...TextStyles.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  itemTotal: { ...TextStyles.body, fontWeight: "600" },
  label: { ...TextStyles.caption, color: Colors.text.secondary },
  value: { ...TextStyles.body, color: Colors.text.primary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border },
  summary: { gap: Spacing.xs, marginTop: Spacing.lg },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontWeight: "700", color: Colors.text.primary },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.bg.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: { width: "100%" },
});
