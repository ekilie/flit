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

// Ride types
export enum RideStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface CreateRideDto {
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  dropoffAddress: string;
  notes?: string;
  riderId: number;
}

export interface UpdateRideDto {
  status?: RideStatus;
  driverId?: number;
  vehicleId?: number;
  fare?: number;
  distance?: number;
  estimatedDuration?: number;
  notes?: string;
}

export interface Ride {
  id: number;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  dropoffAddress: string;
  status: RideStatus;
  fare?: number;
  distance?: number;
  estimatedDuration?: number;
  actualDuration?: number;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  riderId: number;
  driverId?: number;
  vehicleId?: number;
  rider?: User;
  driver?: User;
  vehicle?: Vehicle;
  createdAt: string;
  updatedAt: string;
}

// Vehicle types
export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  VAN = 'van',
  LUXURY = 'luxury',
  ECONOMY = 'economy',
}

export enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  capacity: number;
  type: VehicleType;
  status: VehicleStatus;
  imageUrl?: string;
  driverId: number;
  driver?: User;
  createdAt: string;
  updatedAt: string;
}

// Notification types
export enum NotificationType {
  RIDE_REQUEST = 'ride_request',
  RIDE_ACCEPTED = 'ride_accepted',
  RIDE_STARTED = 'ride_started',
  RIDE_COMPLETED = 'ride_completed',
  RIDE_CANCELLED = 'ride_cancelled',
  DRIVER_ARRIVED = 'driver_arrived',
  PAYMENT_RECEIVED = 'payment_received',
  RATING_RECEIVED = 'rating_received',
  SYSTEM = 'system',
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, any>;
  userId: number;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  isRead?: boolean;
  data?: Record<string, any>;
  userId: number;
}

export interface UpdateNotificationDto {
  title?: string;
  message?: string;
  type?: NotificationType;
  isRead?: boolean;
  data?: Record<string, any>;
}

// Payment types
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  WALLET = 'wallet',
  MOBILE_MONEY = 'mobile_money',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Payment {
  id: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  description?: string;
  rideId: number;
  userId: number;
  ride?: Ride;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  transactionId?: string;
  description?: string;
  rideId: number;
  userId: number;
}

export interface UpdatePaymentDto {
  amount?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  transactionId?: string;
  description?: string;
}

// Rating types
export enum RatingType {
  RIDER_TO_DRIVER = 'rider_to_driver',
  DRIVER_TO_RIDER = 'driver_to_rider',
}

export interface Rating {
  id: number;
  rating: number;
  review?: string;
  type: RatingType;
  fromUserId: number;
  toUserId: number;
  rideId: number;
  fromUser?: User;
  toUser?: User;
  ride?: Ride;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingDto {
  rating: number;
  review?: string;
  type: RatingType;
  fromUserId: number;
  toUserId: number;
  rideId: number;
}

export interface UpdateRatingDto {
  rating?: number;
  review?: string;
}

// Location types
export interface Location {
  id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  userId: number;
  rideId?: number;
  user?: User;
  ride?: Ride;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDto {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  userId: number;
  rideId?: number;
}

export interface UpdateLocationDto {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}
