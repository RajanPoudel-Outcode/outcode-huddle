import adminMiddleware from '@/features/admin/middlewares/admin.middleware';
import { authMiddleware, optionalAuthMiddleware } from '@/features/auth/middlewares/auth.middleware';
import { ProductsController } from '@/features/products/controllers/products.controller';
import { upload } from '@/shared/middlewares/image-upload.middleware';
import { parseJsonFields } from '@/shared/middlewares/parse-json-fields.middleware';
import express, { Router } from 'express';

const router: Router = express.Router();
const productsController = new ProductsController();

// JSON-encoded array/object fields sent as multipart form-data
const productJsonFields = parseJsonFields(['colors', 'storageOptions', 'specifications']);

// Public routes (optionalAuth so `isWishlisted` is set when a token is present)
router.get('/', authMiddleware, productsController.getProducts.bind(productsController));
router.get('/featured', optionalAuthMiddleware, productsController.getFeaturedProducts.bind(productsController));
router.get('/search/:search', optionalAuthMiddleware, productsController.searchProducts.bind(productsController));
router.get('/category/:category', optionalAuthMiddleware, productsController.getProductsByCategory.bind(productsController));
router.get('/:id/reviews', productsController.getProductReviews.bind(productsController));
router.get('/:id/availability', productsController.checkAvailability.bind(productsController));
router.get('/:id', optionalAuthMiddleware, productsController.getProductById.bind(productsController));

// Protected routes (require authentication)
router.post('/', adminMiddleware, upload.array('images', 5), productJsonFields, productsController.createProduct.bind(productsController));
router.put('/:id', adminMiddleware, upload.array('images', 5), productJsonFields, productsController.updateProduct.bind(productsController));
router.delete('/:id', adminMiddleware, productsController.deleteProduct.bind(productsController));
router.post('/:id/reviews', adminMiddleware, productsController.addReview.bind(productsController));

export default router;
