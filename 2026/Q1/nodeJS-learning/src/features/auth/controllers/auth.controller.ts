import { refreshTokenSchema, signinSchema, signupSchema, updateProfileSchema } from '@/features/auth/schemas/auth.schemas';
import { AuthService } from '@/features/auth/services/auth.service';
import { IRefreshTokenRequest, ISigninRequest, ISignupRequest, IUpdateProfileRequest } from '@/features/auth/types/auth.types';
import { joiValidation } from '@/shared/decorators/joi-validation.decorator';
import { createApiResponse } from '@/shared/middlewares/response.middleware';
import { NextFunction, Request, Response } from 'express';


export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * User registration
   */
  @joiValidation(signupSchema)
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signupData: ISignupRequest = req.body;
      const imagePath = req.file?.path;

      const result = await this.authService.signup(signupData, imagePath);

      const response = createApiResponse(true, 'User registered successfully', result.user);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login
   */
  @joiValidation(signinSchema)
  async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signinData: ISigninRequest = req.body;

      const result = await this.authService.signin(signinData);

      const response = createApiResponse(true, 'User signed in successfully', result.user);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify access token
   */
  async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const response = createApiResponse(false, 'Access token is required');
        res.status(401).json(response);
        return;
      }

      const token = authHeader.substring(7);
      const user = await this.authService.verifyToken(token);

      const response = createApiResponse(true, 'Token is valid', { user });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  @joiValidation(refreshTokenSchema)
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refresh_token }: IRefreshTokenRequest = req.body;

      const result = await this.authService.refreshToken(refresh_token);

      const response = createApiResponse(true, 'Token refreshed successfully', result.user);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const response = createApiResponse(false, 'Authentication required');
        res.status(401).json(response);
        return;
      }

      const user = await this.authService.getUserProfile(req.user._id);

      const response = createApiResponse(true, 'Profile retrieved successfully', { user });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  @joiValidation(updateProfileSchema)
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const response = createApiResponse(false, 'Authentication required');
        res.status(401).json(response);
        return;
      }

      const updateData: IUpdateProfileRequest = req.body;
      const imagePath = req.file?.path;

      const user = await this.authService.updateProfile(req.user._id, updateData, imagePath);

      const response = createApiResponse(true, 'Profile updated successfully', { user });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const response = createApiResponse(false, 'Authentication required');
        res.status(401).json(response);
        return;
      }

      await this.authService.logout(req.user._id);

      const response = createApiResponse(true, 'Logged out successfully');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  @joiValidation(
    // Inline schema for change password
    require('joi').object({
      currentPassword: require('joi').string().required().messages({
        'any.required': 'Current password is required',
        'string.empty': 'Current password cannot be empty'
      }),
      newPassword: require('joi').string()
        .min(8)
        .max(128)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
        .required()
        .messages({
          'string.min': 'New password must be at least 8 characters long',
          'string.max': 'New password cannot exceed 128 characters',
          'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
          'any.required': 'New password is required',
          'string.empty': 'New password cannot be empty'
        })
    })
  )
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        void res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      await this.authService.changePassword(req.user._id, currentPassword, newPassword);

      const response = createApiResponse(true, 'Password changed successfully');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
