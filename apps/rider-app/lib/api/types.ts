export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetCodeDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  new_password: string;
}

export interface UpdateUserDto {
  name?: string;
  display_name?: string;
  email?: string;
  metadata?: {
    username?: string;
    location?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface UserMetadata {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  username?: string;
  location?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  total_listens: number;
  total_likes: number;
  total_uploads: number;
  last_device?: string;
  last_ip?: string;
  last_location?: string;
  extra?: Record<string, any>;
}

export interface Role {
  id: number;
  name: string;
  is_active: boolean;
}

export interface User {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  display_name?: string;
  email: string;
  is_active: boolean;
  last_login?: string;
  roles?: Role[];
  role: string;
  metadata: UserMetadata;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  refresh_token?: string;
  metadata?: any;
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  id?: number;
  status?: string;
  url?: string;
  message?: string;
  metadata?: {
    original_name: string;
    file_type: string;
    file_size: number;
    upload_time: string;
  };
}
