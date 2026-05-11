export interface IOrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  user: string | any; // ObjectId or string
  orderItems: IOrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  totalTax: number;
  totalPrice: number;
  shippingPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateOrderRequest {
  orderItems: IOrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  totalTax: number;
  totalPrice: number;
  shippingPrice: number;
}

export interface IUpdateOrderRequest {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: string;
  paymentMethod?: string;
}

export interface IOrderQuery {
  page?: number;
  limit?: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  userId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'totalPrice' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface IOrderResponse {
  id: string;
  user: string;
  orderItems: IOrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  totalTax: number;
  totalPrice: number;
  shippingPrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaginatedOrdersResponse {
  orders: IOrderResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IOrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}
