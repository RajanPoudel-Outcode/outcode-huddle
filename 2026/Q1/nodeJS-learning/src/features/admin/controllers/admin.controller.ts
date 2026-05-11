import { joiParamsValidation, joiQueryValidation, joiValidation } from '@/shared/decorators/joi-validation.decorator';
import { AuthenticatedRequest } from '@/types/types';
import { Response } from 'express';
import {
  adminProductQuerySchema,
  adminUserUpdateSchema,
  analyticsQuerySchema,
  bulkActionSchema,
  dashboardQuerySchema,
  orderManagementQuerySchema,
  userIdParamSchema,
  userManagementQuerySchema
} from '../schemas/admin.schemas';
import { AdminService } from '../services/admin.service';
import {
  IAdminProductQuery,
  IAdminUserUpdate,
  IOrderManagementQuery,
  IUserManagementQuery
} from '../types/admin.types';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * Get admin dashboard statistics
   */
  @joiQueryValidation(dashboardQuerySchema)
  async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { days } = req.query;
    
    const stats = await this.adminService.getDashboardStats(Number(days) || 30);

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get all users with pagination and filtering
   */
  @joiQueryValidation(userManagementQuerySchema)
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const query: IUserManagementQuery = req.query;
    
    const result = await this.adminService.getUsers(query);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get single user by ID
   */
  @joiParamsValidation(userIdParamSchema)
  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    
    const user = await this.adminService.getUserById(id);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: { user },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update user (Admin action)
   */
  @joiParamsValidation(userIdParamSchema)
  @joiValidation(adminUserUpdateSchema)
  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData: IAdminUserUpdate = req.body;
    
    const user = await this.adminService.updateUser(id, updateData);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Delete user
   */
  @joiParamsValidation(userIdParamSchema)
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    
    await this.adminService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get all orders with admin-level access
   */
  @joiQueryValidation(orderManagementQuerySchema)
  async getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const query: IOrderManagementQuery = req.query;
    
    const result = await this.adminService.getOrders(query);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get all products with admin-specific filtering
   */
  @joiQueryValidation(adminProductQuerySchema)
  async getProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const query: IAdminProductQuery = req.query;
    
    const result = await this.adminService.getProducts(query);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get system analytics
   */
  @joiQueryValidation(analyticsQuerySchema)
  async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { startDate, endDate, granularity } = req.query;
    
    const analytics = await this.adminService.getSystemAnalytics(
      new Date(startDate as string),
      new Date(endDate as string),
      granularity as 'day' | 'week' | 'month'
    );

    res.status(200).json({
      success: true,
      message: 'System analytics retrieved successfully',
      data: analytics,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Bulk user actions
   */
  @joiValidation(bulkActionSchema)
  async bulkUserAction(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { action, userIds } = req.body;
    
    const result = await this.adminService.bulkUserAction(action, userIds);

    res.status(200).json({
      success: true,
      message: `Bulk action '${action}' completed`,
      data: {
        results: result,
        summary: `${result.success} successful, ${result.failed} failed`
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get admin system information
   */
  async getSystemInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    const systemInfo = {
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'System information retrieved successfully',
      data: systemInfo,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Health check for admin services
   */
  async healthCheck(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Test database connectivity
      const userCount = await this.adminService.getUsers({ page: 1, limit: 1 });
      
      const health = {
        status: 'healthy',
        database: 'connected',
        services: {
          userManagement: 'operational',
          orderManagement: 'operational',
          productManagement: 'operational',
          analytics: 'operational'
        },
        timestamp: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        message: 'Admin services are healthy',
        data: health,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Admin services health check failed',
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  }
}
