import User from '@/features/auth/models/user.model';
import { ITokenPayload } from '@/features/auth/types/auth.types';
import { UnauthorizedError } from '@/shared/exception/error_handler';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

/**
 * Authentication middleware
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as ITokenPayload;
      
      // Fetch user from database
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Attach user and token to request with consistent id field
      const userObj = user.toObject();
      req.user = {
        ...userObj,
        id: (userObj._id as any).toString(),
        _id: undefined // Remove _id to avoid confusion
      };
      req.token = token;
      
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid access token');
      }
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token expired');
      }
      throw jwtError;
    }
  } catch (error) {
    next(error);
  }
};

// /**
//  * Admin role middleware
//  */
// export const adminMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     // First run auth middleware
//     await authMiddleware(req, res, () => {});

//     if (!req.user) {
//       throw new UnauthorizedError('Authentication required');
//     }

//     if (req.user.type !== 'Admin') {
//       throw new UnauthorizedError('Admin access required');
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * Optional authentication middleware (doesn't throw if no token)
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as ITokenPayload;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user) {
        req.user = user;
        req.token = token;
      }
    } catch (jwtError) {
      // Ignore JWT errors for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
};
