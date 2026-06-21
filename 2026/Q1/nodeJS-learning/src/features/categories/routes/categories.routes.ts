import adminMiddleware from '@/features/admin/middlewares/admin.middleware';
import { CategoriesController } from '@/features/categories/controllers/categories.controller';
import { upload } from '@/shared/middlewares/image-upload.middleware';
import express, { Router } from 'express';

const router: Router = express.Router();
const categoriesController = new CategoriesController();

// Public
router.get('/', categoriesController.getCategories.bind(categoriesController));

// Admin
router.post('/', adminMiddleware, upload.single('image'), categoriesController.createCategory.bind(categoriesController));

export default router;
