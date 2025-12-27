import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type NotificationFrequency = "never" | "low" | "medium" | "high";

interface SettingsState {
  themeMode: "light" | "dark" | "system";
  themeEnabled: false; // Always false for now

  // Ride Preferences
  defaultVehicleType: "economy" | "comfort" | "premium" | "xl";
  autoConfirmPickup: boolean;
  showDriverDetails: boolean;

  // Interaction settings
  hapticsEnabled: boolean;
  soundEffectsEnabled: boolean;

  // Privacy settings
  shareAnalytics: boolean;
  allowLocationAccess: boolean;
  saveRideHistory: boolean;

  // Notification settings
  pushNotificationsEnabled: boolean;
  notificationFrequency: NotificationFrequency;
  notifyOnDriverArrival: boolean;
  notifyOnRideUpdates: boolean;
  notifyOnPromotions: boolean;

  // Safety & Security
  emergencyContactsEnabled: boolean;
  shareTripStatus: boolean;

  // Performance settings
  dataSaverMode: boolean;
  preloadContent: boolean;

  // Accessibility settings
  reduceMotion: boolean;

  // Actions
  updateSetting: <
    T extends keyof Omit<
      SettingsState,
      "updateSetting" | "resetToDefaults" | "exportSettings" | "importSettings"
    >
  >(
    key: T,
    value: SettingsState[T]
  ) => void;
  resetToDefaults: () => void;
  exportSettings: () => Promise<string>;
  importSettings: (settings: string) => Promise<void>;
}

const defaultSettings: Omit<
  SettingsState,
  "updateSetting" | "resetToDefaults" | "exportSettings" | "importSettings"
> = {
  // Theme settings
  themeMode: "light",
  themeEnabled: false,

  // Ride Preferences
  defaultVehicleType: "economy",
  autoConfirmPickup: false,
  showDriverDetails: true,

  // Interaction settings
  hapticsEnabled: true,
  soundEffectsEnabled: true,

  // Privacy settings
  shareAnalytics: true,
  allowLocationAccess: true,
  saveRideHistory: true,

  // Notification settings
  pushNotificationsEnabled: true,
  notificationFrequency: "medium",
  notifyOnDriverArrival: true,
  notifyOnRideUpdates: true,
  notifyOnPromotions: false,

  // Safety & Security
  emergencyContactsEnabled: false,
  shareTripStatus: false,

  // Performance settings
  dataSaverMode: false,
  preloadContent: true,

  // Accessibility settings
  reduceMotion: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      updateSetting: (key, value) => {
        set((state) => ({
          ...state,
          [key]: value,
        }));
      },

      resetToDefaults: () => {
        set(defaultSettings);
      },

      exportSettings: async () => {
        const currentSettings = get();
        const {
          updateSetting,
          resetToDefaults,
          exportSettings,
          importSettings,
          ...settingsToExport
        } = currentSettings;

        return JSON.stringify(settingsToExport, null, 2);
      },

      importSettings: async (settingsString: string) => {
        try {
          const importedSettings = JSON.parse(settingsString);
          // Validate and merge with current settings
          const validatedSettings = { ...defaultSettings, ...importedSettings };
          set(validatedSettings);
        } catch (error) {
          throw new Error("Invalid settings format");
        }
      },
    }),
    {
      name: "flit-rider-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        // Only persist settings, not functions
        const {
          updateSetting,
          resetToDefaults,
          exportSettings,
          importSettings,
          ...settings
        } = state;
        return settings;
      },
    }
  )
);

// Convenience hooks for common settings
export const useHaptics = () => {
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);
  return hapticsEnabled;
};

export const useLocationAccess = () => {
  const allowLocationAccess = useSettingsStore((state) => state.allowLocationAccess);
  return allowLocationAccess;
};

export const useThemeSettings = () => {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const themeEnabled = useSettingsStore((state) => state.themeEnabled);
  return { themeMode, themeEnabled };
};
