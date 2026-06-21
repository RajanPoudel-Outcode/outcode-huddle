export interface IWishlist {
  user: string;
  products: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddToWishlistRequest {
  productId: string;
}
