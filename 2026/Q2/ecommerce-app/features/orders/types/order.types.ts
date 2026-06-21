/**
 * Orders Feature Types — aligned with the backend order model.
 * The backend populates `orderItems.product` with product details.
 */

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Payment method value the backend expects for Cash on Delivery. */
export const PAYMENT_COD = "cash_on_delivery";

/** Flat shipping fee used by both the cart summary and checkout totals. */
export const SHIPPING_FEE = 15;

export interface OrderItemProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category?: string;
}

export interface OrderItem {
  /** Populated by the backend; falls back to a bare id string defensively. */
  product: OrderItemProduct | string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user: string | { _id?: string; name?: string; email?: string };
  orderItems: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  totalTax: number;
  shippingPrice: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  orderItems: { product: string; quantity: number; price: number }[];
  shippingAddress: string;
  paymentMethod: string;
  totalTax: number;
  shippingPrice: number;
  totalPrice: number;
}
