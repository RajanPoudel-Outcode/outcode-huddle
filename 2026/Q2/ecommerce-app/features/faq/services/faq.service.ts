/**
 * FAQ Service — pure API calls. Public endpoint, returns published FAQs.
 */

import { networkService } from "@/services";
import type { ApiResponse } from "@/types/api.types";
import type { Faq } from "../types/faq.types";

export const faqService = {
  getFaqs: (): Promise<ApiResponse<Faq[]>> =>
    networkService.get<Faq[]>("/faq", undefined, { cache: false }),
};
