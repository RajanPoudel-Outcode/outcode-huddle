import ProductCard from "@/components/ui/ProductCard";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useWishlist } from "@/features/wishlist";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

export default function WishlistScreen() {
  const { items, isLoading, reload, dropItem } = useWishlist();

  // Refresh whenever the tab gains focus (reflects hearts toggled elsewhere).
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={TextStyles.h1}>Wishlist</Text>
        <Text style={TextStyles.bodySmall}>{items.length} saved items</Text>
      </View>

      {isLoading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={56}
            color={Colors.gray[30]}
          />
          <Text style={[TextStyles.h3, styles.emptyTitle]}>
            Your wishlist is empty
          </Text>
          <Text style={TextStyles.body}>Tap the heart on any product to save it</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          onRefresh={reload}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              style={styles.card}
              onToggleWishlist={(p, wishlisted) => {
                if (!wishlisted) dropItem(p.id);
              }}
            />
          )}
        />
      )}
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
    marginBottom: Spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  emptyTitle: {
    marginTop: Spacing.sm,
  },
  list: {
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  row: {
    gap: Spacing.md,
  },
  card: {
    flex: 1,
  },
});
