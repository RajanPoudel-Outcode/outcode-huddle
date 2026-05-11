import {
  addReviewSchema,
  createProductSchema,
  productIdSchema,
  productQuerySchema,
  updateProductSchema
} from '@/features/products/schemas/products.schemas';
import { ProductsService } from '@/features/products/services/products.service';
import { joiParamsValidation, joiQueryValidation, joiValidation } from '@/shared/decorators/joi-validation.decorator';
import { createApiResponse } from '@/shared/middlewares/response.middleware';
import { NextFunction, Request, Response } from 'express';
import {
  IAddReviewRequest,
  ICreateProductRequest,
  IProductQuery,
  IUpdateProductRequest
} from '../types/products.types';

export class ProductsController {
  private productsService: ProductsService;

  constructor() {
    this.productsService = new ProductsService();
  }

  /**
   * Get all products with pagination and filtering
   */
  @joiQueryValidation(productQuerySchema)
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: IProductQuery = req.query as any;
      const result = await this.productsService.getProducts(query);

      const response = createApiResponse(true, 'Products retrieved successfully',result,result.pagination );
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single product by ID
   */
  @joiParamsValidation(productIdSchema)
  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        const response = createApiResponse(false, 'Product ID is required');
        res.status(400).json(response);
        return;
      }
      
      const product = await this.productsService.getProductById(id);

      const response = createApiResponse(true, 'Product retrieved successfully', product);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search products by name/description
   */
  @joiQueryValidation(productQuerySchema)
  async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search } = req.params;
      const query: IProductQuery = req.query as any;
      
      if (!search) {
        void res.status(400).json({
          success: false,
          message: 'Search term is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await this.productsService.searchProducts(search, query);

      res.status(200).json({
        success: true,
        message: 'Products found successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new product (protected)
   */
  @joiValidation(createProductSchema)
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const productData: ICreateProductRequest = req.body;
      
      // Handle multiple images
      let imagePaths: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        imagePaths = req.files.map((file: Express.Multer.File) => file.path);
      } else if (req.file) {
        imagePaths = [req.file.path];
      }

      const product = await this.productsService.createProduct(productData, imagePaths);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update existing product (protected)
   */
  @joiParamsValidation(productIdSchema)
  @joiValidation(updateProductSchema)
  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { id } = req.params;
      const updateData: IUpdateProductRequest = req.body;

      // Handle multiple images
      let imagePaths: string[] | undefined;
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        imagePaths = req.files.map((file: Express.Multer.File) => file.path);
      } else if (req.file) {
        imagePaths = [req.file.path];
      }

      const product = await this.productsService.updateProduct(id, updateData, imagePaths);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: { product },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product (protected)
   */
  @joiParamsValidation(productIdSchema)
  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { id } = req.params;
      await this.productsService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add review to product (protected)
   */
  @joiParamsValidation(productIdSchema)
  @joiValidation(addReviewSchema)
  async addReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { id } = req.params;
      const reviewData: IAddReviewRequest = req.body;

      const product = await this.productsService.addReview(
        id,
        req.user._id,
        req.user.name,
        reviewData
      );

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: { product },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product reviews
   */
  @joiParamsValidation(productIdSchema)
  async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const reviews = await this.productsService.getProductReviews(id);

      res.status(200).json({
        success: true,
        message: 'Reviews retrieved successfully',
        data: { reviews },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get products by category
   */
  @joiQueryValidation(productQuerySchema)
  async getProductsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.params;
      const query: IProductQuery = req.query as any;

      if (!category) {
        void res.status(400).json({
          success: false,
          message: 'Category is required',
          timestamp: new Date().toISOString()
        });
      }

      const result = await this.productsService.getProductsByCategory(category, query);

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const products = await this.productsService.getFeaturedProducts(limit);

      const response = createApiResponse(true, 'Featured products retrieved successfully', { 
        products: products,
        pagination: products.pagination
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check product availability
   */
  @joiParamsValidation(productIdSchema)
  async checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const quantity = parseInt(req.query.quantity as string) || 1;

      const isAvailable = await this.productsService.checkAvailability(id, quantity);

      res.status(200).json({
        success: true,
        message: 'Availability checked successfully',
        data: { 
          productId: id,
          quantity,
          isAvailable 
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}
