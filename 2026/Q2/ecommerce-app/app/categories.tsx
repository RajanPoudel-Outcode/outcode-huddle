import { buildAssetUrl } from "@/constants/config";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useCategories } from "@/features/categories";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * "See all" categories grid. Tapping a category opens its products in the
 * shared collection screen, titled with the category name.
 */
export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, isLoading, error } = useCategories();

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={3}
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
              {error ?? "No categories found"}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.category}
            onPress={() =>
              router.push(
                `/collection?title=${encodeURIComponent(item.name)}&category=${encodeURIComponent(item.name)}`,
              )
            }
          >
            <View style={styles.icon}>
              <Image
                source={{ uri: buildAssetUrl(item.image) }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
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
  row: { gap: Spacing.md, marginBottom: Spacing.lg },
  category: { flex: 1, alignItems: "center" },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.gray[10],
  },
  image: { width: "100%", height: "100%" },
  label: { ...TextStyles.caption, marginTop: Spacing.xs, textAlign: "center" },
  loader: { marginTop: Spacing.xl },
  empty: { textAlign: "center", marginTop: Spacing.xl, color: Colors.text.secondary },
});
