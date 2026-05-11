import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';


// JWT types
export interface IJwtPayload extends JwtPayload {
  userId: string;
}

// File upload types
export interface IMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Express Request extensions
export interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string; // Make token optional for backward compatibility
}

export interface OptionalAuthRequest extends Request {
  user?: any;
  token?: string;
}

export interface FileUploadRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

// API Response types
export interface IApiResponse<T = any> {
  data?: T;
  meta?: any;
  message?: string;
  error?: boolean;
  status_code?: number;
}

// Error types
export interface IErrorResponse {
  message: string;
  status_code: number;
  error: boolean | string;
  stack?: string | undefined;
  errors?: any;
  path?: string;
  method?: string;
}

// Custom error types
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BAD_REQUEST = 'BAD_REQUEST',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface ICustomError {
  type: ErrorType;
  message: string;
  statusCode: number;
  isOperational: boolean;
  stack?: string;
  errors?: any;
}

