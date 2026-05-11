import { Request, Response } from 'express';
import { ErrorType, ICustomError, IErrorResponse } from '../../types/types';

// Base Custom Error Class
export class AppError extends Error implements ICustomError {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any;

  constructor(
    type: ErrorType,
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    errors?: any
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific Error Classes
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: any) {
    super(ErrorType.VALIDATION_ERROR, message, 400, true, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(ErrorType.NOT_FOUND, message, 404, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(ErrorType.UNAUTHORIZED, message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access') {
    super(ErrorType.FORBIDDEN, message, 403, true);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', errors?: any) {
    super(ErrorType.BAD_REQUEST, message, 400, true, errors);
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(method: string, allowedMethods: string[] = []) {
    const message = allowedMethods.length > 0 
      ? `Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
      : `Method ${method} not allowed`;
    super(ErrorType.METHOD_NOT_ALLOWED, message, 405, true, { 
      method, 
      allowedMethods 
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(ErrorType.CONFLICT, message, 409, true);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(ErrorType.INTERNAL_SERVER_ERROR, message, 500, false);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(ErrorType.SERVICE_UNAVAILABLE, message, 503, true);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(ErrorType.TOO_MANY_REQUESTS, message, 429, true);
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message: string = 'Payment required') {
    super(ErrorType.PAYMENT_REQUIRED, message, 402, true);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(ErrorType.DATABASE_ERROR, message, 500, false);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(ErrorType.AUTHENTICATION_ERROR, message, 401, true);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message: string = 'Token has expired') {
    super(ErrorType.TOKEN_EXPIRED, message, 401, true);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message: string = 'Invalid token provided') {
    super(ErrorType.INVALID_TOKEN, message, 401, true);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = 'File upload failed') {
    super(ErrorType.FILE_UPLOAD_ERROR, message, 400, true);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(ErrorType.NETWORK_ERROR, message, 503, true);
  }
}

// Error Handler Functions
export const handleInternalServerError = (err: Error, res: Response): void => {
  console.error('Internal Server Error:', err.stack);
  
  const errorResponse: IErrorResponse = {
    message: "Something went wrong!",
    status_code: 500,
    error: true,
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack || undefined;
  }

  res.status(500).json(errorResponse);
};

export const handleNotFoundError = (
  res: Response, 
  message: string, 
  status: number = 404, 
  includeError: boolean = true
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: status,
    error: includeError,
  };

  res.status(status).json(errorResponse);
};

export const handleValidationError = (
  res: Response,
  message: string = "Validation failed",
  errors?: any
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 400,
    error: true,
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  res.status(400).json(errorResponse);
};

export const handleUnauthorizedError = (
  res: Response,
  message: string = "Unauthorized access"
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 401,
    error: true,
  };

  res.status(401).json(errorResponse);
};

export const handleForbiddenError = (
  res: Response,
  message: string = "Forbidden access"
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 403,
    error: true,
  };

  res.status(403).json(errorResponse);
};

export const handleBadRequestError = (
  res: Response,
  message: string = "Bad request",
  errors?: any
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 400,
    error: true,
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  res.status(400).json(errorResponse);
};

export const handleConflictError = (
  res: Response,
  message: string = "Resource conflict"
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 409,
    error: true,
  };

  res.status(409).json(errorResponse);
};

export const handleMethodNotAllowedError = (
  res: Response,
  method: string,
  allowedMethods: string[] = [],
  message?: string
): void => {
  const defaultMessage = allowedMethods.length > 0 
    ? `Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
    : `Method ${method} not allowed`;
    
  const errorResponse: IErrorResponse = {
    message: message || defaultMessage,
    status_code: 405,
    error: true,
    errors: {
      method,
      allowedMethods
    }
  };

  // Set the Allow header as per HTTP spec
  if (allowedMethods.length > 0) {
    res.set('Allow', allowedMethods.join(', '));
  }

  res.status(405).json(errorResponse);
};

export const handleServiceUnavailableError = (
  res: Response,
  message: string = "Service temporarily unavailable"
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 503,
    error: true,
  };

  res.status(503).json(errorResponse);
};

export const handleTooManyRequestsError = (
  res: Response,
  message: string = "Too many requests"
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 429,
    error: true,
  };

  res.status(429).json(errorResponse);
};

export const handlePaymentRequiredError = (
  res: Response,
  message: string = "Payment required"
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 402,
    error: true,
  };

  res.status(402).json(errorResponse);
};

export const handleDatabaseError = (
  res: Response,
  message: string = "Database operation failed"
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 500,
    error: true,
  };

  res.status(500).json(errorResponse);
};

export const handleFileUploadError = (
  res: Response,
  message: string = "File upload failed",
  errors?: any
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 400,
    error: true,
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  res.status(400).json(errorResponse);
};

export const handleNetworkError = (
  res: Response,
  message: string = "Network error occurred"
): void => {
  const errorResponse: IErrorResponse = {
    message: message,
    status_code: 503,
    error: true,
  };

  res.status(503).json(errorResponse);
};

// Generic error response handler
export const sendErrorResponse = (
  res: Response,
  error: AppError | Error,
  req?: Request
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any = undefined;
  let errorType = ErrorType.INTERNAL_SERVER_ERROR;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
    errorType = error.type;
  }

  const errorResponse: IErrorResponse = {
    message,
    status_code: statusCode,
    error: true,
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  if (req) {
    errorResponse.path = req.originalUrl;
    errorResponse.method = req.method;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack || undefined;
  }

  // Log error for monitoring
  console.error(`[${errorType}] ${message}`, {
    statusCode,
    path: req?.originalUrl,
    method: req?.method,
    stack: error.stack,
    errors
  });

  res.status(statusCode).json(errorResponse);
};
