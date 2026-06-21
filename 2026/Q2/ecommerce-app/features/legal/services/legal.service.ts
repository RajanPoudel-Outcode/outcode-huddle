/**
 * Legal Service — pure API calls. Public endpoint, fetches a content page by type.
 */

import { networkService } from "@/services";
import type { ApiResponse } from "@/types/api.types";
import type { ContentPage, ContentPageType } from "../types/legal.types";

export const legalService = {
  getPage: (type: ContentPageType): Promise<ApiResponse<ContentPage>> =>
    networkService.get<ContentPage>(`/content/${type}`, undefined, { cache: false }),
};
