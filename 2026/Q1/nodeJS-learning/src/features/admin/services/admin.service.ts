import { ConflictError, NotFoundError, ValidationError } from '../../../shared/exception/error_handler';
import User, { IUserDocument } from '../../auth/models/user.model';
import Order, { IOrderDocument } from '../../orders/models/order.model';
import Product, { IProductDocument } from '../../products/models/product.model';
import {
  IAdminProductQuery,
  IAdminUserUpdate,
  IDashboardStats,
  IOrderManagementQuery,
  IOrderStatusDistribution,
  IPaginatedOrdersResponse,
  IPaginatedProductsAdminResponse,
  IPaginatedUsersResponse,
  IProductPerformance,
  ISalesAnalytics,
  ISystemAnalytics,
  ITopSellingProduct,
  IUserGrowth,
  IUserManagementQuery
} from '../types/admin.types';

export class AdminService {

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(days: number = 30): Promise<IDashboardStats> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      newUsersThisMonth,
      newOrdersThisMonth,
      revenueResult,
      topProductsResult,
      recentOrders
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ createdAt: { $gte: dateLimit } }),
      Order.countDocuments({ createdAt: { $gte: dateLimit } }),
      Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
      ]),
      this.getTopSellingProducts(5),
      Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      newUsersThisMonth,
      newOrdersThisMonth,
      topSellingProducts: topProductsResult,
      recentOrders: recentOrders as IOrderDocument[]
    };
  }

  /**
   * Get top selling products
   */
  private async getTopSellingProducts(limit: number): Promise<ITopSellingProduct[]> {
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems._id',
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: { $toString: '$_id' },
          name: '$product.name',
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    return topProducts;
  }

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(query: IUserManagementQuery): Promise<IPaginatedUsersResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } }
      ];
    }
    if (query.type) {
      filter.type = query.type;
    }

    // Build sort
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password -token')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      users: users.map(user => ({
        ...user,
        id: user._id.toString(),
        _id: undefined
      })) as any,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get single user by ID
   */
  async getUserById(userId: string | undefined): Promise<Omit<IUserDocument, 'password' | 'token'>> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }
    
    const user = await User.findById(userId).select('-password -token').lean();
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      ...user,
      id: user._id.toString(),
      _id: undefined
    } as any;
  }

  /**
   * Update user (Admin action)
   */
  async updateUser(userId: string | undefined, updateData: IAdminUserUpdate): Promise<Omit<IUserDocument, 'password' | 'token'>> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }
    
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: userId } 
      });
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -token').lean();

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return {
      ...updatedUser,
      id: updatedUser._id.toString(),
      _id: undefined
    } as any;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string | undefined): Promise<void> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }
    
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new NotFoundError('User not found');
    }
  }

  /**
   * Get all orders with pagination and filtering (Admin view)
   */
  async getOrders(query: IOrderManagementQuery): Promise<IPaginatedOrdersResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    
    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$or = [
        { '_id': { $regex: query.search, $options: 'i' } },
        { 'shippingAddress.address': { $regex: query.search, $options: 'i' } }
      ];
    }

    if (query.dateFrom || query.dateTo) {
      filter.createdAt = {};
      if (query.dateFrom) {
        filter.createdAt.$gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        filter.createdAt.$lte = new Date(query.dateTo);
      }
    }

    // Build sort
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .populate('orderItems._id', 'name price')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      orders: orders.map(order => ({
        ...order,
        id: order._id.toString(),
        _id: undefined,
        user: order.user ? {
          ...order.user,
          id: (order.user as any)._id.toString(),
          _id: undefined
        } : null
      })) as IOrderDocument[],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get all products with admin-specific filtering
   */
  async getProducts(query: IAdminProductQuery): Promise<IPaginatedProductsAdminResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { category: { $regex: query.search, $options: 'i' } }
      ];
    }

    if (query.category) {
      filter.category = { $regex: query.category, $options: 'i' };
    }

    if (query.stockStatus) {
      switch (query.stockStatus) {
        case 'out-of-stock':
          filter.countInStock = 0;
          break;
        case 'low-stock':
          filter.countInStock = { $gt: 0, $lte: 10 };
          break;
        case 'in-stock':
          filter.countInStock = { $gt: 10 };
          break;
      }
    }

    // Build sort
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      products: products.map(product => ({
        ...product,
        id: product._id.toString(),
        _id: undefined
      })) as IProductDocument[],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get system analytics
   */
  async getSystemAnalytics(startDate: Date, endDate: Date, granularity: 'day' | 'week' | 'month' = 'day'): Promise<ISystemAnalytics> {
    const [userGrowth, salesAnalytics, productPerformance, orderStatusDistribution] = await Promise.all([
      this.getUserGrowthAnalytics(startDate, endDate, granularity),
      this.getSalesAnalytics(startDate, endDate, granularity),
      this.getProductPerformanceAnalytics(),
      this.getOrderStatusDistribution()
    ]);

    return {
      userGrowth,
      salesAnalytics,
      productPerformance,
      orderStatusDistribution
    };
  }

  /**
   * Get user growth analytics
   */
  private async getUserGrowthAnalytics(startDate: Date, endDate: Date, granularity: string): Promise<IUserGrowth[]> {
    const groupBy = this.getDateGroupBy(granularity);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return userGrowth.map(item => ({
      date: item._id,
      newUsers: item.newUsers,
      totalUsers: 0 // Would need running total calculation
    }));
  }

  /**
   * Get sales analytics
   */
  private async getSalesAnalytics(startDate: Date, endDate: Date, granularity: string): Promise<ISalesAnalytics[]> {
    const groupBy = this.getDateGroupBy(granularity);
    
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return salesData.map(item => ({
      date: item._id,
      orders: item.orders,
      revenue: item.revenue
    }));
  }

  /**
   * Get product performance analytics
   */
  private async getProductPerformanceAnalytics(): Promise<IProductPerformance[]> {
    const productStats = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems._id',
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: { $toString: '$_id' },
          productName: '$product.name',
          totalSold: 1,
          revenue: 1,
          averageRating: '$product.rating'
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 20 }
    ]);

    return productStats;
  }

  /**
   * Get order status distribution
   */
  private async getOrderStatusDistribution(): Promise<IOrderStatusDistribution[]> {
    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOrders = statusStats.reduce((sum, item) => sum + item.count, 0);

    return statusStats.map(item => ({
      status: item._id || 'pending',
      count: item.count,
      percentage: ((item.count / totalOrders) * 100)
    }));
  }

  /**
   * Helper method to get date grouping for aggregation
   */
  private getDateGroupBy(granularity: string) {
    switch (granularity) {
      case 'week':
        return {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
      case 'month':
        return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
      default: // day
        return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }
  }

  /**
   * Bulk user actions
   */
  async bulkUserAction(action: string, userIds: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const userId of userIds) {
      try {
        switch (action) {
          case 'delete':
            await this.deleteUser(userId);
            break;
          case 'activate':
            await this.updateUser(userId, { isActive: true });
            break;
          case 'deactivate':
            await this.updateUser(userId, { isActive: false });
            break;
          case 'promote':
            await this.updateUser(userId, { type: 'Admin' });
            break;
          case 'demote':
            await this.updateUser(userId, { type: 'User' });
            break;
          default:
            throw new ValidationError(`Invalid action: ${action}`);
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`User ${userId}: ${(error as Error).message}`);
      }
    }

    return results;
  }
}
