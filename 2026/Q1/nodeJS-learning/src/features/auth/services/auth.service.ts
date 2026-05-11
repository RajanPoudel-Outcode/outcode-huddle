import User, { IUserDocument } from '@/features/auth/models/user.model';
import { IAuthenticatedUser, IAuthResponse, ISigninRequest, ISignupRequest, ITokenPayload, IUpdateProfileRequest } from '@/features/auth/types/auth.types';
import { ConflictError, NotFoundError, UnauthorizedError } from '@/shared/exception/error_handler';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private readonly jwtSecret: string;
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '30d';

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(userId: string, email: string, type: 'User' | 'Admin') {
    const payload: ITokenPayload = { userId, email, type };
    
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry
    });
    
    const refreshToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiry
    });

    return { accessToken, refreshToken };
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return await bcryptjs.hash(password, 12);
  }

  /**
   * Compare password
   */
  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcryptjs.compare(password, hashedPassword);
  }

  /**
   * Create user response without sensitive data
   */
  private createUserResponse(user: IUserDocument): Omit<IAuthenticatedUser, 'password'> {
    const userObj = user.toObject();
    return {
      id: (userObj._id as any).toString(),
      name: userObj.name,
      email: userObj.email,
      address: userObj.address,
      type: userObj.type,
      image: userObj.image,
      token: userObj.token,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt
    };
  }

  /**
   * Register new user
   */
  async signup(signupData: ISignupRequest, imagePath?: string): Promise<IAuthResponse> {
    const { name, email, password, address, type } = signupData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      address: address?.trim() || '',
      type: type || 'User',
      image: imagePath || ''
    });

    const savedUser = await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(
      savedUser._id.toString(),
      savedUser.email,
      savedUser.type || 'User'
    );

    // Update user with tokens
    savedUser.token = {
      access_token: accessToken,
      refresh_token: refreshToken
    };
    await savedUser.save();

    return {
      user: this.createUserResponse(savedUser)
    };
  }

  /**
   * Authenticate user
   */
  async signin(signinData: ISigninRequest): Promise<IAuthResponse> {
    const { email, password } = signinData;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate new tokens
    const { accessToken, refreshToken } = this.generateTokens(
      user._id.toString(),
      user.email,
      user.type || 'User'
    );

    // Update user with new tokens
    user.token = {
      access_token: accessToken,
      refresh_token: refreshToken
    };
    await user.save();

    return {
    user: this.createUserResponse(user)
    };
  }

  /**
   * Verify access token
   */
  async verifyToken(token: string): Promise<Omit<IAuthenticatedUser, 'password'>> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as ITokenPayload;
      
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        throw new UnauthorizedError('Invalid token - user not found');
      }

      return this.createUserResponse(user);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<IAuthResponse> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as ITokenPayload;
      
      const user = await User.findById(decoded.userId);
      if (!user || !user.token || user.token.refresh_token !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(
        user._id.toString(),
        user.email,
        user.type || 'User'
      );

      // Update user with new tokens
      user.token = {
        access_token: accessToken,
        refresh_token: newRefreshToken
      };
      await user.save();

      return {
        user: this.createUserResponse(user)
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<Omit<IAuthenticatedUser, 'password'>> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.createUserResponse(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string, 
    updateData: IUpdateProfileRequest, 
    imagePath?: string
  ): Promise<Omit<IAuthenticatedUser, 'password'>> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: userId }
      });
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }

    // Update user data
    const updates: any = {};
    if (updateData.name) updates.name = updateData.name.trim();
    if (updateData.email) updates.email = updateData.email.toLowerCase();
    if (updateData.address !== undefined) updates.address = updateData.address.trim();
    if (imagePath) updates.image = imagePath;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return this.createUserResponse(updatedUser);
  }

  /**
   * Logout user (clear tokens)
   */
  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $unset: { token: 1 }
    });
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Update password
    user.password = hashedNewPassword;
    await user.save();
  }
}

export const authService: AuthService =
  new AuthService();
