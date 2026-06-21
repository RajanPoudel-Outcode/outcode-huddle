import ProductCard from "@/components/ui/ProductCard";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useProducts } from "@/features/products";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

/**
 * Generic "See all" product grid. Driven by query params:
 *  - title:    header title (e.g. "Flash Deals for You", "All Products")
 *  - featured: "1" to show only featured products
 *  - category: filter to a single category name
 */
export default function CollectionScreen() {
  const { title, featured, category } = useLocalSearchParams<{
    title?: string;
    featured?: string;
    category?: string;
  }>();

  const query = useMemo(
    () => ({
      featured: featured === "1" ? true : undefined,
      category: category || undefined,
      limit: 100,
    }),
    [featured, category],
  );
  const { products, isLoading, error } = useProducts(query);

  const heading = title || "Products";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: heading }} />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={styles.loader}
            />
          ) : (
            <Text style={[TextStyles.body, styles.empty]}>
              {error ?? "No products found"}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <ProductCard product={item} style={styles.card} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.md,
  },
  grid: { paddingVertical: Spacing.md },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  card: { flex: 1 },
  loader: { marginTop: Spacing.xl },
  empty: { textAlign: "center", marginTop: Spacing.xl, color: Colors.text.secondary },
});
