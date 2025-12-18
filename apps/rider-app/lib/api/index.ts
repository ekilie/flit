import { Alert } from "react-native";

import {
  AddCommentDto,
  ApiResponse,
  AuthResponse,
  CreatePostDto,
  CreateVoiceMemoDto,
  UpdateVoiceMemoDto,
  VoiceMemoListParams,
  PlayVoiceMemoDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  VoiceMemo,
  VoiceMemoCategory,
  VoiceMemoStats,
  ForgotPasswordDto,
  LoginDto,
  PlayPostDto,
  Post,
  PostComment,
  RefreshTokenResponse,
  RegisterDto,
  ResetPasswordDto,
  UpdatePostDto,
  UpdateUserDto,
  UploadResponse,
  User,
  UserInsights,
  VerifyOtpDto,
  VerifyResetCodeDto,
  AudioFeedResponse,
  // Podcast types
  Podcast,
  PodcastEpisode,
  PodcastFilters,
  PodcastProgressDto,
  CreatePodcastDto,
  UpdatePodcastDto,
  CreatePodcastEpisodeDto,
  // Audiobook types
  Audiobook,
  AudiobookChapter,
  AudiobookFilters,
  AudiobookProgressDto,
  AudiobookFavoriteDto,
  AudiobookDownloadDto,
  CreateAudiobookDto,
  UpdateAudiobookDto,
  CreateAudiobookChapterDto,
  // Follow System types
  FollowerUser,
  FollowersResponse,
  FollowingResponse,
  FollowStats,
  // Tag System types
  Tag,
  CreateTagDto,
  UpdateTagDto,
  AddTagsToPostDto,
  RemoveTagsFromPostDto,
  ReplacePostTagsDto,
  // Search types
  SearchFilters,
  SearchResult,
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

  // 5. Send Verification Email
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

  // 6. Verify Account
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

  // 7. Forgot Password
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

  // 8. Verify Reset Code
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

  // 9. Reset Password
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

  // Post Methods
  static async createPost(payload: CreatePostDto): Promise<Post> {
    try {
      const res = await api(true).post("/posts", payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create post";
      throw new Error(message);
    }
  }

  static async updatePost(id: number, payload: UpdatePostDto): Promise<Post> {
    try {
      const res = await api(true).put(`/posts/${id}`, payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update post";
      throw new Error(message);
    }
  }

  static async deletePost(id: number): Promise<ApiResponse> {
    try {
      const res = await api(true).delete(`/posts/${id}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to delete post";
      throw new Error(message);
    }
  }

  static async getPosts(params?: {
    limit?: number;
    offset?: number;
    sort?: string;
    user_id?: number;
    search?: string;
  }): Promise<Post[]> {
    try {
      const requestParams = {
        limit: 20,
        offset: 0,
        ...params,
      };
      const res = await api(true).get("/posts", { params: requestParams });
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch posts";
      throw new Error(message);
    }
  }

  static async getAudioFeed(params?: {
    limit?: number;
    last_id?: number;
  }): Promise<AudioFeedResponse> {
    try {
      const requestParams: { limit?: number; last_id?: number } = {
        limit: params?.limit ?? 20,
      };

      if (params?.last_id) {
        requestParams.last_id = params.last_id;
      }

      const res = await api(false).get("/posts/audio/feed", {
        params: requestParams,
      });
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch audio feed";
      throw new Error(message);
    }
  }

  static async getPost(id: number): Promise<Post> {
    try {
      const res = await api(true).get(`/posts/${id}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch post";
      throw new Error(message);
    }
  }

  // Additional Post Endpoints
  static async getTrendingPosts(): Promise<Post[]> {
    try {
      const res = await api(true).get("/posts/trending");
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch trending posts";
      throw new Error(message);
    }
  }

  static async getRecentPosts(): Promise<Post[]> {
    try {
      const res = await api(false).get("/posts/recent");
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch recent posts";
      throw new Error(message);
    }
  }

  static async getPostsByUser(userId: number): Promise<Post[]> {
    try {
      const res = await api(false).get(`/posts/user/${userId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch user posts";
      throw new Error(message);
    }
  }

  static async getPostStats(id: number): Promise<{
    post_id: number;
    like_count: number;
    comment_count: number;
    play_count: number;
    total_duration_played: number;
    unique_listeners: number;
  }> {
    try {
      const res = await api(false).get(`/posts/${id}/stats`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch post stats";
      throw new Error(message);
    }
  }

  static async searchPosts(
    query: string,
    limit = 20,
    offset = 0
  ): Promise<Post[]> {
    try {
      const res = await api(false).get("/search/posts", {
        params: { query, limit, offset },
      });
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to search posts";
      throw new Error(message);
    }
  }

  // Post Interactions
  static async addComment(
    postId: number,
    payload: AddCommentDto
  ): Promise<PostComment> {
    try {
      const res = await api(true).post(`/posts/${postId}/comments`, payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to add comment";
      throw new Error(message);
    }
  }

  static async likePost(postId: number): Promise<ApiResponse> {
    try {
      const res = await api(true).post(`/posts/${postId}/like`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to like post";
      throw new Error(message);
    }
  }

  static async playPost(
    postId: number,
    payload: PlayPostDto
  ): Promise<ApiResponse> {
    try {
      const res = await api(true).post(`/posts/${postId}/play`, payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to record play";
      throw new Error(message);
    }
  }

  // User Insights
  static async getUserInsights(): Promise<UserInsights> {
    try {
      const res = await api(true).get("/posts");
      const posts: Post[] = res.data;

      const totalPosts = posts.length;
      const totalPlays = posts.reduce((sum, post) => sum + post.play_count, 0);
      const totalLikes = posts.reduce((sum, post) => sum + post.like_count, 0);
      const totalComments = posts.reduce(
        (sum, post) => sum + post.comment_count,
        0
      );

      const sortedPosts = posts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const recentPosts = sortedPosts.slice(0, 5);

      // Get top posts by play count
      const topPosts = [...posts]
        .sort((a, b) => b.play_count - a.play_count)
        .slice(0, 5);

      const averagePlaysPerPost = totalPosts > 0 ? totalPlays / totalPosts : 0;
      const averageLikesPerPost = totalPosts > 0 ? totalLikes / totalPosts : 0;
      const averageCommentsPerPost =
        totalPosts > 0 ? totalComments / totalPosts : 0;

      const monthlyStats = [
        { month: "August", posts: 0, plays: 0, likes: 0, comments: 0 },
        { month: "September", posts: 0, plays: 0, likes: 0, comments: 0 },
        {
          month: "October",
          posts: totalPosts,
          plays: totalPlays,
          likes: totalLikes,
          comments: totalComments,
        },
      ];

      return {
        total_posts: totalPosts,
        total_plays: totalPlays,
        total_likes: totalLikes,
        total_comments: totalComments,
        total_listening_time: posts.reduce(
          (sum, post) => sum + (post.duration || 0),
          0
        ),
        recent_posts: recentPosts,
        top_posts: topPosts,
        engagement_stats: {
          average_plays_per_post: averagePlaysPerPost,
          average_likes_per_post: averageLikesPerPost,
          average_comments_per_post: averageCommentsPerPost,
        },
        monthly_stats: monthlyStats,
      };
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch insights";
      throw new Error(message);
    }
  }

  static async getUserPosts(): Promise<Post[]> {
    try {
      const res = await api(true).get("/users/posts");
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch user posts";
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

  // Voice Memo Methods
  static async createVoiceMemo(
    payload: CreateVoiceMemoDto
  ): Promise<VoiceMemo> {
    try {
      const res = await api(true).post("/voice-memos", payload);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create voice memo";
      throw new Error(message);
    }
  }

  static async getVoiceMemos(
    params?: VoiceMemoListParams
  ): Promise<VoiceMemo[]> {
    try {
      const requestParams = {
        limit: 20,
        offset: 0,
        ...params,
      };
      const res = await api(true).get("/voice-memos", {
        params: requestParams,
      });
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch voice memos";
      throw new Error(message);
    }
  }

  static async getVoiceMemo(id: number): Promise<VoiceMemo> {
    try {
      const res = await api(true).get(`/voice-memos/${id}`);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch voice memo";
      throw new Error(message);
    }
  }

  static async updateVoiceMemo(
    id: number,
    payload: UpdateVoiceMemoDto
  ): Promise<VoiceMemo> {
    try {
      const res = await api(true).put(`/voice-memos/${id}`, payload);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update voice memo";
      throw new Error(message);
    }
  }

  static async deleteVoiceMemo(id: number): Promise<void> {
    try {
      await api(true).delete(`/voice-memos/${id}`);
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to delete voice memo";
      throw new Error(message);
    }
  }

  static async playVoiceMemo(id: number, duration: number): Promise<void> {
    try {
      await api(true).post(`/voice-memos/${id}/play`, { duration });
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to record play";
      throw new Error(message);
    }
  }

  static async toggleVoiceMemoFavorite(id: number): Promise<VoiceMemo> {
    try {
      const res = await api(true).post(`/voice-memos/${id}/favorite`);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to toggle favorite";
      throw new Error(message);
    }
  }

  static async getVoiceMemosByCategory(
    category: string,
    params?: { limit?: number; offset?: number }
  ): Promise<VoiceMemo[]> {
    try {
      const requestParams = {
        limit: 20, // Default limit
        offset: 0, // Default offset
        ...params, // Override with provided params
      };
      const res = await api(true).get(`/voice-memos/category/${category}`, {
        params: requestParams,
      });
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch voice memos by category";
      throw new Error(message);
    }
  }

  static async getFavoriteVoiceMemos(params?: {
    limit?: number;
    offset?: number;
  }): Promise<VoiceMemo[]> {
    try {
      const res = await api(true).get("/voice-memos/favorites", { params });
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch favorite voice memos";
      throw new Error(message);
    }
  }

  static async searchVoiceMemos(
    query: string,
    params?: { limit?: number; offset?: number }
  ): Promise<VoiceMemo[]> {
    try {
      const res = await api(true).get("/voice-memos/search", {
        params: { q: query, ...params },
      });
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to search voice memos";
      throw new Error(message);
    }
  }

  static async getVoiceMemoStats(): Promise<VoiceMemoStats> {
    try {
      const res = await api(true).get("/voice-memos/stats");
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch voice memo stats";
      throw new Error(message);
    }
  }

  // Voice Memo Category Methods
  static async getVoiceMemoCategories(): Promise<VoiceMemoCategory[]> {
    try {
      const res = await api(true).get("/voice-memo-categories");
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch categories";
      throw new Error(message);
    }
  }

  static async createVoiceMemoCategory(
    payload: CreateCategoryDto
  ): Promise<VoiceMemoCategory> {
    try {
      const res = await api(true).post("/voice-memo-categories", payload);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create category";
      throw new Error(message);
    }
  }

  static async updateVoiceMemoCategory(
    id: number,
    payload: UpdateCategoryDto
  ): Promise<VoiceMemoCategory> {
    try {
      const res = await api(true).put(`/voice-memo-categories/${id}`, payload);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update category";
      throw new Error(message);
    }
  }

  static async deleteVoiceMemoCategory(id: number): Promise<void> {
    try {
      await api(true).delete(`/voice-memo-categories/${id}`);
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to delete category";
      throw new Error(message);
    }
  }

  // ========== PODCAST METHODS ==========

  /**
   * Get all podcasts with optional filters
   */
  static async getPodcasts(filters?: PodcastFilters): Promise<{
    data: Podcast[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.genre) params.append("genre", filters.genre);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sort) params.append("sort", filters.sort);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api(false).get(`/podcasts${queryString}`);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch podcasts";
      throw new Error(message);
    }
  }

  /**
   * Get trending podcasts
   */
  static async getTrendingPodcasts(): Promise<Podcast[]> {
    try {
      const res = await api(false).get("/podcasts/trending");
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch trending podcasts";
      throw new Error(message);
    }
  }

  /**
   * Get a specific podcast by ID
   */
  static async getPodcast(id: string): Promise<Podcast> {
    try {
      const res = await api(true).get(`/podcasts/${id}`);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch podcast";
      throw new Error(message);
    }
  }

  /**
   * Get episodes for a specific podcast
   */
  static async getPodcastEpisodes(
    id: string,
    page?: number,
    limit?: number
  ): Promise<{
    data: PodcastEpisode[];
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api(false).get(
        `/podcasts/${id}/episodes${queryString}`
      );
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch podcast episodes";
      throw new Error(message);
    }
  }

  /**
   * Subscribe to a podcast
   */
  static async subscribeToPodcast(id: string): Promise<{ message: string }> {
    try {
      const res = await api(true).post(`/podcasts/${id}/subscribe`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to subscribe to podcast";
      throw new Error(message);
    }
  }

  /**
   * Unsubscribe from a podcast
   */
  static async unsubscribeFromPodcast(
    id: string
  ): Promise<{ message: string }> {
    try {
      const res = await api(true).delete(`/podcasts/${id}/subscribe`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to unsubscribe from podcast";
      throw new Error(message);
    }
  }

  /**
   * Get user's podcast subscriptions
   */
  static async getUserPodcastSubscriptions(): Promise<Podcast[]> {
    try {
      const res = await api(true).get("/user/podcasts/subscriptions");
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch podcast subscriptions";
      throw new Error(message);
    }
  }

  /**
   * Update podcast progress
   */
  static async updatePodcastProgress(
    payload: PodcastProgressDto
  ): Promise<{ message: string }> {
    try {
      const res = await api(true).put("/podcasts/progress", payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update podcast progress";
      throw new Error(message);
    }
  }

  /**
   * Get recent episodes from subscribed podcasts
   */
  static async getRecentPodcastEpisodes(): Promise<PodcastEpisode[]> {
    try {
      const res = await api(true).get("/podcasts/episodes/recent");
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch recent episodes";
      throw new Error(message);
    }
  }

  // ========== AUDIOBOOK METHODS ==========

  /**
   * Get all audiobooks with optional filters
   */
  static async getAudiobooks(filters?: AudiobookFilters): Promise<{
    data: Audiobook[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.genre) params.append("genre", filters.genre);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sort) params.append("sort", filters.sort);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api(false).get(`/audiobooks${queryString}`);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch audiobooks";
      throw new Error(message);
    }
  }

  /**
   * Get audiobook recommendations
   */
  static async getAudiobookRecommendations(): Promise<Audiobook[]> {
    try {
      const res = await api(true).get("/audiobooks/recommendations");
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch audiobook recommendations";
      throw new Error(message);
    }
  }

  /**
   * Get a specific audiobook by ID
   */
  static async getAudiobook(id: string): Promise<Audiobook> {
    try {
      const res = await api(true).get(`/audiobooks/${id}`);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch audiobook";
      throw new Error(message);
    }
  }

  /**
   * Get chapters for a specific audiobook
   */
  static async getAudiobookChapters(id: string): Promise<AudiobookChapter[]> {
    try {
      const res = await api(false).get(`/audiobooks/${id}/chapters`);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch audiobook chapters";
      throw new Error(message);
    }
  }

  /**
   * Update audiobook progress
   */
  static async updateAudiobookProgress(
    id: string,
    payload: Omit<AudiobookProgressDto, "audiobook_id">
  ): Promise<{ message: string }> {
    try {
      const res = await api(true).put(`/audiobooks/${id}/progress`, payload);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update audiobook progress";
      throw new Error(message);
    }
  }

  /**
   * Toggle audiobook favorite status
   */
  static async toggleAudiobookFavorite(
    id: string,
    isFavorite: boolean
  ): Promise<{ message: string }> {
    try {
      const res = await api(true).put(`/audiobooks/${id}/favorite`, {
        is_favorite: isFavorite,
      });
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update favorite status";
      throw new Error(message);
    }
  }

  /**
   * Toggle audiobook download status
   */
  static async toggleAudiobookDownload(
    id: string,
    isDownloaded: boolean
  ): Promise<{ message: string }> {
    try {
      const res = await api(true).put(`/audiobooks/${id}/download`, {
        is_downloaded: isDownloaded,
      });
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update download status";
      throw new Error(message);
    }
  }

  /**
   * Get user's audiobook library
   */
  static async getUserAudiobookLibrary(
    filters?: AudiobookFilters
  ): Promise<Audiobook[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.genre) params.append("genre", filters.genre);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sort) params.append("sort", filters.sort);

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api(true).get(`/user/audiobooks/library${queryString}`);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch audiobook library";
      throw new Error(message);
    }
  }

  /**
   * Get user's favorite audiobooks
   */
  static async getUserFavoriteAudiobooks(): Promise<Audiobook[]> {
    try {
      const res = await api(true).get("/user/audiobooks/favorites");
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch favorite audiobooks";
      throw new Error(message);
    }
  }

  /**
   * Get audiobooks to continue reading
   */
  static async getContinueReadingAudiobooks(): Promise<Audiobook[]> {
    try {
      const res = await api(true).get("/user/audiobooks/continue-reading");
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch continue reading audiobooks";
      throw new Error(message);
    }
  }

  // ========== ADMIN PODCAST METHODS ==========

  /**
   * Create a new podcast (Admin only)
   */
  static async createPodcast(payload: CreatePodcastDto): Promise<Podcast> {
    try {
      const res = await api(true).post("/admin/podcasts", payload);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create podcast";
      throw new Error(message);
    }
  }

  /**
   * Update a podcast (Admin only)
   */
  static async updatePodcast(
    id: string,
    payload: UpdatePodcastDto
  ): Promise<Podcast> {
    try {
      const res = await api(true).put(`/admin/podcasts/${id}`, payload);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update podcast";
      throw new Error(message);
    }
  }

  /**
   * Delete a podcast (Admin only)
   */
  static async deletePodcast(id: string): Promise<{ message: string }> {
    try {
      const res = await api(true).delete(`/admin/podcasts/${id}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to delete podcast";
      throw new Error(message);
    }
  }

  /**
   * Create a new podcast episode (Admin only)
   */
  static async createPodcastEpisode(
    payload: CreatePodcastEpisodeDto
  ): Promise<PodcastEpisode> {
    try {
      const res = await api(true).post("/admin/podcasts/episodes", payload);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create podcast episode";
      throw new Error(message);
    }
  }

  // ========== ADMIN AUDIOBOOK METHODS ==========

  /**
   * Create a new audiobook (Admin only)
   */
  static async createAudiobook(
    payload: CreateAudiobookDto
  ): Promise<Audiobook> {
    try {
      const res = await api(true).post("/admin/audiobooks", payload);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create audiobook";
      throw new Error(message);
    }
  }

  /**
   * Update an audiobook (Admin only)
   */
  static async updateAudiobook(
    id: string,
    payload: UpdateAudiobookDto
  ): Promise<Audiobook> {
    try {
      const res = await api(true).put(`/admin/audiobooks/${id}`, payload);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update audiobook";
      throw new Error(message);
    }
  }

  /**
   * Delete an audiobook (Admin only)
   */
  static async deleteAudiobook(id: string): Promise<{ message: string }> {
    try {
      const res = await api(true).delete(`/admin/audiobooks/${id}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to delete audiobook";
      throw new Error(message);
    }
  }

  /**
   * Create a new audiobook chapter (Admin only)
   */
  static async createAudiobookChapter(
    payload: CreateAudiobookChapterDto
  ): Promise<AudiobookChapter> {
    try {
      const res = await api(true).post("/admin/audiobooks/chapters", payload);
      return res.data.data || res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create audiobook chapter";
      throw new Error(message);
    }
  }

  // ========== FOLLOW SYSTEM METHODS ==========

  /**
   * Follow a user
   */
  static async followUser(userId: string): Promise<ApiResponse> {
    try {
      const res = await api(true).post(`/users/${userId}/follow`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to follow user";
      throw new Error(message);
    }
  }

  /**
   * Unfollow a user
   */
  static async unfollowUser(userId: string): Promise<ApiResponse> {
    try {
      const res = await api(true).delete(`/users/${userId}/follow`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to unfollow user";
      throw new Error(message);
    }
  }

  /**
   * Get user's followers
   */
  static async getFollowers(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<FollowersResponse> {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api(true).get(`/users/${userId}/followers${queryString}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch followers";
      throw new Error(message);
    }
  }

  /**
   * Get users that a user follows
   */
  static async getFollowing(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<FollowingResponse> {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api(true).get(`/users/${userId}/following${queryString}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch following";
      throw new Error(message);
    }
  }

  /**
   * Check if current user follows specified user
   */
  static async isFollowing(userId: string): Promise<boolean> {
    try {
      const res = await api(true).get(`/users/${userId}/follow/check`);
      return res.data.is_following || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get follower/following counts
   */
  static async getFollowStats(userId: string): Promise<FollowStats> {
    try {
      const res = await api(true).get(`/users/${userId}/follow/stats`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch follow stats";
      throw new Error(message);
    }
  }

  /**
   * Mute a user without unfollowing
   */
  static async muteUser(userId: string): Promise<ApiResponse> {
    try {
      const res = await api(true).post(`/users/${userId}/mute`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to mute user";
      throw new Error(message);
    }
  }

  /**
   * Unmute a previously muted user
   */
  static async unmuteUser(userId: string): Promise<ApiResponse> {
    try {
      const res = await api(true).delete(`/users/${userId}/mute`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to unmute user";
      throw new Error(message);
    }
  }

  /**
   * Block a user
   */
  static async blockUser(userId: string): Promise<ApiResponse> {
    try {
      const res = await api(true).post(`/users/${userId}/block`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to block user";
      throw new Error(message);
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(userId: string): Promise<ApiResponse> {
    try {
      const res = await api(true).delete(`/users/${userId}/block`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to unblock user";
      throw new Error(message);
    }
  }

  // ========== TAG SYSTEM METHODS ==========

  /**
   * Create a new tag
   */
  static async createTag(data: CreateTagDto): Promise<Tag> {
    try {
      const res = await api(true).post("/tags", data);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create tag";
      throw new Error(message);
    }
  }

  /**
   * List all tags with pagination
   */
  static async getTags(page?: number, limit?: number): Promise<Tag[]> {
    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api(true).get(`/tags${queryString}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch tags";
      throw new Error(message);
    }
  }

  /**
   * Get single tag details
   */
  static async getTag(tagId: string): Promise<Tag> {
    try {
      const res = await api(true).get(`/tags/${tagId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch tag";
      throw new Error(message);
    }
  }

  /**
   * Update tag properties
   */
  static async updateTag(tagId: string, data: UpdateTagDto): Promise<Tag> {
    try {
      const res = await api(true).put(`/tags/${tagId}`, data);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to update tag";
      throw new Error(message);
    }
  }

  /**
   * Delete tag
   */
  static async deleteTag(tagId: string): Promise<ApiResponse> {
    try {
      const res = await api(true).delete(`/tags/${tagId}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to delete tag";
      throw new Error(message);
    }
  }

  /**
   * Search tags by name
   */
  static async searchTags(query: string): Promise<Tag[]> {
    try {
      const res = await api(true).get(`/tags/search?query=${encodeURIComponent(query)}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to search tags";
      throw new Error(message);
    }
  }

  /**
   * Get most used tags
   */
  static async getPopularTags(limit?: number): Promise<Tag[]> {
    try {
      const queryString = limit ? `?limit=${limit}` : "";
      const res = await api(true).get(`/tags/popular${queryString}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch popular tags";
      throw new Error(message);
    }
  }

  /**
   * Get all tags associated with a post
   */
  static async getPostTags(postId: string): Promise<Tag[]> {
    try {
      const res = await api(true).get(`/posts/${postId}/tags`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to fetch post tags";
      throw new Error(message);
    }
  }

  /**
   * Add tags to existing post
   */
  static async addTagsToPost(postId: string, data: AddTagsToPostDto): Promise<ApiResponse> {
    try {
      const res = await api(true).post(`/posts/${postId}/tags`, data);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to add tags to post";
      throw new Error(message);
    }
  }

  /**
   * Remove specific tags from post
   */
  static async removeTagsFromPost(postId: string, data: RemoveTagsFromPostDto): Promise<ApiResponse> {
    try {
      const res = await api(true).delete(`/posts/${postId}/tags`, { data });
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to remove tags from post";
      throw new Error(message);
    }
  }

  /**
   * Replace all post tags at once
   */
  static async replacePostTags(postId: string, data: ReplacePostTagsDto): Promise<ApiResponse> {
    try {
      const res = await api(true).put(`/posts/${postId}/tags`, data);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to replace post tags";
      throw new Error(message);
    }
  }

  // ========== SEARCH METHODS ==========

  /**
   * Universal search across all content types
   */
  static async unifiedSearch(filters: SearchFilters): Promise<SearchResult[]> {
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append("query", filters.query);
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.tags) params.append("tags", filters.tags.join(","));
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api(true).get(`/search${queryString}`);
      return res.data;
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to perform search";
      throw new Error(message);
    }
  }

  /**
   * Alias for getCurrentUser for better readability
   */
  static async getMe(): Promise<any> {
    return this.getCurrentUser();
  }
}

export default Api;
