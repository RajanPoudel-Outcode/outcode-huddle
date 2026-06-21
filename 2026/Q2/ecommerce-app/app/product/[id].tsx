import { Button, Snackbar } from "@/components/ui";
import { buildAssetUrl } from "@/constants/config";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useProduct } from "@/features/products";
import { wishlistService } from "@/features/wishlist";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import type { RootState } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SPEC_ICONS: Record<string, any> = {
  display: "monitor",
  chip: "chip",
  battery: "battery-high",
  camera: "camera",
  sound: "volume-high",
  wifi: "wifi",
  pen: "pencil-outline",
};

const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { product, isLoading, error } = useProduct(id);
  const cartCount = useAppSelector((s: RootState) => s.cart.itemCount);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState<string | undefined>();
  const [storage, setStorage] = useState<string | undefined>();
  const [toast, setToast] = useState("");
  const [wishlisted, setWishlisted] = useState(false);

  // Sync heart state from the server-provided flag once the product loads.
  useEffect(() => {
    setWishlisted(!!product?.isWishlisted);
  }, [product?.isWishlisted]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={TextStyles.body}>{error ?? "Product not found"}</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  const selectedColor = color ?? product.colors?.[0]?.name;
  const selectedStorage = storage ?? product.storageOptions?.[0];

  const handleToggleWishlist = async () => {
    const next = !wishlisted;
    setWishlisted(next); // optimistic
    try {
      if (next) await wishlistService.addToWishlist(product.id);
      else await wishlistService.removeFromWishlist(product.id);
    } catch {
      setWishlisted(!next); // revert on failure
    }
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: buildAssetUrl(product.images?.[0]) ?? "",
        quantity,
        color: selectedColor,
        storage: selectedStorage,
      }),
    );
    setToast("Added to cart");
  };

  const handleShare = async () => {
    const priceText = `$${product.price.toFixed(2)}`;
    const title = product.name;
    const message = `Check out ${product.name}${product.brand ? ` by ${product.brand}` : ""} — ${priceText}`;
    const g = globalThis as any;
    // Web: share the live page URL; native: a deep link into the app.
    const link =
      Platform.OS === "web" && g.location?.href
        ? g.location.href
        : Linking.createURL(`/product/${product.id}`);

    try {
      if (Platform.OS === "web") {
        if (g.navigator?.share) {
          await g.navigator.share({ title, text: message, url: link });
        } else if (g.navigator?.clipboard?.writeText) {
          await g.navigator.clipboard.writeText(`${message}\n${link}`);
          setToast("Link copied to clipboard");
        } else {
          setToast("Sharing isn't supported on this browser");
        }
        return;
      }
      // iOS shows `url` separately; Android uses only `message`, so embed the link there.
      await Share.share(
        Platform.OS === "ios"
          ? { title, message, url: link }
          : { title, message: `${message}\n${link}` },
      );
    } catch {
      // Share sheet dismissed or failed — no-op.
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <CircleButton icon="arrow-left" onPress={() => router.back()} />
          <View style={styles.headerRight}>
            <CircleButton
              icon={wishlisted ? "heart" : "heart-outline"}
              color={wishlisted ? Colors.error : Colors.text.primary}
              onPress={handleToggleWishlist}
            />
            <CircleButton icon="share-variant" onPress={handleShare} />
            <View>
              <CircleButton icon="cart-outline" onPress={() => router.push("/(tabs)/cart")} />
              {cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Main image */}
        <Image
          source={{ uri: buildAssetUrl(product.images?.[activeImage]) }}
          style={styles.mainImage}
          resizeMode="contain"
        />

        {/* Thumbnails */}
        {product.images.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
            {product.images.map((uri, i) => (
              <Pressable
                key={i}
                style={[styles.thumb, activeImage === i && styles.thumbActive]}
                onPress={() => setActiveImage(i)}
              >
                <Image source={{ uri: buildAssetUrl(uri) }} style={styles.thumbImage} resizeMode="cover" />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {/* Title + meta */}
        <Text style={[TextStyles.h2, styles.title]}>{product.name}</Text>
        <View style={styles.metaRow}>
          {product.brand ? <Text style={styles.brand}>By {product.brand}</Text> : null}
          <Text style={styles.dot}>•</Text>
          <MaterialCommunityIcons name="star" size={16} color="#F5A623" />
          <Text style={styles.rating}>
            {product.rating.toFixed(1)} ({formatCount(product.numReviews)})
          </Text>
        </View>

        {/* Price + quantity */}
        <View style={styles.priceRow}>
          <View style={styles.priceWrap}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.originalPrice ? (
              <Text style={styles.original}>${product.originalPrice.toFixed(2)}</Text>
            ) : null}
          </View>
          <View style={styles.stepper}>
            <Stepper icon="minus" onPress={() => setQuantity((q) => Math.max(1, q - 1))} />
            <Text style={styles.qty}>{quantity}</Text>
            <Stepper icon="plus" onPress={() => setQuantity((q) => q + 1)} />
          </View>
        </View>

        {/* Colors */}
        {product.colors.length > 0 ? (
          <View style={styles.section}>
            <Text style={[TextStyles.h4, styles.sectionTitle]}>Color</Text>
            <View style={styles.optionsWrap}>
              {product.colors.map((c) => {
                const active = selectedColor === c.name;
                return (
                  <Pressable
                    key={c.name}
                    style={[styles.colorOption, active && styles.optionActive]}
                    onPress={() => setColor(c.name)}
                  >
                    <View style={[styles.swatch, { backgroundColor: c.hex }]} />
                    <Text style={styles.optionLabel}>{c.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Storage */}
        {product.storageOptions.length > 0 ? (
          <View style={styles.section}>
            <Text style={[TextStyles.h4, styles.sectionTitle]}>Storage</Text>
            <View style={styles.optionsWrap}>
              {product.storageOptions.map((s) => {
                const active = selectedStorage === s;
                return (
                  <Pressable
                    key={s}
                    style={[styles.storageOption, active && styles.optionActive]}
                    onPress={() => setStorage(s)}
                  >
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Specs */}
        {product.specifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={[TextStyles.h4, styles.sectionTitle]}>A Snapshot View</Text>
            {product.specifications.map((spec, i) => (
              <View key={i} style={styles.specRow}>
                <MaterialCommunityIcons
                  name={SPEC_ICONS[spec.icon ?? ""] ?? "check-circle-outline"}
                  size={20}
                  color={Colors.text.secondary}
                />
                <Text style={styles.specLabel}>{spec.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[TextStyles.h4, styles.sectionTitle]}>Description</Text>
          <Text style={TextStyles.body}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Add to cart (no Buy Now) */}
      <View style={styles.footer}>
        <Button title="Add to Cart" onPress={handleAddToCart} size="large" style={styles.addBtn} />
      </View>

      <Snackbar visible={!!toast} message={toast} variant="success" onDismiss={() => setToast("")} />
    </View>
  );
}

function CircleButton({ icon, onPress, color = Colors.text.primary }: { icon: any; onPress: () => void; color?: string }) {
  return (
    <Pressable style={styles.circle} onPress={onPress} hitSlop={6}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </Pressable>
  );
}

function Stepper({ icon, onPress }: { icon: any; onPress: () => void }) {
  return (
    <Pressable style={styles.stepBtn} onPress={onPress} hitSlop={6}>
      <MaterialCommunityIcons name={icon} size={18} color={Colors.text.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.md },
  scroll: { padding: Spacing.md, paddingBottom: 120 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerRight: { flexDirection: "row", gap: Spacing.sm },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[50],
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: "700" },
  mainImage: { width: "100%", height: 280, marginTop: Spacing.md },
  thumbs: { gap: Spacing.sm, paddingVertical: Spacing.md },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: Colors.gray[10],
  },
  thumbActive: { borderColor: Colors.primary },
  thumbImage: { width: "100%", height: "100%" },
  title: { marginTop: Spacing.sm },
  metaRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginTop: Spacing.xs },
  brand: { ...TextStyles.body, color: Colors.primary },
  dot: { color: Colors.text.tertiary },
  rating: { ...TextStyles.bodySmall },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  priceWrap: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  price: { ...TextStyles.h2 },
  original: { ...TextStyles.body, textDecorationLine: "line-through", color: Colors.text.tertiary },
  stepper: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: { ...TextStyles.h4, minWidth: 20, textAlign: "center" },
  section: { marginTop: Spacing.lg },
  sectionTitle: { marginBottom: Spacing.sm },
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  colorOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  swatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: Colors.border },
  storageOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  optionActive: { borderColor: Colors.primary, backgroundColor: Colors.gray[50] },
  optionLabel: { ...TextStyles.body },
  optionLabelActive: { color: Colors.primary, fontWeight: "600" },
  specRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.sm },
  specLabel: { ...TextStyles.body },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.bg.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addBtn: { width: "100%" },
});
