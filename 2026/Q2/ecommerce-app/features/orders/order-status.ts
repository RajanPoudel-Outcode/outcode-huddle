import { Colors } from "@/constants/theme";
import type { OrderItem, OrderStatus } from "./types/order.types";

/** Label + badge color per order status. */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "#F5A623" },
  processing: { label: "Processing", color: "#2F80ED" },
  shipped: { label: "Shipped", color: "#6C5CE7" },
  delivered: { label: "Delivered", color: Colors.success },
  cancelled: { label: "Cancelled", color: Colors.error },
};

/** Ordered fulfilment steps for the status progress row (excludes cancelled). */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

/** Read display fields whether `product` is populated or a bare id string. */
export function orderItemDisplay(item: OrderItem): {
  name: string;
  image?: string;
} {
  if (item.product && typeof item.product === "object") {
    return { name: item.product.name, image: item.product.images?.[0] };
  }
  return { name: "Product" };
}
