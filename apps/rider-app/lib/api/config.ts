import { router } from "expo-router";

import axios from "axios";

import { BASE_URL } from "@/constants/constants";
import { isJwtExpired } from "@/lib/utils";

import { authToken, setAuthToken } from "./authToken";

const api = (authenticate: any) => {
  const config = axios.create({ baseURL: BASE_URL });
  config.defaults.headers.post["Content-Type"] = "application/json";

  if (authenticate) {
    config.interceptors.request.use(
      async (c) => {
        const token = await authToken("access");
        if (token) {
          // Check if token is expired
          if (isJwtExpired(token)) {
            // Try to refresh token
            const refreshed = await refreshAuthToken();
            if (refreshed) {
              c.headers.Authorization = "Bearer " + refreshed;
            } else {
              // Redirect to login if refresh fails
              router.replace("/login");
              return Promise.reject(
                new Error("Token expired and refresh failed")
              );
            }
          } else {
            c.headers.Authorization = "Bearer " + token;
          }
        }
        return c;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    config.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshed = await refreshAuthToken();
          if (refreshed) {
            originalRequest.headers.Authorization = "Bearer " + refreshed;
            return config(originalRequest);
          } else {
            router.replace("/login");
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  return config;
};

// Tracking ongoing refresh to prevent multiple simultaneous refresh calls
let refreshTokenPromise: Promise<string | null> | null = null;

async function refreshAuthToken(): Promise<string | null> {
  router.replace("/(auth)/login");
  // // Return existing refresh promise if one is already in progress
  // if (refreshTokenPromise) {
  //   return refreshTokenPromise;
  // }

  // refreshTokenPromise = performTokenRefresh();
  // const result = await refreshTokenPromise;
  // refreshTokenPromise = null; // Reset after completion

  // return result;
  return null;
}

async function performTokenRefresh(): Promise<string | null> {
  try {
    const refreshToken = await authToken("refresh");
    if (!refreshToken || isJwtExpired(refreshToken)) {
      console.warn("Refresh token is null or expired");
      return null;
    }

    console.log("Attempting to refresh token...");

    // Use the refresh token in Authorization header as per API spec
    const response = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const { token, refresh_token, refresh_token_expires_at } = response.data;

    // Store new tokens
    await setAuthToken({
      access: token,
      refresh: refresh_token,
    });

    console.log("Token refresh successful");
    return token;
  } catch (error) {
    console.error("Token refresh failed:", error);

    // Clear invalid tokens to prevent repeated failed attempts
    await setAuthToken({
      access: null,
      refresh: null,
    });

    return null;
  }
}

export default api;
