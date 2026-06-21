/**
 * Global API Types
 * Typed wrapper for every backend response.
 *
 * The backend wraps all responses in a common envelope:
 *  - success: { success, message, data, meta }
 *  - error:   { error, message, status_code, path, method, meta }
 */

export interface ApiMeta {
  copyright?: string;
  site?: string;
  emails?: string[];
  api?: { version: number };
}

/**
 * Standard success envelope returned by every API endpoint.
 * `T` is the shape of the `data` payload.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

/**
 * Standard error envelope returned by the API on failure.
 */
export interface ApiErrorResponse {
  error: boolean;
  message: string;
  status_code: number;
  path?: string;
  method?: string;
  meta?: ApiMeta;
}
