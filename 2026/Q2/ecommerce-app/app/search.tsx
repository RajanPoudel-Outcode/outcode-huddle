import ProductCard from "@/components/ui/ProductCard";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useProducts } from "@/features/products";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const term = query.trim();

  // Only query the API once the user has typed something.
  const { products, isLoading } = useProducts(term ? { search: term } : {});
  const hasSearched = term.length > 0;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text.primary} />
        </Pressable>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products"
            placeholderTextColor={Colors.text.secondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <MaterialCommunityIcons name="close-circle" size={18} color={Colors.text.secondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!hasSearched ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="magnify" size={56} color={Colors.gray[30]} />
          <Text style={[TextStyles.body, styles.hint]}>Search for products by name, brand or category</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="package-variant" size={56} color={Colors.gray[30]} />
          <Text style={[TextStyles.h3, { marginTop: Spacing.sm }]}>No results</Text>
          <Text style={TextStyles.body}>Nothing matched “{term}”</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Text style={[TextStyles.bodySmall, styles.count]}>
              {products.length} result{products.length === 1 ? "" : "s"}
            </Text>
          }
          renderItem={({ item }) => <ProductCard product={item} style={styles.card} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary, paddingHorizontal: Spacing.md },
  topBar: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingVertical: Spacing.sm },
  backBtn: { padding: 2 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 15 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.xs },
  hint: { color: Colors.text.secondary, textAlign: "center", paddingHorizontal: Spacing.xl },
  count: { marginBottom: Spacing.sm },
  list: { paddingBottom: Spacing.xl, gap: Spacing.md },
  row: { gap: Spacing.md },
  card: { flex: 1 },
});
