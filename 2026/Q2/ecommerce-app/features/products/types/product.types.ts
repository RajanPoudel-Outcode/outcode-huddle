/**
 * Product Feature Types — aligned with the backend product model.
 */

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSpecification {
  label: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  rating: number;
  numReviews: number;
  countInStock: number;
  quantity: number;
  colors: ProductColor[];
  storageOptions: string[];
  specifications: ProductSpecification[];
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "price" | "rating" | "createdAt";
  sortOrder?: "asc" | "desc";
}
