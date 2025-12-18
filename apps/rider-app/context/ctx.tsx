import { router } from "expo-router";
import {
  createContext,
  type PropsWithChildren,
  use,
  useEffect,
  useState,
} from "react";

import { useOnboardingState } from "../hooks/useOnboardingState";
import { useStorageState } from "../hooks/useStorageState";

import Api from "../lib/api";
import { currentUser, isLoggedIn } from "../lib/api/authToken";
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  User,
  VerifyOtpDto,
  VerifyResetCodeDto,
} from "../lib/api/types";

interface AuthContextType {
  // Auth state
  user: User | null;
  session: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Onboarding state
  isOnboarded: boolean;
  isOnboardingLoading: boolean;
  completeOnboarding: () => void;

  // Auth actions
  signIn: (credentials: LoginDto) => Promise<void>;
  signUp: (credentials: RegisterDto) => Promise<void>;
  signOut: () => Promise<void>;

  // Account verification
  sendVerificationEmail: (email: string) => Promise<void>;
  verifyAccount: (payload: VerifyOtpDto) => Promise<void>;

  // Password reset
  forgotPassword: (payload: ForgotPasswordDto) => Promise<void>;
  verifyResetCode: (payload: VerifyResetCodeDto) => Promise<void>;
  resetPassword: (payload: ResetPasswordDto) => Promise<void>;

  // Utility
  refreshUserData: () => Promise<void>;
  
  // Development helper
  signInWithDummyUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  isOnboarded: false,
  isOnboardingLoading: false,
  completeOnboarding: () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  sendVerificationEmail: async () => {},
  verifyAccount: async () => {},
  forgotPassword: async () => {},
  verifyResetCode: async () => {},
  resetPassword: async () => {},
  refreshUserData: async () => {},
  signInWithDummyUser: () => {},
});

// Use this hook to access the user info.
export function useAuth() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error("useAuth must be wrapped in a <SessionProvider />");
  }

  return value;
}

// For backward compatibility
export const useSession = useAuth;

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isStorageLoading, session], setSession] = useStorageState("session");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper to clear all auth state
  const clearAuthState = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSession(null);
  };

  // Onboarding state
  const {
    isLoading: isOnboardingLoading,
    isOnboarded,
    completeOnboarding: setOnboardingComplete,
    resetOnboarding,
  } = useOnboardingState();

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const loggedIn = await isLoggedIn();
      const userData = await currentUser();

      if (loggedIn && userData) {
        setUser(userData as any);
        setIsAuthenticated(true);
        setSession("authenticated");
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setSession(null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (credentials: LoginDto) => {
    try {
      setIsLoading(true);
      const response = await Api.login(credentials);

      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        setSession("authenticated");

        // Complete onboarding on successful login
        setOnboardingComplete();

        // Navigate to main app
        router.replace("/");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (credentials: RegisterDto) => {
    try {
      setIsLoading(true);
      const response = await Api.register(credentials);

      if (response.user) {
        setUser(response.user);
        // Don't set as authenticated until account is verified
        setIsAuthenticated(false);
        setSession(null);

        // Complete onboarding on successful registration
        setOnboardingComplete();
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await Api.logout();
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      // Clear all auth state and session
      clearAuthState();
      setIsLoading(false);

      // Reset onboarding when user signs out
      resetOnboarding();

      // Navigate to auth screen
      router.replace("/login");
    }
  };

  const sendVerificationEmail = async (email: string) => {
    await Api.sendVerificationEmail(email);
  };

  const verifyAccount = async (payload: VerifyOtpDto) => {
    try {
      setIsLoading(true);
      await Api.verifyAccount(payload);

      // After verification, user might need to sign in again
      // or i could automatically sign them in
      await refreshUserData();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (payload: ForgotPasswordDto) => {
    await Api.forgotPassword(payload);
  };

  const verifyResetCode = async (payload: VerifyResetCodeDto) => {
    await Api.verifyResetCode(payload);
  };

  const resetPassword = async (payload: ResetPasswordDto) => {
    try {
      await Api.resetPassword(payload);

      // After successful password reset, navigate to sign in
      router.replace("/login");
    } catch (error) {
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      const userData = await currentUser();
      if (userData) {
        setUser(userData as any);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const signInWithDummyUser = () => {
    // Create a dummy user object
    const now = new Date().toISOString();
    const dummyUser: User = {
      id: 1,
      name: "Demo User",
      email: "demo@flit.com",
      display_name: "Demo User",
      role: "rider",
      is_active: true,
      created_at: now,
      updated_at: now,
      metadata: {
        id: 1,
        created_at: now,
        updated_at: now,
        user_id: 1,
        total_listens: 0,
        total_likes: 0,
        total_uploads: 0,
      },
    };

    setUser(dummyUser);
    setIsAuthenticated(true);
    setSession("authenticated");
    setOnboardingComplete();
    
    // Navigate to main app
    router.replace("/");
  };

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading: isLoading || isStorageLoading,
    isAuthenticated,
    isOnboarded,
    isOnboardingLoading,
    completeOnboarding: setOnboardingComplete,
    signIn,
    signUp,
    signOut,
    sendVerificationEmail,
    verifyAccount,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    refreshUserData,
    signInWithDummyUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
