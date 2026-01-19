import { useAuth } from "@/context/ctx";

/**
 * Custom hook for authentication operations
 * Provides simplified auth methods with better error handling
 */
export function useAuthOperations() {
  const auth = useAuth();

  const login = async (email: string, password: string) => {
    try {
      await auth.signIn({ email, password });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await auth.signUp({ email, password, name });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
      };
    }
  };

  const verifyAccount = async (email: string, otp: string) => {
    try {
      await auth.verifyAccount({ email, otp });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Verification failed",
      };
    }
  };

  const sendVerificationCode = async (email: string) => {
    try {
      await auth.sendVerificationEmail(email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send verification code",
      };
    }
  };

  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string
  ) => {
    try {
      await auth.resetPassword({ email, otp, new_password: newPassword });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Password reset failed",
      };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await auth.forgotPassword({ email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to request password reset",
      };
    }
  };

  const verifyResetCode = async (email: string, otp: string) => {
    try {
      await auth.verifyResetCode({ email, otp });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Reset code verification failed",
      };
    }
  };

  return {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,

    // Operations
    login,
    register,
    logout,
    verifyAccount,
    sendVerificationCode,
    resetPassword,
    requestPasswordReset,
    verifyResetCode,
  };
}
