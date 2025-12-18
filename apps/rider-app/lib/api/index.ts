import { Alert } from "react-native";

import {
  ApiResponse,
  AuthResponse,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenResponse,
  RegisterDto,
  ResetPasswordDto,
  UpdateUserDto,
  UploadResponse,
  User,
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
}

export default Api;
