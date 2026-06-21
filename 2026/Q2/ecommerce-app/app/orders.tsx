import { Button, Loading, NotFound } from "@/components/ui";
import { buildAssetUrl } from "@/constants/config";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAuth } from "@/features/auth";
import { ORDER_STATUS_META, orderItemDisplay, useOrders } from "@/features/orders";
import { useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const formatDate = (iso?: string): string =>
  iso ? new Date(iso).toLocaleDateString() : "";

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { orders, isLoading, error, refetch } = useOrders();

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={TextStyles.h3}>Please log in</Text>
        <Text style={[TextStyles.body, styles.muted]}>
          Log in to view your orders.
        </Text>
        <Button
          title="Go Back"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  if (isLoading) {
    return <Loading fullscreen message="Loading your orders…" />;
  }

  if (error) {
    return (
      <NotFound
        fullscreen
        icon="⚠️"
        title="Couldn't load orders"
        description={error}
        actionLabel="Try Again"
        onActionPress={refetch}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <NotFound
        fullscreen
        icon="📦"
        title="No orders yet"
        description="Start shopping to place your first order."
        actionLabel="Go Shopping"
        onActionPress={() => router.replace("/(tabs)")}
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={orders}
      keyExtractor={(o) => o.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const meta = ORDER_STATUS_META[item.status];
        const first = item.orderItems[0];
        const firstDisp = first ? orderItemDisplay(first) : { name: "" };
        const count = item.orderItems.reduce((s, i) => s + i.quantity, 0);
        const more = item.orderItems.length - 1;
        return (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/orders/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>
                #{item.id.slice(-6).toUpperCase()}
              </Text>
              <View style={[styles.badge, { backgroundColor: meta.color }]}>
                <Text style={styles.badgeText}>{meta.label}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              {firstDisp.image ? (
                <Image
                  source={{ uri: buildAssetUrl(firstDisp.image) }}
                  style={styles.thumb}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumb} />
              )}
              <View style={styles.bodyInfo}>
                <Text style={styles.itemSummary} numberOfLines={1}>
                  {firstDisp.name}
                  {more > 0 ? ` and ${more} more` : ""}
                </Text>
                <Text style={styles.meta}>
                  {count} item{count !== 1 ? "s" : ""} • {formatDate(item.createdAt)}
                </Text>
              </View>
              <Text style={styles.total}>${item.totalPrice.toFixed(2)}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.secondary },
  content: { padding: Spacing.md, gap: Spacing.md },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.bg.secondary,
  },
  muted: { color: Colors.text.secondary, textAlign: "center" },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderId: { ...TextStyles.h4 },
  badge: { borderRadius: 12, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: "700" },
  cardBody: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.gray[10],
  },
  bodyInfo: { flex: 1 },
  itemSummary: { ...TextStyles.body, fontWeight: "600", color: Colors.text.primary },
  meta: { ...TextStyles.caption, color: Colors.text.secondary, marginTop: 2 },
  total: { ...TextStyles.h4 },
});
