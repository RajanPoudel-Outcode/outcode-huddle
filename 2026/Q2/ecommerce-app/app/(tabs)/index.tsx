import ProductCard from "@/components/ui/ProductCard";
import { buildAssetUrl } from "@/constants/config";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useCategories } from "@/features/categories";
import { useFeatured, useProducts } from "@/features/products";
import { useAppSelector } from "@/hooks/useRedux";
import type { RootState } from "@/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const cartCount = useAppSelector((s: RootState) => s.cart.itemCount);
  const { categories } = useCategories();
  const { products: featured } = useFeatured(10);
  const query = useMemo(() => ({ category: activeCategory }), [activeCategory]);
  const { products, isLoading } = useProducts(query);

  const header = (
    <View>
      {/* Promo banner */}
      {featured[0] ? (
        <TouchableOpacity
          style={styles.banner}
          activeOpacity={0.9}
          onPress={() => router.push(`/product/${featured[0].id}`)}
        >
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{featured[0].name}</Text>
            <Text style={styles.bannerSubtitle} numberOfLines={2}>
              {featured[0].description}
            </Text>
            <View style={styles.shopNow}>
              <Text style={styles.shopNowText}>Shop Now</Text>
            </View>
          </View>
          <Image
            source={{ uri: buildAssetUrl(featured[0].images?.[0]) }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}

      {/* Categories */}
      <SectionHeader
        title="Categories"
        onSeeAll={
          categories.length > 5 ? () => router.push("/categories") : undefined
        }
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((cat) => {
          const active = activeCategory === cat.name;
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.category}
              onPress={() => setActiveCategory(active ? undefined : cat.name)}
            >
              <View
                style={[
                  styles.categoryIcon,
                  active && styles.categoryIconActive,
                ]}
              >
                <Image
                  source={{ uri: buildAssetUrl(cat.image) }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              </View>
              <Text
                style={[
                  styles.categoryLabel,
                  active && styles.categoryLabelActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Flash deals */}
      {featured.length > 0 && !activeCategory ? (
        <>
          <SectionHeader
            title="Flash Deals for You"
            onSeeAll={
              featured.length > 5
                ? () =>
                    router.push(
                      `/collection?title=${encodeURIComponent("Flash Deals for You")}&featured=1`,
                    )
                : undefined
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dealsRow}
          >
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} style={styles.dealCard} />
            ))}
          </ScrollView>
        </>
      ) : null}

      <SectionHeader
        title={activeCategory ?? "All Products"}
        onSeeAll={
          products.length > 5
            ? () =>
                router.push(
                  `/collection?title=${encodeURIComponent(activeCategory ?? "All Products")}${activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : ""}`,
                )
            : undefined
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search + cart */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.7}
          onPress={() => router.push("/search")}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={Colors.text.secondary}
          />
          <Text style={styles.searchPlaceholder}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push("/(tabs)/cart")}
        >
          <MaterialCommunityIcons
            name="cart-outline"
            size={24}
            color={Colors.text.primary}
          />
          {cartCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={header}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={{ marginTop: Spacing.xl }}
            />
          ) : (
            <Text style={[TextStyles.body, styles.empty]}>
              No products found
            </Text>
          )
        }
        renderItem={({ item }) => (
          <ProductCard product={item} style={styles.gridCard} />
        )}
      />
    </View>
  );
}

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={TextStyles.h3}>{title}</Text>
      {onSeeAll ? (
        <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  seeAll: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
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
  searchPlaceholder: {
    flex: 1,
    color: Colors.text.secondary,
    fontSize: 15,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.gray[50],
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  banner: {
    flexDirection: "row",
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    overflow: "hidden",
    marginTop: Spacing.sm,
    minHeight: 140,
  },
  bannerText: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "center",
  },
  bannerTitle: {
    ...TextStyles.h3,
    marginBottom: Spacing.xs,
  },
  bannerSubtitle: {
    ...TextStyles.caption,
    marginBottom: Spacing.md,
  },
  shopNow: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  shopNowText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
  bannerImage: {
    width: 130,
  },
  categoryRow: {
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  category: {
    alignItems: "center",
    width: 72,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.gray[10],
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryIconActive: {
    borderColor: Colors.primary,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryLabel: {
    ...TextStyles.caption,
    marginTop: Spacing.xs,
  },
  categoryLabelActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  dealsRow: {
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  dealCard: {
    width: 160,
  },
  grid: {
    paddingBottom: Spacing.xl,
  },
  gridRow: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  gridCard: {
    flex: 1,
  },
  empty: {
    textAlign: "center",
    marginTop: Spacing.xl,
    color: Colors.text.secondary,
  },
});
