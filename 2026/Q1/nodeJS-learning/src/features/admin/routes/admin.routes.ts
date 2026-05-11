import { AdminController } from '@/features/admin/controllers/admin.controller';
import { adminMiddleware } from '@/features/admin/middlewares/admin.middleware';
import express, { Router } from 'express';

const router: Router = express.Router();
const adminController = new AdminController();

// Admin Dashboard & Analytics
router.get('/dashboard', adminMiddleware, adminController.getDashboard.bind(adminController));
router.get('/analytics', adminMiddleware, adminController.getAnalytics.bind(adminController));
router.get('/system-info', adminMiddleware, adminController.getSystemInfo.bind(adminController));
router.get('/health', adminMiddleware, adminController.healthCheck.bind(adminController));

// User Management
router.get('/users', adminMiddleware, adminController.getUsers.bind(adminController));
router.get('/users/:id', adminMiddleware, adminController.getUserById.bind(adminController));
router.put('/users/:id', adminMiddleware, adminController.updateUser.bind(adminController));
router.delete('/users/:id', adminMiddleware, adminController.deleteUser.bind(adminController));
router.post('/users/bulk-action', adminMiddleware, adminController.bulkUserAction.bind(adminController));

// Order Management (Admin view)
router.get('/orders', adminMiddleware, adminController.getOrders.bind(adminController));

// Product Management (Admin view)
router.get('/products', adminMiddleware, adminController.getProducts.bind(adminController));

export default router;
