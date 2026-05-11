import { IUserDocument } from '../../auth/models/user.model';
import { IOrderDocument } from '../../orders/models/order.model';
import { IProductDocument } from '../../products/models/product.model';

// Admin Dashboard Types
export interface IDashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  newOrdersThisMonth: number;
  topSellingProducts: ITopSellingProduct[];
  recentOrders: IOrderDocument[];
}

export interface ITopSellingProduct {
  _id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

// User Management Types
export interface IUserManagementQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'User' | 'Admin';
  sortBy?: 'name' | 'email' | 'createdAt' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedUsersResponse {
  users: Omit<IUserDocument, 'password' | 'token'>[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Order Management Types
export interface IOrderManagementQuery {
  page?: number;
  limit?: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  search?: string;
  sortBy?: 'createdAt' | 'totalPrice' | 'status';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface IPaginatedOrdersResponse {
  orders: IOrderDocument[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Product Management Types (Admin specific)
export interface IAdminProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
  sortBy?: 'name' | 'price' | 'createdAt' | 'countInStock';
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedProductsAdminResponse {
  products: IProductDocument[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// System Analytics Types
export interface ISystemAnalytics {
  userGrowth: IUserGrowth[];
  salesAnalytics: ISalesAnalytics[];
  productPerformance: IProductPerformance[];
  orderStatusDistribution: IOrderStatusDistribution[];
}

export interface IUserGrowth {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface ISalesAnalytics {
  date: string;
  orders: number;
  revenue: number;
}

export interface IProductPerformance {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
  averageRating: number;
}

export interface IOrderStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

// Admin User Update Types
export interface IAdminUserUpdate {
  name?: string;
  email?: string;
  address?: string;
  type?: 'User' | 'Admin';
  isActive?: boolean;
}

// Admin Action Response Types
export interface IAdminActionResponse {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}
