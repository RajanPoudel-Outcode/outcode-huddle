export interface IAuthUser {
  name: string;
  email: string;
  password: string;
  address?: string;
  type?: 'User' | 'Admin';
  image?: string;
  token?: {
    access_token?: string;
    refresh_token?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISignupRequest {
  name: string;
  email: string;
  password: string;
  address?: string;
  type?: 'User' | 'Admin';
}

export interface ISigninRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: Omit<IAuthUser, 'password'>;
}

export interface IRefreshTokenRequest {
  refresh_token: string;
}

export interface IUpdateProfileRequest {
  name?: string;
  email?: string;
  address?: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  type: 'User' | 'Admin';
}

export interface IAuthenticatedUser extends IAuthUser {
  id: string;
}
