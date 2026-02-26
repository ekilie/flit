import axios from "axios";
import { BASE_URL } from "@/constants/constants";
import { isJwtExpired } from "@/lib/utils";
import { authToken, clearCache } from "./authToken";

const api = (authenticate: boolean) => {
  const config = axios.create({ baseURL: BASE_URL });
  config.defaults.headers.post["Content-Type"] = "application/json";

  if (authenticate) {
    config.interceptors.request.use(
      async (c) => {
        const token = authToken("access");
        if (token) {
          if (isJwtExpired(token)) {
            clearCache();
            window.location.href = "/login";
            return Promise.reject(new Error("Token expired"));
          } else {
            c.headers.Authorization = "Bearer " + token;
          }
        }
        return c;
      },
      (error) => Promise.reject(error)
    );

    config.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          clearCache();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  return config;
};

export default api;
