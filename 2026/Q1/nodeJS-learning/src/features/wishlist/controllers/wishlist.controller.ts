import { addToWishlistSchema, wishlistParamsSchema } from '@/features/wishlist/schemas/wishlist.schemas';
import { WishlistService } from '@/features/wishlist/services/wishlist.service';
import { IAddToWishlistRequest } from '@/features/wishlist/types/wishlist.types';
import { joiParamsValidation, joiValidation } from '@/shared/decorators/joi-validation.decorator';
import { createApiResponse } from '@/shared/middlewares/response.middleware';
import { NextFunction, Request, Response } from 'express';

export class WishlistController {
  private wishlistService: WishlistService;

  constructor() {
    this.wishlistService = new WishlistService();
  }

  /**
   * Get the authenticated user's wishlist
   */
  async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(false, 'Authentication required'));
        return;
      }

      const products = await this.wishlistService.getWishlist(req.user.id);
      res.status(200).json(createApiResponse(true, 'Wishlist retrieved successfully', products));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a product to the wishlist
   */
  @joiValidation(addToWishlistSchema)
  async addToWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(false, 'Authentication required'));
        return;
      }

      const { productId }: IAddToWishlistRequest = req.body;
      const products = await this.wishlistService.addToWishlist(req.user.id, productId);
      res.status(200).json(createApiResponse(true, 'Added to wishlist', products));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a product from the wishlist
   */
  @joiParamsValidation(wishlistParamsSchema)
  async removeFromWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(false, 'Authentication required'));
        return;
      }

      const { productId } = req.params;
      const products = await this.wishlistService.removeFromWishlist(req.user.id, productId as string);
      res.status(200).json(createApiResponse(true, 'Removed from wishlist', products));
    } catch (error) {
      next(error);
    }
  }
}
