/**
 * Products Feature — public surface
 */

export { useFeatured } from "./hooks/useFeatured";
export { useProduct } from "./hooks/useProduct";
export { useProducts } from "./hooks/useProducts";
export { productsService } from "./services/products.service";
export type {
  Product,
  ProductColor,
  ProductQuery,
  ProductSpecification,
} from "./types/product.types";

