/**
 * Support Service — pure API calls. Authenticated endpoints; the network layer
 * attaches the bearer token automatically.
 */

import { networkService } from "@/services";
import type { ApiResponse } from "@/types/api.types";
import type { CreateSupportPayload, SupportRequest } from "../types/support.types";

export const supportService = {
  getMyRequests: (): Promise<ApiResponse<SupportRequest[]>> =>
    networkService.get<SupportRequest[]>("/support", undefined, { cache: false }),

  getRequestById: (id: string): Promise<ApiResponse<SupportRequest>> =>
    networkService.get<SupportRequest>(`/support/${id}`, undefined, { cache: false }),

  createRequest: (data: CreateSupportPayload): Promise<ApiResponse<SupportRequest>> =>
    networkService.post<SupportRequest>("/support", data, { cache: false }),
};
