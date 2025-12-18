import { useStorageState } from "./useStorageState";

const ONBOARDING_KEY = "user-onboarded";

export function useOnboardingState() {
  const [state, setState] = useStorageState(ONBOARDING_KEY);

  const isLoading = state[0];
  const isOnboarded = state[1] === "true";

  const setOnboarded = (onboarded: boolean) => {
    setState(onboarded ? "true" : "false");
  };

  const completeOnboarding = () => {
    setOnboarded(true);
  };

  const resetOnboarding = () => {
    setOnboarded(false);
  };

  return {
    isLoading,
    isOnboarded,
    setOnboarded,
    completeOnboarding,
    resetOnboarding,
  };
}
