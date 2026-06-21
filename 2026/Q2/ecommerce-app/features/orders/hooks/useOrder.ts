/**
 * useOrder
 * Loads a single order by id and exposes a cancel action (PATCH cancel).
 */

import { ErrorHandler } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import { ordersService } from "../services/orders.service";
import type { Order } from "../types/order.types";

export function useOrder(id?: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await ordersService.getOrderById(id);
      setOrder(res.data.order);
    } catch (err) {
      setError(ErrorHandler.getUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const cancel = useCallback(async () => {
    if (!id) return undefined;
    setIsCancelling(true);
    try {
      const res = await ordersService.cancelOrder(id);
      setOrder(res.data.order);
      return res.data.order;
    } finally {
      setIsCancelling(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, isLoading, error, refetch: fetchOrder, cancel, isCancelling };
}
