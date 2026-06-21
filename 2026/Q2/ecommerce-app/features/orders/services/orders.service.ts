/**
 * Orders Service — pure API calls. Authenticated endpoints; the network layer
 * attaches the bearer token automatically.
 *
 * Note the inconsistent response nesting from the backend:
 *  - createOrder  -> data is the Order
 *  - getMyOrders  -> data is { orders, pagination }
 *  - getOrderById -> data is { order }
 *  - cancelOrder  -> data is { order }
 */

import { networkService } from "@/services";
import type { ApiPagination, ApiResponse } from "@/types/api.types";
import type { CreateOrderPayload, Order } from "../types/order.types";

export const ordersService = {
  createOrder: (payload: CreateOrderPayload): Promise<ApiResponse<Order>> =>
    networkService.post<Order>("/orders", payload, { cache: false }),

  getMyOrders: (): Promise<
    ApiResponse<{ orders: Order[]; pagination: ApiPagination }>
  > =>
    networkService.get<{ orders: Order[]; pagination: ApiPagination }>(
      "/orders/user/my-orders",
      undefined,
      { cache: false },
    ),

  getOrderById: (id: string): Promise<ApiResponse<{ order: Order }>> =>
    networkService.get<{ order: Order }>(`/orders/${id}`, undefined, {
      cache: false,
    }),

  cancelOrder: (id: string): Promise<ApiResponse<{ order: Order }>> =>
    networkService.patch<{ order: Order }>(`/orders/${id}/cancel`, undefined, {
      cache: false,
    }),
};
