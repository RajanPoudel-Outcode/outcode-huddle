import { IProductDocument, Product } from '@/features/products/models/product.model';
import {
    IAddReviewRequest,
    ICreateProductRequest,
    IPaginatedProductsResponse,
    IProductQuery,
    IProductResponse,
    IUpdateProductRequest
} from '@/features/products/types/products.types';
import { Wishlist } from '@/features/wishlist/models/wishlist.model';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/exception/error_handler';

export class ProductsService {
  /**
   * Resolve the set of product ids in a user's wishlist (empty if no user).
   * Used to flag `isWishlisted` on product responses.
   */
  private async getWishlistProductIds(userId?: string): Promise<Set<string>> {
    if (!userId) {
      return new Set();
    }
    const wishlist = await Wishlist.findOne({ user: userId }).select('products').lean();
    if (!wishlist) {
      return new Set();
    }
    return new Set((wishlist.products as any[]).map((id) => id.toString()));
  }

  /**
   * Create user-friendly product response
   */
  private createProductResponse(
    product: IProductDocument,
    wishlistIds?: Set<string>,
  ): IProductResponse {
    const productObj = product.toObject();
    const id = (productObj._id as any).toString();
    return {
      id,
      name: productObj.name,
      description: productObj.description,
      images: productObj.images || [],
      quantity: productObj.quantity,
      price: productObj.price,
      originalPrice: productObj.originalPrice,
      category: productObj.category,
      brand: productObj.brand || '',
      rating: productObj.rating || 0,
      numReviews: productObj.numReviews || 0,
      review: productObj.review || [],
      countInStock: productObj.countInStock || 0,
      colors: productObj.colors || [],
      storageOptions: productObj.storageOptions || [],
      specifications: productObj.specifications || [],
      isFeatured: productObj.isFeatured || false,
      isWishlisted: wishlistIds?.has(id) ?? false,
      createdAt: productObj.createdAt,
      updatedAt: productObj.updatedAt
    };
  }

