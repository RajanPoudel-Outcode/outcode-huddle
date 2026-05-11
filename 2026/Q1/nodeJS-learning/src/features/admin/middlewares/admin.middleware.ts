import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, IErrorResponse, IJwtPayload } from '../../../types/types';
import User from '../../auth/models/user.model';

export const adminMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const errorResponse: IErrorResponse = {
        message: "No auth token, access denied!",
        status_code: 401,
        error: true
      };
      res.status(401).json(errorResponse);
      return;
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      const errorResponse: IErrorResponse = {
        message: "No auth token, access denied!",
        status_code: 401,
        error: true
      };
      res.status(401).json(errorResponse);
      return;
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const verified = jwt.verify(token, jwtSecret) as unknown as IJwtPayload;
      
      if (!verified || !verified.userId) {
        const errorResponse: IErrorResponse = {
          message: "Token authorization failed, access denied!",
          status_code: 401,
          error: true
        };
        res.status(401).json(errorResponse);
        return;
      }

      const user = await User.findById(verified.userId).select('-password');
      
      if (!user) {
        const errorResponse: IErrorResponse = {
          message: "User not found, access denied!",
          status_code: 401,
          error: true
        };
        res.status(401).json(errorResponse);
        return;
      }

      if (user.type !== "Admin") {
        const errorResponse: IErrorResponse = {
          message: "You are not an admin, access denied!",
          status_code: 403,
          error: true
        };
        res.status(403).json(errorResponse);
        return;
      }

      req.user = user;
      req.token = token;
      next();
    } catch (err) {
      const errorResponse: IErrorResponse = {
        message: "Token authorization failed, access denied!",
        status_code: 401,
        error: true
      };
      res.status(401).json(errorResponse);
      return;
    }
  } catch (err) {
    const error = err as Error;
    const errorResponse: IErrorResponse = {
      message: error.message,
      status_code: 500,
      error: true
    };
    res.status(500).json(errorResponse);
  }
};

export default adminMiddleware;
