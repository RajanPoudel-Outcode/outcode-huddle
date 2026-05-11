import { NextFunction, Request, Response } from 'express';
import { meta } from './common.middleware';

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: any;
  meta?: typeof meta;
}

export interface IApiErrorResponse {
  success: boolean;
  message: string;
  errors?: any;
  meta: typeof meta;
  path: string;
  method: string;
}

/**
 * Middleware to add metadata to all API responses
 */
export const responseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Store original json method
  const originalJson = res.json;

  // Override res.json to add metadata
  res.json = function (body: any) {
    // Only add metadata if it's not already present
    if (body && typeof body === "object" && !body.meta) {
      body.meta = meta;
    }

    // Call original json method
    return originalJson.call(this, body);
  };

  next();
};

/**
 * Helper function to create standardized API responses
 */
export const createApiResponse = <T = any>(
  success: boolean,
  message: string,
  data?: T,
  pagination?: any
): IApiResponse<T> => {
  const response: IApiResponse<T> = {
    success,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }
  if (pagination !== undefined) {
    response.pagination = pagination;
  }
  response.meta = meta;

  return response;
};

/**
 * Helper function to create standardized API error responses
 */
export const createApiErrorResponse = (
  message: string,
  errors?: any,
  path?: string,
  method?: string
): IApiErrorResponse => {
  return {
    success: false,
    message,
    errors,
    meta,
    path: path || "",
    method: method || "",
  };
};
