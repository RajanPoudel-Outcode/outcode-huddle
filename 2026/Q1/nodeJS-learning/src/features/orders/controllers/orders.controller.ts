import {
    createOrderSchema,
    orderIdSchema,
    orderQuerySchema,
    updateOrderSchema
} from '@/features/orders/schemas/orders.schemas';
import { OrdersService } from '@/features/orders/services/orders.service';
import { joiParamsValidation, joiQueryValidation, joiValidation } from '@/shared/decorators/joi-validation.decorator';
import { NextFunction, Request, Response } from 'express';
import {
    ICreateOrderRequest,
    IOrderQuery,
    IUpdateOrderRequest
} from '../types/orders.types';

export class OrdersController {
  private ordersService: OrdersService;

  constructor() {
    this.ordersService = new OrdersService();
  }

  /**
   * Create new order (protected)
   */
  @joiValidation(createOrderSchema)
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const orderData: ICreateOrderRequest = req.body;
      const order = await this.ordersService.createOrder(req.user._id, orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (admin) or user orders (protected)
   */
  @joiQueryValidation(orderQuerySchema)
  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const query: IOrderQuery = req.query as any;
      
      // Admin can see all orders, regular users only their own
      const userId = req.user.type === 'Admin' ? undefined : req.user._id;
      const result = await this.ordersService.getOrders(query, userId);

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single order by ID
   */
  @joiParamsValidation(orderIdSchema)
  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { id } = req.params;
      
      if (!id) {
        void res.status(400).json({
          success: false,
          message: 'Order ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Admin can see any order, regular users only their own
      const userId = req.user.type === 'Admin' ? undefined : req.user._id;
      const order = await this.ordersService.getOrderById(id, userId);

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: { order },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order (admin or limited user updates)
   */
  @joiParamsValidation(orderIdSchema)
  @joiValidation(updateOrderSchema)
  async updateOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { id } = req.params;
      if (!id) {
        void res.status(400).json({
          success: false,
          message: 'Order ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      const updateData: IUpdateOrderRequest = req.body;

      // Admin can update any order, regular users only their own (limited updates)
      const userId = req.user.type === 'Admin' ? undefined : req.user._id;
      const order = await this.ordersService.updateOrder(id, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: { order },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete order (admin only)
   */
  @joiParamsValidation(orderIdSchema)
  async deleteOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      if (req.user.type !== 'Admin') {
        void res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString()
        });
      }

      const { id } = req.params;
      await this.ordersService.deleteOrder(id);

      res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's orders
   */
  @joiQueryValidation(orderQuerySchema)
  async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const query: IOrderQuery = req.query as any;
      const result = await this.ordersService.getUserOrders(req.user._id, query);

      res.status(200).json({
        success: true,
        message: 'User orders retrieved successfully',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order
   */
  @joiParamsValidation(orderIdSchema)
  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const { id } = req.params;
      
      // Admin can cancel any order, regular users only their own
      const userId = req.user.type === 'Admin' ? undefined : req.user._id;
      const order = await this.ordersService.cancelOrder(id, userId);

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: { order },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order statistics (admin only)
   */
  async getOrderStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      if (req.user.type !== 'Admin') {
        void res.status(403).json({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString()
        });
      }

      const stats = await this.ordersService.getOrderStats();

      res.status(200).json({
        success: true,
        message: 'Order statistics retrieved successfully',
        data: { stats },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
}
