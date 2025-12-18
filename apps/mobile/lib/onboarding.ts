import { setStorageItemAsync } from "../hooks/useStorageState";

const ONBOARDING_KEY = "user-onboarded";

/**
 * Utility functions for managing onboarding state without hooks
 * Useful for scenarios where hooks cannot be used (like in API calls)
 */
export const OnboardingStorage = {
  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    await setStorageItemAsync(ONBOARDING_KEY, "true");
  },

  /**
   * Reset onboarding status
   */
  async resetOnboarding(): Promise<void> {
    await setStorageItemAsync(ONBOARDING_KEY, "false");
  },

  /**
   * Clear onboarding data entirely
   */
  async clearOnboarding(): Promise<void> {
    await setStorageItemAsync(ONBOARDING_KEY, null);
  },
};
