
import { adminMiddleware } from '@/features/admin/middlewares/admin.middleware';
import { authMiddleware } from '@/features/auth/middlewares/auth.middleware';
import { OrdersController } from '@/features/orders/controllers/orders.controller';
import express, { Router } from 'express';

const router: Router = express.Router();
const ordersController = new OrdersController();

// Protected routes (require authentication)
router.post('/', authMiddleware, ordersController.createOrder.bind(ordersController));
router.get('/', authMiddleware, ordersController.getOrders.bind(ordersController));
router.get('/user/my-orders', authMiddleware, ordersController.getUserOrders.bind(ordersController));
router.get('/:id', authMiddleware, ordersController.getOrderById.bind(ordersController));
router.put('/:id', authMiddleware, ordersController.updateOrder.bind(ordersController));
router.patch('/:id/cancel', authMiddleware, ordersController.cancelOrder.bind(ordersController));

// Admin-only routes
router.delete('/:id', adminMiddleware, ordersController.deleteOrder.bind(ordersController));
router.get('/admin/stats', adminMiddleware, ordersController.getOrderStats.bind(ordersController));

export default router;
