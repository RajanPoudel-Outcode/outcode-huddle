import { NextFunction, Request, Response } from 'express';
import { ErrorType, IErrorResponse } from '../../types/types';
import { AppError, sendErrorResponse } from '../exception/error_handler';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    ErrorType.NOT_FOUND,
    `Route ${req.originalUrl} not found`,
    404,
    true
  );
  
  sendErrorResponse(res, error, req);
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle different types of errors
  let error = err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Validation Error';
    const errors = Object.values((err as any).errors).map((val: any) => val.message);
    error = new AppError(ErrorType.VALIDATION_ERROR, message, 400, true, errors);
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value!`;
    error = new AppError(ErrorType.CONFLICT, message, 409, true);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    const message = `Invalid ${(err as any).path}: ${(err as any).value}`;
    error = new AppError(ErrorType.BAD_REQUEST, message, 400, true);
  }

  // HTTP Method not allowed errors
  if ((err as any).status === 405 || (err as any).statusCode === 405) {
    const allowedMethods = (err as any).allowedMethods || [];
    const message = allowedMethods.length > 0 
      ? `Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
      : `Method ${req.method} not allowed`;
    error = new AppError(ErrorType.METHOD_NOT_ALLOWED, message, 405, true, {
      method: req.method,
      allowedMethods
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    error = new AppError(ErrorType.INVALID_TOKEN, message, 401, true);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new AppError(ErrorType.TOKEN_EXPIRED, message, 401, true);
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    let statusCode = 400;

    switch ((err as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field';
        break;
      default:
        message = 'File upload failed';
    }

    error = new AppError(ErrorType.FILE_UPLOAD_ERROR, message, statusCode, true);
  }

  // Handle operational vs programming errors
  if (!(error instanceof AppError)) {
    // Programming error - don't leak error details in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : error.message;
    
    error = new AppError(
      ErrorType.INTERNAL_SERVER_ERROR,
      message,
      500,
      false
    );
  }

  sendErrorResponse(res, error, req);
};

// Async error wrapper to catch async errors
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Rate limiting error handler
export const rateLimitErrorHandler = (req: Request, res: Response): void => {
  const errorResponse: IErrorResponse = {
    message: 'Too many requests from this IP, please try again later.',
    status_code: 429,
    error: true,
    path: req.originalUrl,
    method: req.method
  };

  res.status(429).json(errorResponse);
};

// CORS error handler
export const corsErrorHandler = (req: Request, res: Response): void => {
  const errorResponse: IErrorResponse = {
    message: 'CORS policy violation. Origin not allowed.',
    status_code: 403,
    error: true,
    path: req.originalUrl,
    method: req.method
  };

  res.status(403).json(errorResponse);
};

// Handle uncaught exceptions
export const handleUncaughtException = (err: Error): void => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
};

// Handle unhandled promise rejections
export const handleUnhandledRejection = (err: Error): void => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);
  console.error('Stack:', err.stack);
  
  // Give the server time to finish all pending requests
  setTimeout(() => {
    process.exit(1);
  }, 1000);
};
