export interface IProductColor {
  name: string;
  hex: string;
}

export interface IProductSpecification {
  label: string;
  icon?: string;
}

export interface IProduct {
  name: string;
  description: string;
  images?: string[];
  quantity: number;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  rating?: number;
  numReviews?: number;
  review?: IProductReview[];
  countInStock?: number;
  colors?: IProductColor[];
  storageOptions?: string[];
  specifications?: IProductSpecification[];
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductReview {
  name?: string;
  rating: number;
  comment: string;
  user: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateProductRequest {
  name: string;
  description: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  numReviews?: number;
  countInStock?: number;
  colors?: IProductColor[];
  storageOptions?: string[];
  specifications?: IProductSpecification[];
  isFeatured?: boolean;
}

export interface IUpdateProductRequest {
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
  originalPrice?: number;
  category?: string;
  brand?: string;
  numReviews?: number;
  countInStock?: number;
  colors?: IProductColor[];
  storageOptions?: string[];
  specifications?: IProductSpecification[];
  isFeatured?: boolean;
}

export interface IAddReviewRequest {
  rating: number;
  comment: string;
}

export interface IProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface IProductResponse {
  id: string;
  name: string;
  description: string;
  images: string[];
  quantity: number;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  rating: number;
  numReviews: number;
  review: IProductReview[];
  countInStock: number;
  colors: IProductColor[];
  storageOptions: string[];
  specifications: IProductSpecification[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaginatedProductsResponse extends Array<IProductResponse> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
