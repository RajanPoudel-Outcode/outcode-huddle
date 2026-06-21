import { Product } from '@/features/products/models/product.model';
import { Wishlist } from '@/features/wishlist/models/wishlist.model';
import { NotFoundError } from '@/shared/exception/error_handler';

/**
 * Map a populated product document/object to an API-friendly product object.
 */
const toProductResponse = (product: any) => ({
  id: product._id.toString(),
  name: product.name,
  description: product.description,
  images: product.images || [],
  quantity: product.quantity,
  price: product.price,
  originalPrice: product.originalPrice,
  category: product.category,
  brand: product.brand || '',
  rating: product.rating || 0,
  numReviews: product.numReviews || 0,
  countInStock: product.countInStock || 0,
  colors: product.colors || [],
  storageOptions: product.storageOptions || [],
  specifications: product.specifications || [],
  isFeatured: product.isFeatured || false,
  isWishlisted: true,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});

export class WishlistService {
  /**
   * Get the user's wishlist (populated products)
   */
  async getWishlist(userId: string) {
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products').lean();
    if (!wishlist) {
      return [];
    }
    return (wishlist.products as any[]).map(toProductResponse);
  }

  /**
   * Add a product to the wishlist (idempotent). Returns the updated list.
   */
  async addToWishlist(userId: string, productId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await Wishlist.updateOne(
      { user: userId },
      { $addToSet: { products: productId } },
      { upsert: true }
    );

    return this.getWishlist(userId);
  }

  /**
   * Remove a product from the wishlist. Returns the updated list.
   */
  async removeFromWishlist(userId: string, productId: string) {
    await Wishlist.updateOne(
      { user: userId },
      { $pull: { products: productId } }
    );

    return this.getWishlist(userId);
  }
}
