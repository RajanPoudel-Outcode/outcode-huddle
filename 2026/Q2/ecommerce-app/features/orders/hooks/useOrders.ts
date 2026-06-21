/**
 * useOrders
 * Loads the current user's orders (newest first, per backend default sort).
 */

import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import { ordersService } from "../services/orders.service";
import type { Order } from "../types/order.types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersService.getMyOrders();
      setOrders(res.data.orders ?? []);
    } catch (err) {
      setError(ErrorHandler.getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}
