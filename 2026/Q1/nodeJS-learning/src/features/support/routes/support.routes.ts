import { adminMiddleware } from '@/features/admin/middlewares/admin.middleware';
import { authMiddleware } from '@/features/auth/middlewares/auth.middleware';
import { SupportController } from '@/features/support/controllers/support.controller';
import express, { Router } from 'express';

const router: Router = express.Router();
const supportController = new SupportController();

// Admin routes (declared before '/:id' to avoid path collisions)
router.get('/admin/all', adminMiddleware, supportController.getAllRequests.bind(supportController));
router.get('/admin/:id', adminMiddleware, supportController.getRequestById.bind(supportController));
router.patch('/admin/:id', adminMiddleware, supportController.updateRequest.bind(supportController));

// Authenticated user routes
router.post('/', authMiddleware, supportController.createRequest.bind(supportController));
router.get('/', authMiddleware, supportController.getMyRequests.bind(supportController));
router.get('/:id', authMiddleware, supportController.getMyRequestById.bind(supportController));

export default router;
