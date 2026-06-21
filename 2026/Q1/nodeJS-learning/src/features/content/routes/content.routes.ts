import adminMiddleware from '@/features/admin/middlewares/admin.middleware';
import { ContentController } from '@/features/content/controllers/content.controller';
import express, { Router } from 'express';

const router: Router = express.Router();
const contentController = new ContentController();

// Public — fetch terms or privacy page
router.get('/:type', contentController.getPage.bind(contentController));

// Admin — create or update a content page
router.put('/:type', adminMiddleware, contentController.upsertPage.bind(contentController));

export default router;
