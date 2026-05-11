import { BadRequestError, NotFoundError, ValidationError } from '../../../shared/exception/error_handler';
import { Product } from '../../products/models/product.model';
import { IOrderDocument, Order } from '../models/order.model';
import {
  ICreateOrderRequest,
  IOrderQuery,
  IOrderResponse,
  IOrderStats,
  IPaginatedOrdersResponse,
  IUpdateOrderRequest
} from '../types/orders.types';

export class OrdersService {
  /**
   * Create user-friendly order response
   */
  private createOrderResponse(order: IOrderDocument): IOrderResponse {
    const orderObj = order.toObject();
    return {
      id: (orderObj._id as any).toString(),
      user: orderObj.user,
      orderItems: orderObj.orderItems,
      shippingAddress: orderObj.shippingAddress,
      paymentMethod: orderObj.paymentMethod,
      totalTax: orderObj.totalTax,
      totalPrice: orderObj.totalPrice,
      shippingPrice: orderObj.shippingPrice,
      status: orderObj.status,
      createdAt: orderObj.createdAt,
      updatedAt: orderObj.updatedAt
    };
  }

  /**
   * Build MongoDB filter object from query parameters
   */
  private buildFilter(query: IOrderQuery, userId?: string): any {
    const filter: any = {};

    // If userId is provided (for regular users), filter by user
    if (userId) {
      filter.user = userId;
    }

    // Admin can filter by specific user
    if (query.userId && !userId) {
      filter.user = query.userId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        filter.createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.createdAt.$lte = new Date(query.endDate);
      }
    }

    return filter;
  }

  /**
   * Build MongoDB sort object from query parameters
   */
  private buildSort(query: IOrderQuery): any {
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrder };
  }

  /**
   * Validate order items and check product availability
   */
  private async validateOrderItems(orderItems: any[]): Promise<void> {
    if (!orderItems || orderItems.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new NotFoundError(`Product with ID ${item.product} not found`);
      }

      if ((product.countInStock || 0) < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for product "${product.name}". Available: ${product.countInStock || 0}, Requested: ${item.quantity}`
        );
      }

      // Validate price matches current product price
      if (Math.abs(product.price - item.price) > 0.01) {
        throw new BadRequestError(
          `Price mismatch for product "${product.name}". Current price: ${product.price}, Provided: ${item.price}`
        );
      }
    }
  }

  /**
   * Update product stock after order creation
   */
  private async updateProductStock(orderItems: any[]): Promise<void> {
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: -item.quantity } },
        { new: true }
      );
    }
  }

  /**
   * Restore product stock (for order cancellation)
   */
  private async restoreProductStock(orderItems: any[]): Promise<void> {
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: item.quantity } },
        { new: true }
      );
    }
  }

  /**
   * Create new order
   */
  async createOrder(userId: string, orderData: ICreateOrderRequest): Promise<IOrderResponse> {
    // Validate order items and check availability
    await this.validateOrderItems(orderData.orderItems);

    // Calculate total to verify client calculation
    const calculatedTotal = orderData.orderItems.reduce(
      (total, item) => total + (item.price * item.quantity), 0
    );

    const expectedTotal = calculatedTotal + orderData.totalTax + orderData.shippingPrice;
    if (Math.abs(expectedTotal - orderData.totalPrice) > 0.01) {
      throw new BadRequestError('Total price calculation is incorrect');
    }

    // Create order
    const order = new Order({
      user: userId,
      orderItems: orderData.orderItems,
      shippingAddress: orderData.shippingAddress.trim(),
      paymentMethod: orderData.paymentMethod,
      totalTax: orderData.totalTax,
      totalPrice: orderData.totalPrice,
      shippingPrice: orderData.shippingPrice,
      status: 'pending'
    });

    const savedOrder = await order.save();

    // Update product stock
    await this.updateProductStock(orderData.orderItems);

    // Populate order items with product details
    await savedOrder.populate({
      path: 'orderItems.product',
      select: 'name price images category'
    });

    return this.createOrderResponse(savedOrder);
  }

  /**
   * Get orders with pagination and filtering
   */
  async getOrders(query: IOrderQuery, userId?: string): Promise<IPaginatedOrdersResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter = this.buildFilter(query, userId);
    const sort = this.buildSort(query);

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate({
          path: 'orderItems.product',
          select: 'name price images category'
        })
        .populate({
          path: 'user',
          select: 'name email'
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      orders: orders.map(order => ({
        id: order._id.toString(),
        user: order.user,
        orderItems: order.orderItems,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        totalTax: order.totalTax,
        totalPrice: order.totalPrice,
        shippingPrice: order.shippingPrice,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      })) as IOrderResponse[],
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
   * Get single order by ID
   */
  async getOrderById(orderId: string | undefined, userId?: string): Promise<IOrderResponse> {
    if (!orderId) {
      throw new ValidationError('Order ID is required');
    }
    
    const filter: any = { _id: orderId };
    if (userId) {
      filter.user = userId; // Regular users can only see their own orders
    }

    const order = await Order.findOne(filter)
      .populate({
        path: 'orderItems.product',
        select: 'name price images category'
      })
      .populate({
        path: 'user',
        select: 'name email'
      });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return this.createOrderResponse(order);
  }

  /**
   * Update order (admin only or limited user updates)
   */
  async updateOrder(
    orderId: string | undefined, 
    updateData: IUpdateOrderRequest, 
    userId?: string
  ): Promise<IOrderResponse> {
    if (!orderId) {
      throw new ValidationError('Order ID is required');
    }
    
    const filter: any = { _id: orderId };
    if (userId) {
      filter.user = userId;
    }

    const order = await Order.findOne(filter);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Prevent status changes for regular users except cancellation
    if (userId && updateData.status && updateData.status !== 'cancelled') {
      throw new BadRequestError('Users can only cancel their orders');
    }

    // Handle stock restoration for cancelled orders
    if (updateData.status === 'cancelled' && order.status !== 'cancelled') {
      await this.restoreProductStock(order.orderItems);
    }

    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate({
      path: 'orderItems.product',
      select: 'name price images category'
    })
    .populate({
      path: 'user',
      select: 'name email'
    });

    if (!updatedOrder) {
      throw new NotFoundError('Order not found');
    }

    return this.createOrderResponse(updatedOrder);
  }

  /**
   * Delete order (admin only)
   */
  async deleteOrder(orderId: string | undefined): Promise<void> {
    if (!orderId) {
      throw new ValidationError('Order ID is required');
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Restore product stock if order is not cancelled
    if (order.status !== 'cancelled') {
      await this.restoreProductStock(order.orderItems);
    }

    await Order.findByIdAndDelete(orderId);
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string, query: IOrderQuery): Promise<IPaginatedOrdersResponse> {
    return this.getOrders(query, userId);
  }

  /**
   * Get order statistics (admin only)
   */
  async getOrderStats(): Promise<IOrderStats> {
    const [totalOrders, totalRevenue, ordersByStatus] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    ordersByStatus.forEach(stat => {
      if (stat._id in statusCounts) {
        statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
      }
    });

    return {
      totalOrders,
      totalRevenue: Math.round(revenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      ordersByStatus: statusCounts
    };
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string | undefined, userId?: string): Promise<IOrderResponse> {
    return this.updateOrder(orderId, { status: 'cancelled' }, userId);
  }
}
