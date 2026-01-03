import { Alert } from "react-native";

import {
  ApiResponse,
  AuthResponse,
  CreateNotificationDto,
  CreatePaymentDto,
  CreateRatingDto,
  CreateRideDto,
  ForgotPasswordDto,
  LoginDto,
  Notification,
  Payment,
  Rating,
  RefreshTokenResponse,
  RegisterDto,
  ResetPasswordDto,
  Ride,
  RideStatus,
  UpdateNotificationDto,
  UpdatePaymentDto,
  UpdateRatingDto,
  UpdateRideDto,
  UpdateUserDto,
  UploadResponse,
  User,
  Vehicle,
  VerifyOtpDto,
  VerifyResetCodeDto,
} from "@/lib/api/types";
import { clearCache, saveUser, setAuthToken } from "./authToken";
import api from "./config";

class Api {
  static async register(payload: RegisterDto): Promise<AuthResponse> {
    try {
      const res = await api(false).post("/register", payload);
      const responseData = res.data;

      console.log("Registration response:", responseData);

      // Handle actual backend response structure
      if (responseData.user) {
        await saveUser({
          id:
            responseData.user.id?.toString() ||
            responseData.user.ID?.toString(),
          name: responseData.user.name,
          email: responseData.user.email,
          role:
            responseData.user.role ||
            (responseData.user.roles?.length > 0
              ? responseData.user.roles[0]
              : "user"),
        });

        const normalizedResponse = {
          user: {
            id: responseData.user.id || responseData.user.ID,
            ID: responseData.user.id || responseData.user.ID,
            name: responseData.user.name,
            email: responseData.user.email,
            role:
              responseData.user.role ||
              (responseData.user.roles?.length > 0
                ? responseData.user.roles[0]
                : "user"),
            roles: responseData.user.roles || [
              responseData.user.role || "user",
            ],
            metadata: responseData.user.metadata || {},
            created_at:
              responseData.user.created_at || new Date().toISOString(),
            updated_at:
              responseData.user.updated_at || new Date().toISOString(),
            is_active: responseData.user.is_active ?? true,
            email_verified_at: responseData.user.email_verified_at || null,
          },
          message: responseData.message || "Registration successful",
          // No token for registration - user needs to login separately
        };

        return normalizedResponse as AuthResponse;
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (error: any) {
      console.log("Registration error details:", error);

      // Handle network errors specifically
      if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
        throw new Error(
          "Cannot connect to server. Please check your internet connection and try again."
        );
      }

      // Handle server response errors
      if (error.response) {
        const message =
          error.response.data?.error ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        throw new Error(message);
      }

      if (error.request) {
        throw new Error("Cannot reach server. Please check your connection.");
      }

      throw new Error(error.message || "Registration failed");
    }
  }

  static async login(payload: LoginDto): Promise<AuthResponse> {
    try {
      const res = await api(false).post("/login", payload);
      const responseData = res.data;

      console.log("Login response:", responseData);

      // Store tokens and user data
      if (responseData.token && responseData.user) {
        await setAuthToken({
          access: responseData.token,
          refresh: responseData.refresh_token || null,
        });

        await saveUser({
          id:
            responseData.user.id?.toString() ||
            responseData.user.ID?.toString(),
          name: responseData.user.name,
          email: responseData.user.email,
          role:
            responseData.user.role ||
            (responseData.user.roles?.length > 0
              ? responseData.user.roles[0]
              : "user"),
        });

        // Create a normalized response for the frontend
        const normalizedResponse = {
          user: {
            id: responseData.user.id || responseData.user.ID,
            ID: responseData.user.id || responseData.user.ID,
            name: responseData.user.name,
            email: responseData.user.email,
            role:
              responseData.user.role ||
              (responseData.user.roles?.length > 0
                ? responseData.user.roles[0]
                : "user"),
            roles: responseData.user.roles || [
              responseData.user.role || "user",
            ],
            metadata: responseData.user.metadata || {},
            created_at:
              responseData.user.created_at || new Date().toISOString(),
            updated_at:
              responseData.user.updated_at || new Date().toISOString(),
            is_active: responseData.user.is_active ?? true,
            email_verified_at: responseData.user.email_verified_at || null,
          },
          token: responseData.token,
          refresh_token: responseData.refresh_token,
          message: responseData.message || "Login successful",
        };

        return normalizedResponse as AuthResponse;
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (error: any) {
      console.log("Login error details:", error);

      // Handle network errors specifically
      if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
        throw new Error(
          "Cannot connect to server. Please check your internet connection and try again."
        );
      }

      // Handle timeout errors
      if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout. Please try again.");
      }

      // Handle server response errors
      if (error.response) {
        const message =
          error.response.data?.error ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        throw new Error(message);
      }

      // Handle request setup errors
      if (error.request) {
        throw new Error("Cannot reach server. Please check your connection.");
      }

      // Generic error fallback
      throw new Error(error.message || "Login failed");
    }
  }

  static async logout(): Promise<void> {
    try {
      await api(true).post("/logout");
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      await clearCache();
    }
  }

  static async getCurrentUser(): Promise<any> {
    try {
      const res = await api(true).get("/users/me");
      const responseData = res.data;
      console.log("Current user data:", responseData);
      if (responseData.data && responseData.success) {
        return responseData.data;
      }

      return responseData;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch user data";
      throw new Error(message);
    }
  }

  static async updateCurrentUser(payload: UpdateUserDto): Promise<User> {
    try {
      const res = await api(true).put("/users/me/edit", payload);
      const responseData = res.data;
      console.log("Updated user data:", responseData);

      // Extract user data from wrapper if it exists
      const userData =
        responseData.data && responseData.success
          ? responseData.data
          : responseData;

      // Update stored user data if successful
      if (userData) {
        await saveUser({
          id: userData.id?.toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
      }

      return userData;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update profile";
      throw new Error(message);
    }
  }

  static async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const res = await api(true).post("/auth/refresh");
      const responseData = res.data as RefreshTokenResponse;

      // Update stored tokens
      await setAuthToken({
        access: responseData.token,
        refresh: responseData.refresh_token,
      });

      return responseData;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Token refresh failed";
      throw new Error(message);
    }
  }

  // Send Verification Email
  static async sendVerificationEmail(email: string): Promise<ApiResponse> {
    try {
      const res = await api(false).post("/auth/send-verification", { email });
      const responseData = res.data;

      return responseData;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to send verification email";
      throw new Error(message);
    }
  }

  // Verify Account
  static async verifyAccount(payload: VerifyOtpDto): Promise<ApiResponse> {
    try {
      const res = await api(false).post("/auth/verify", payload);
      const responseData = res.data;

      Alert.alert(
        "Success",
        responseData.message || "Account verified successfully!"
      );
      return responseData;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Account verification failed";
      throw new Error(message);
    }
  }

  // Forgot Password
  static async forgotPassword(
    payload: ForgotPasswordDto
  ): Promise<ApiResponse> {
    try {
      const res = await api(false).post("/auth/forgot-password", payload);
      const responseData = res.data;

      Alert.alert(
        "Success",
        responseData.message || "Password reset code sent to your email."
      );
      return responseData;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to send password reset code";
      throw new Error(message);
    }
  }

  // Verify Reset Code
  static async verifyResetCode(
    payload: VerifyResetCodeDto
  ): Promise<ApiResponse> {
    try {
      const res = await api(false).post("/auth/verify-reset-code", payload);
      const responseData = res.data;

      Alert.alert(
        "Success",
        responseData.message || "Reset code verified successfully!"
      );
      return responseData;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Reset code verification failed";
      throw new Error(message);
    }
  }

  // Reset Password
  static async resetPassword(payload: ResetPasswordDto): Promise<ApiResponse> {
    try {
      const res = await api(false).post("/auth/reset-password", payload);
      const responseData = res.data;

      Alert.alert(
        "Success",
        responseData.message || "Password reset successful!"
      );
      return responseData;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Password reset failed";
      throw new Error(message);
    }
  }

  // Media Upload
  static async uploadFile(
    fileUri: string,
    fileName: string,
    mimeType: string
  ): Promise<UploadResponse> {
    try {
      console.log("Preparing upload for:", { fileUri, fileName, mimeType });

      // Ensure we have valid file information
      if (!fileUri) {
        throw new Error("File URI is required");
      }
      if (!fileName) {
        throw new Error("File name is required");
      }

      const formData = new FormData();

      // here since its react - native we need to properly format the file object
      const fileObject = {
        uri: fileUri,
        name: fileName,
        type: mimeType || "application/octet-stream",
      };

      console.log("File object for upload:", fileObject);
      formData.append("file", fileObject as any);

      console.log("Sending upload request to /media/upload");

      const res = await api(true).post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 second timeout for larger files
      });

      console.log("Upload response status:", res.status);
      console.log("Upload response data:", res.data);

      // Validate response structure
      if (!res.data) {
        throw new Error("Empty response from server");
      }

      return res.data;
    } catch (error) {
      console.error("Upload error:", error);
      const err = error as {
        response?: {
          data?: { error?: string; message?: string; status?: string };
          status?: number;
        };
        message?: string;
        code?: string;
      };

      // If we have a response, throw the error to be handled by the caller
      if (err.response) {
        console.error("Server error response:", {
          status: err.response.status,
          data: err.response.data,
        });
        throw error;
      }

      // Network or other error
      console.error("Network/other error:", err.message || err.code);
      return {
        status: "error",
        message:
          err.message || err.code || "Failed to upload file - network error",
      };
    }
  }

  // Rides API
  static async createRide(payload: CreateRideDto): Promise<Ride> {
    try {
      const res = await api(true).post("/rides", payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create ride";
      throw new Error(message);
    }
  }

  static async getRides(status?: RideStatus): Promise<Ride[]> {
    try {
      const url = status ? `/rides?status=${status}` : "/rides";
      const res = await api(true).get(url);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch rides";
      throw new Error(message);
    }
  }

  static async getRide(id: number): Promise<Ride> {
    try {
      const res = await api(true).get(`/rides/${id}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch ride";
      throw new Error(message);
    }
  }

  static async getRidesByRider(riderId: number): Promise<Ride[]> {
    try {
      const res = await api(true).get(`/rides/rider/${riderId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch rider rides";
      throw new Error(message);
    }
  }

  static async getRidesByDriver(driverId: number): Promise<Ride[]> {
    try {
      const res = await api(true).get(`/rides/driver/${driverId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch driver rides";
      throw new Error(message);
    }
  }

  static async acceptRide(rideId: number, vehicleId?: number): Promise<any> {
    try {
      const res = await api(true).post(`/rides/${rideId}/accept`, {
        vehicleId,
      });
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to accept ride";
      throw new Error(message);
    }
  }

  static async rejectRide(rideId: number): Promise<any> {
    try {
      const res = await api(true).post(`/rides/${rideId}/reject`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to reject ride";
      throw new Error(message);
    }
  }

  static async updateRide(id: number, payload: UpdateRideDto): Promise<Ride> {
    try {
      const res = await api(true).patch(`/rides/${id}`, payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update ride";
      throw new Error(message);
    }
  }

  static async cancelRide(id: number): Promise<Ride> {
    try {
      const res = await api(true).post(`/rides/${id}/cancel`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to cancel ride";
      throw new Error(message);
    }
  }

  // Vehicles API
  static async getVehicles(): Promise<Vehicle[]> {
    try {
      const res = await api(true).get("/vehicles");
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch vehicles";
      throw new Error(message);
    }
  }

  static async getVehicle(id: number): Promise<Vehicle> {
    try {
      const res = await api(true).get(`/vehicles/${id}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch vehicle";
      throw new Error(message);
    }
  }

  static async getVehiclesByDriver(driverId: number): Promise<Vehicle[]> {
    try {
      const res = await api(true).get(`/vehicles/driver/${driverId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch driver vehicles";
      throw new Error(message);
    }
  }

  // Notifications API
  static async getNotifications(): Promise<Notification[]> {
    try {
      const res = await api(true).get("/notifications");
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch notifications";
      throw new Error(message);
    }
  }

  static async getNotificationsByUser(userId: number): Promise<Notification[]> {
    try {
      const res = await api(true).get(`/notifications/user/${userId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch user notifications";
      throw new Error(message);
    }
  }

  static async getUnreadNotifications(userId: number): Promise<Notification[]> {
    try {
      const res = await api(true).get(`/notifications/user/${userId}/unread`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch unread notifications";
      throw new Error(message);
    }
  }

  static async markNotificationAsRead(id: number): Promise<Notification> {
    try {
      const res = await api(true).post(`/notifications/${id}/read`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to mark notification as read";
      throw new Error(message);
    }
  }

  static async markAllNotificationsAsRead(userId: number): Promise<ApiResponse> {
    try {
      const res = await api(true).post(`/notifications/user/${userId}/read-all`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to mark all notifications as read";
      throw new Error(message);
    }
  }

  static async createNotification(payload: CreateNotificationDto): Promise<Notification> {
    try {
      const res = await api(true).post("/notifications", payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create notification";
      throw new Error(message);
    }
  }

  static async updateNotification(id: number, payload: UpdateNotificationDto): Promise<Notification> {
    try {
      const res = await api(true).patch(`/notifications/${id}`, payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update notification";
      throw new Error(message);
    }
  }

  static async deleteNotification(id: number): Promise<void> {
    try {
      await api(true).delete(`/notifications/${id}`);
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to delete notification";
      throw new Error(message);
    }
  }

  // Payments API
  static async getPayments(): Promise<Payment[]> {
    try {
      const res = await api(true).get("/payments");
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch payments";
      throw new Error(message);
    }
  }

  static async getPaymentsByUser(userId: number): Promise<Payment[]> {
    try {
      const res = await api(true).get(`/payments/user/${userId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch user payments";
      throw new Error(message);
    }
  }

  static async getPaymentsByRide(rideId: number): Promise<Payment[]> {
    try {
      const res = await api(true).get(`/payments/ride/${rideId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch ride payments";
      throw new Error(message);
    }
  }

  static async createPayment(payload: CreatePaymentDto): Promise<Payment> {
    try {
      const res = await api(true).post("/payments", payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create payment";
      throw new Error(message);
    }
  }

  static async updatePayment(id: number, payload: UpdatePaymentDto): Promise<Payment> {
    try {
      const res = await api(true).patch(`/payments/${id}`, payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update payment";
      throw new Error(message);
    }
  }

  // Ratings API
  static async getRatings(): Promise<Rating[]> {
    try {
      const res = await api(true).get("/ratings");
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch ratings";
      throw new Error(message);
    }
  }

  static async getRatingsByUser(userId: number): Promise<Rating[]> {
    try {
      const res = await api(true).get(`/ratings/user/${userId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch user ratings";
      throw new Error(message);
    }
  }

  static async getAverageRating(userId: number): Promise<{ average: number; count: number }> {
    try {
      const res = await api(true).get(`/ratings/user/${userId}/average`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch average rating";
      throw new Error(message);
    }
  }

  static async getRatingsByRide(rideId: number): Promise<Rating[]> {
    try {
      const res = await api(true).get(`/ratings/ride/${rideId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch ride ratings";
      throw new Error(message);
    }
  }

  static async createRating(payload: CreateRatingDto): Promise<Rating> {
    try {
      const res = await api(true).post("/ratings", payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create rating";
      throw new Error(message);
    }
  }

  static async updateRating(id: number, payload: UpdateRatingDto): Promise<Rating> {
    try {
      const res = await api(true).patch(`/ratings/${id}`, payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update rating";
      throw new Error(message);
    }
  }

  // Additional helper methods
  // TODO: Backend doesn't have follow/follower functionality yet
  // This is a placeholder that returns default values
  static async getFollowStats(userId: number): Promise<{ followers_count: number; following_count: number }> {
    try {
      // This is a placeholder - the backend doesn't have this endpoint yet
      // Return default values for now
      return { followers_count: 0, following_count: 0 };
    } catch (error) {
      console.error("Failed to fetch follow stats:", error);
      return { followers_count: 0, following_count: 0 };
    }
  }

  static async getRideStatistics(userId: number): Promise<{
    totalRides: number;
    thisMonth: number;
    totalEarned: number;
    averageRating: number;
  }> {
    try {
      // Get all completed rides for the driver
      const rides = await Api.getRidesByDriver(userId);
      const completedRides = rides.filter((r) => r.status === RideStatus.COMPLETED);
      
      // Calculate this month's rides
      const now = new Date();
      const thisMonthRides = completedRides.filter((r) => {
        const rideDate = new Date(r.completedAt || r.createdAt);
        return rideDate.getMonth() === now.getMonth() && 
               rideDate.getFullYear() === now.getFullYear();
      });
      
      // Calculate total earned (for drivers)
      const totalEarned = completedRides.reduce((sum, r) => sum + (r.fare || 0), 0);
      
      // Get average rating
      const ratingData = await Api.getAverageRating(userId);
      
      return {
        totalRides: completedRides.length,
        thisMonth: thisMonthRides.length,
        totalEarned,
        averageRating: ratingData.average || 0,
      };
    } catch (error) {
      console.error("Failed to fetch ride statistics:", error);
      return {
        totalRides: 0,
        thisMonth: 0,
        totalEarned: 0,
        averageRating: 0,
      };
    }
  }
}

export default Api;
