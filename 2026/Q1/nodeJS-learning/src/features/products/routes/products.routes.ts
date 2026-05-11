import adminMiddleware from '@/features/admin/middlewares/admin.middleware';
import { authMiddleware } from '@/features/auth/middlewares/auth.middleware';
import { ProductsController } from '@/features/products/controllers/products.controller';
import { upload } from '@/shared/middlewares/image-upload.middleware';
import express, { Router } from 'express';

const router: Router = express.Router();
const productsController = new ProductsController();

// Public routes
router.get('/',authMiddleware, productsController.getProducts.bind(productsController));
router.get('/featured', productsController.getFeaturedProducts.bind(productsController));
router.get('/search/:search', productsController.searchProducts.bind(productsController));
router.get('/category/:category', productsController.getProductsByCategory.bind(productsController));
router.get('/:id/reviews', productsController.getProductReviews.bind(productsController));
router.get('/:id/availability', productsController.checkAvailability.bind(productsController));
router.get('/:id', productsController.getProductById.bind(productsController));

// Protected routes (require authentication)
router.post('/', adminMiddleware, upload.array('images', 5), productsController.createProduct.bind(productsController));
router.put('/:id', adminMiddleware, upload.array('images', 5), productsController.updateProduct.bind(productsController));
router.delete('/:id', adminMiddleware, productsController.deleteProduct.bind(productsController));
router.post('/:id/reviews', adminMiddleware, productsController.addReview.bind(productsController));

export default router;
