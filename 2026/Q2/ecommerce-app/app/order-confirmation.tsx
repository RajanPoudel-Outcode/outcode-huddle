import { Button } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const shortId = id ? `#${id.slice(-6).toUpperCase()}` : "—";

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="check-circle"
        size={88}
        color={Colors.success}
      />
      <Text style={[TextStyles.h2, styles.title]}>Order placed!</Text>
      <Text style={[TextStyles.body, styles.muted]}>
        Your order has been placed successfully. You&apos;ll pay with cash when
        it&apos;s delivered.
      </Text>

      <View style={styles.card}>
        <Row label="Order" value={shortId} />
        <Row label="Payment" value="Cash on Delivery" />
        <Row label="Status" value="Pending" />
      </View>

      <View style={styles.actions}>
        {id ? (
          <Button
            title="View Order"
            onPress={() => router.replace(`/orders/${id}`)}
            size="large"
            style={styles.btn}
          />
        ) : null}
        <Button
          title="Continue Shopping"
          variant="secondary"
          onPress={() => router.replace("/(tabs)")}
          size="large"
          style={styles.btn}
        />
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={[TextStyles.body, styles.rowLabel]}>{label}</Text>
      <Text style={[TextStyles.body, styles.rowValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: { marginTop: Spacing.sm },
  muted: { color: Colors.text.secondary, textAlign: "center" },
  card: {
    width: "100%",
    backgroundColor: Colors.bg.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { color: Colors.text.secondary },
  rowValue: { fontWeight: "600", color: Colors.text.primary },
  actions: { width: "100%", gap: Spacing.md, marginTop: Spacing.xl },
  btn: { width: "100%" },
});