  /**
   * Build MongoDB filter object from query parameters
   */
  private buildFilter(query: IProductQuery): any {
    const filter: any = {};

    if (query.category) {
      filter.category = { $regex: query.category, $options: 'i' };
    }

    if (query.featured !== undefined) {
      filter.isFeatured = query.featured;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { category: { $regex: query.search, $options: 'i' } }
      ];
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) {
        filter.price.$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        filter.price.$lte = query.maxPrice;
      }
    }

    return filter;
  }

  /**
   * Build MongoDB sort object from query parameters
   */
  private buildSort(query: IProductQuery): any {
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrder };
  }

  /**
   * Get all products with pagination and filtering
   */
  async getProducts(query: IProductQuery, userId?: string): Promise<IPaginatedProductsResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter = this.buildFilter(query);
    const sort = this.buildSort(query);

    const [products, totalCount, wishlistIds] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
      this.getWishlistProductIds(userId)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const productsArray = products.map(product => this.createProductResponse(product, wishlistIds));

    // Create array with pagination property
    const result = productsArray as IPaginatedProductsResponse;
    result.pagination = {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return result;
  }

  /**
   * Get single product by ID
   */
  async getProductById(productId: string | undefined, userId?: string): Promise<IProductResponse> {
    if (!productId) {
      throw new ValidationError('Product ID is required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const wishlistIds = await this.getWishlistProductIds(userId);
    return this.createProductResponse(product, wishlistIds);
  }

  /**
   * Search products by name
   */
  async searchProducts(searchTerm: string | undefined, query: IProductQuery, userId?: string): Promise<IPaginatedProductsResponse> {
    if (!searchTerm) {
      throw new ValidationError('Search term is required');
    }
    const searchQuery = { ...query, search: searchTerm };
    return this.getProducts(searchQuery, userId);
  }

  /**
   * Create new product
   */
  async createProduct(productData: ICreateProductRequest, imagePaths?: string[]): Promise<IProductResponse> {
    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ 
      name: { $regex: `^${productData.name.trim()}$`, $options: 'i' }
    });
    
    if (existingProduct) {
      throw new ConflictError('Product with this name already exists');
    }

    const product = new Product({
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: productData.price,
      originalPrice: productData.originalPrice,
      category: productData.category.trim(),
      brand: productData.brand?.trim() || '',
      quantity: productData.quantity,
      countInStock: productData.countInStock || 1,
      numReviews: productData.numReviews || 0,
      colors: productData.colors || [],
      storageOptions: productData.storageOptions || [],
      specifications: productData.specifications || [],
      isFeatured: productData.isFeatured || false,
      images: imagePaths || [],
      rating: 0,
      review: []
    });

    const savedProduct = await product.save();
    return this.createProductResponse(savedProduct);
  }

  /**
   * Update existing product
   */
  async updateProduct(
    productId: string | undefined, 
    updateData: IUpdateProductRequest, 
    imagePaths?: string[]
  ): Promise<IProductResponse> {
    if (!productId) {
      throw new ValidationError('Product ID is required');
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if name is being changed and if it conflicts with existing product
    if (updateData.name && updateData.name !== product.name) {
      const existingProduct = await Product.findOne({
        name: { $regex: `^${updateData.name.trim()}$`, $options: 'i' },
        _id: { $ne: productId }
      });
      
      if (existingProduct) {
        throw new ConflictError('Product with this name already exists');
      }
    }

    // Build update object
    const updates: any = {};
    if (updateData.name) updates.name = updateData.name.trim();
    if (updateData.description) updates.description = updateData.description.trim();
    if (updateData.price !== undefined) updates.price = updateData.price;
    if (updateData.originalPrice !== undefined) updates.originalPrice = updateData.originalPrice;
    if (updateData.category) updates.category = updateData.category.trim();
    if (updateData.brand !== undefined) updates.brand = updateData.brand.trim();
    if (updateData.quantity !== undefined) updates.quantity = updateData.quantity;
    if (updateData.countInStock !== undefined) updates.countInStock = updateData.countInStock;
    if (updateData.numReviews !== undefined) updates.numReviews = updateData.numReviews;
    if (updateData.colors !== undefined) updates.colors = updateData.colors;
    if (updateData.storageOptions !== undefined) updates.storageOptions = updateData.storageOptions;
    if (updateData.specifications !== undefined) updates.specifications = updateData.specifications;
    if (updateData.isFeatured !== undefined) updates.isFeatured = updateData.isFeatured;
    if (imagePaths && imagePaths.length > 0) updates.images = imagePaths;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      throw new NotFoundError('Product not found');
    }

    return this.createProductResponse(updatedProduct);
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string | undefined): Promise<void> {
    if (!productId) {
      throw new ValidationError('Product ID is required');
    }
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      throw new NotFoundError('Product not found');
    }
  }

  /**
   * Add review to product
   */
  async addReview(
    productId: string | undefined, 
    userId: string, 
    userName: string, 
    reviewData: IAddReviewRequest
  ): Promise<IProductResponse> {
    if (!productId) {
      throw new ValidationError('Product ID is required');
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if user has already reviewed this product
    const existingReview = product.review?.find(
      review => review.user === userId
    );

    if (existingReview) {
      throw new ConflictError('You have already reviewed this product');
    }

    // Add new review
    const newReview = {
      name: userName,
      rating: reviewData.rating,
      comment: reviewData.comment.trim(),
      user: userId
    };

    if (!product.review) {
      product.review = [];
    }
    
    product.review.push(newReview as any);

    // Recalculate average rating
    const totalRating = product.review.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.review.length;

    const updatedProduct = await product.save();
    return this.createProductResponse(updatedProduct);
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId: string | undefined): Promise<any[]> {
    if (!productId) {
      throw new ValidationError('Product ID is required');
    }
    
    const product = await Product.findById(productId).select('review');
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product.review || [];
  }

  /**
   * Update product stock
   */
  async updateStock(productId: string, newStock: number): Promise<IProductResponse> {
    if (newStock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { countInStock: newStock },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      throw new NotFoundError('Product not found');
    }

    return this.createProductResponse(updatedProduct);
  }

  /**
   * Check product availability
   */
  async checkAvailability(productId: string | undefined, quantity: number): Promise<boolean> {
    if (!productId) {
      throw new ValidationError('Product ID is required');
    }
    
    const product = await Product.findById(productId).select('countInStock');
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return (product.countInStock || 0) >= quantity;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string | undefined, query: IProductQuery, userId?: string): Promise<IPaginatedProductsResponse> {
    if (!category) {
      throw new ValidationError('Category is required');
    }
    const categoryQuery = { ...query, category };
    return this.getProducts(categoryQuery, userId);
  }

  /**
   * Get featured products (highest rated)
   */
  async getFeaturedProducts(limit: number = 10, userId?: string): Promise<IPaginatedProductsResponse> {
    const filter = { isFeatured: true };
    const [totalCount, products, wishlistIds] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort({ rating: -1, createdAt: -1 }).limit(limit).lean(),
      this.getWishlistProductIds(userId)
    ]);

    // Convert products to response format
    const productsArray = products.map(product => ({
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
      review: product.review || [],
      countInStock: product.countInStock || 0,
      colors: product.colors || [],
      storageOptions: product.storageOptions || [],
      specifications: product.specifications || [],
      isFeatured: product.isFeatured || false,
      isWishlisted: wishlistIds.has(product._id.toString()),
      createdAt: product.createdAt || new Date(),
      updatedAt: product.updatedAt || new Date()
    }));
    
    // Create array with pagination property
    const result = productsArray as IPaginatedProductsResponse;
    result.pagination = {
      currentPage: 1,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      limit,
      hasNext: totalCount > limit,
      hasPrev: false
    };

    return result;
  }
}
