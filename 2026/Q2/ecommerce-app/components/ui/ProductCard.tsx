/**
 * ProductCard
 * Compact product tile with image, name, price (+ struck original price) and a
 * wishlist heart. Heart state comes from the product's server-provided
 * `isWishlisted`; toggling updates optimistically and calls the wishlist API.
 * Tapping the card opens the product detail screen.
 */

import { buildAssetUrl } from "@/constants/config";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import type { Product } from "@/features/products";
import { wishlistService } from "@/features/wishlist";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ProductCardProps {
  product: Product;
  style?: any;
  /** Called after a successful toggle (e.g. so a wishlist screen can drop a removed item). */
  onToggleWishlist?: (product: Product, wishlisted: boolean) => void;
}

export default function ProductCard({ product, style, onToggleWishlist }: ProductCardProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(!!product.isWishlisted);

  // Keep in sync if the product is refetched with new server state.
  useEffect(() => {
    setWishlisted(!!product.isWishlisted);
  }, [product.isWishlisted, product.id]);

  const handleToggle = async () => {
    const next = !wishlisted;
    setWishlisted(next); // optimistic
    try {
      if (next) await wishlistService.addToWishlist(product.id);
      else await wishlistService.removeFromWishlist(product.id);
      onToggleWishlist?.(product, next);
    } catch {
      setWishlisted(!next); // revert on failure
    }
  };

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: buildAssetUrl(product.images?.[0]) }}
          style={styles.image}
          resizeMode="cover"
        />
        <Pressable style={styles.heart} hitSlop={8} onPress={handleToggle}>
          <MaterialCommunityIcons
            name={wishlisted ? "heart" : "heart-outline"}
            size={20}
            color={wishlisted ? Colors.error : Colors.text.secondary}
          />
        </Pressable>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}

      <View style={styles.priceRow}>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        {product.originalPrice ? (
          <Text style={styles.original}>${product.originalPrice.toFixed(2)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageWrap: {
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: Colors.gray[10],
  },
  image: {
    width: "100%",
    height: 130,
  },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 4,
  },
  name: {
    ...TextStyles.h4,
    marginTop: Spacing.sm,
  },
  brand: {
    ...TextStyles.caption,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  price: {
    ...TextStyles.h4,
    color: Colors.text.primary,
  },
  original: {
    ...TextStyles.caption,
    textDecorationLine: "line-through",
    color: Colors.text.tertiary,
  },
});
