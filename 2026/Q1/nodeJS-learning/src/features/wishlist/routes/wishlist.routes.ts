import { authMiddleware } from '@/features/auth/middlewares/auth.middleware';
import { WishlistController } from '@/features/wishlist/controllers/wishlist.controller';
import express, { Router } from 'express';

const router: Router = express.Router();
const wishlistController = new WishlistController();

router.get('/', authMiddleware, wishlistController.getWishlist.bind(wishlistController));
router.post('/', authMiddleware, wishlistController.addToWishlist.bind(wishlistController));
router.delete('/:productId', authMiddleware, wishlistController.removeFromWishlist.bind(wishlistController));

export default router;
