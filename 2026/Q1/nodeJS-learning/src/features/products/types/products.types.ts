export interface IProduct {
  name: string;
  description: string;
  images?: string[];
  quantity: number;
  price: number;
  category: string;
  rating?: number;
  review?: IProductReview[];
  countInStock?: number;
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
  category: string;
  countInStock?: number;
}

export interface IUpdateProductRequest {
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
  category?: string;
  countInStock?: number;
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
  category: string;
  rating: number;
  review: IProductReview[];
  countInStock: number;
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
