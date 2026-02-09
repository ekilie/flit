export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
  clear: async (): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  },
};

export const authToken = async (tokenType: string) => {
  //TODO:Will add custom token prefixing mechanism
  const _key = `ekili-flit:${tokenType}-token`;
  return (await storage.getItem(_key)) || null;
};

export const setAuthToken = async (tokens: {
  [key: string]: string | null;
}) => {
  try {
    for (const [key, value] of Object.entries(tokens)) {
      if (value !== null) {
        await storage.setItem(`ekili-flit:${key}-token`, value);
      } else {
        // Remove token if value is null
        await storage.removeItem(`ekili-flit:${key}-token`);
      }
    }
  } catch (error) {
    console.error("Error saving auth tokens:", error);
    throw error;
  }
};

export const saveUser = async (user: CurrentUser) => {
  await storage.setItem("ekili-flit:user", JSON.stringify(user));
};

export const saveUserData = async (user: any) => {
  await storage.setItem("ekili-flit:user-data", JSON.stringify(user));
};

export const currentUser = async (): Promise<CurrentUser | null> => {
  const user = await storage.getItem("ekili-flit:user");
  return user ? JSON.parse(user) : null;
};

export const userData = async () => {
  const user = await storage.getItem("ekili-flit:user-data");
  return user ? JSON.parse(user) : null;
};

export const userLocation = async () => {
  const user = await storage.getItem("ekili-flit:user-data");
  return user ? JSON.parse(user).userInfo.location : null;
};

export const isLoggedIn = async () => {
  const user = await currentUser();
  return user !== null && user.name !== null;
};

export const clearCache = async () => {
  await storage.clear();
};

/**
 * Check if user has valid authentication tokens
 * @returns Promise<boolean> - true if user has valid access or refresh token
 */
export const hasValidTokens = async (): Promise<boolean> => {
  try {
    const accessToken = await authToken("access");
    const refreshToken = await authToken("refresh");

    // Import isJwtExpired locally to avoid circular dependencies
    const { isJwtExpired } = await import("@/lib/utils");

    // Check if we have at least one valid token
    const hasValidAccess = !!(accessToken && !isJwtExpired(accessToken));
    const hasValidRefresh = !!(refreshToken && !isJwtExpired(refreshToken));

    return hasValidAccess || hasValidRefresh;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

/**
 * Get token expiration info for debugging/monitoring
 * @returns Promise<object> - token expiration details
 */
export const getTokenExpirationInfo = async () => {
  try {
    const accessToken = await authToken("access");
    const refreshToken = await authToken("refresh");

    const { isJwtExpired } = await import("@/lib/utils");

    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenExpired: accessToken ? isJwtExpired(accessToken) : null,
      refreshTokenExpired: refreshToken ? isJwtExpired(refreshToken) : null,
    };
  } catch (error) {
    console.error("Error getting token expiration info:", error);
    return null;
  }
};

export const storeNotificationPayload = async (
  callUUID: string,
  payload: any
) => {
  try {
    await storage.setItem(`notification_${callUUID}`, JSON.stringify(payload));
  } catch (error) {
    console.error("Error storing notification payload:", error);
  }
};

export const retrieveStoredNotificationPayload = async (callUUID: string) => {
  try {
    const storedPayload = await storage.getItem(`notification_${callUUID}`);
    if (storedPayload) {
      await storage.removeItem(`notification_${callUUID}`);
      return JSON.parse(storedPayload);
    }
    return null;
  } catch (error) {
    console.error("Error retrieving stored notification payload:", error);
    return null;
  }
};
