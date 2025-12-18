import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AudioQuality = "low" | "medium" | "high" | "lossless";
export type NotificationFrequency = "never" | "low" | "medium" | "high";
export type AutoPlayMode = "never" | "wifi-only" | "always";

interface SettingsState {
  themeMode: "light" | "dark" | "system";
  themeEnabled: false; // Always false for now

  // Audio settings
  audioQuality: AudioQuality;
  autoPlay: AutoPlayMode;
  downloadQuality: AudioQuality;
  enableAudioEnhancement: boolean;
  maxRecordingDuration: number; // in minutes
  autoStopRecording: boolean;

  // Interaction settings
  hapticsEnabled: boolean;
  soundEffectsEnabled: boolean;
  voiceCommandsEnabled: boolean;
  gestureControlsEnabled: boolean;

  // Privacy settings
  shareAnalytics: boolean;
  allowLocationAccess: boolean;
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;

  // Notification settings
  pushNotificationsEnabled: boolean;
  notificationFrequency: NotificationFrequency;
  notifyOnNewFollowers: boolean;
  notifyOnComments: boolean;
  notifyOnMentions: boolean;
  notifyOnLikes: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"

  // Performance settings
  enableOfflineMode: boolean;
  autoDownloadFavorites: boolean;
  dataSaverMode: boolean;
  preloadContent: boolean;

  // Accessibility settings
  fontSize: "small" | "medium" | "large" | "xl";
  highContrastMode: boolean;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;

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

  // Audio settings
  audioQuality: "high",
  autoPlay: "wifi-only",
  downloadQuality: "high",
  enableAudioEnhancement: true,
  maxRecordingDuration: 10,
  autoStopRecording: true,

  // Interaction settings
  hapticsEnabled: true,
  soundEffectsEnabled: true,
  voiceCommandsEnabled: false,
  gestureControlsEnabled: true,

  // Privacy settings
  shareAnalytics: true,
  allowLocationAccess: false,
  showOnlineStatus: true,
  allowFriendRequests: true,

  // Notification settings
  pushNotificationsEnabled: true,
  notificationFrequency: "medium",
  notifyOnNewFollowers: true,
  notifyOnComments: true,
  notifyOnMentions: true,
  notifyOnLikes: false,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",

  // Performance settings
  enableOfflineMode: false,
  autoDownloadFavorites: false,
  dataSaverMode: false,
  preloadContent: true,

  // Accessibility settings
  fontSize: "medium",
  highContrastMode: false,
  reduceMotion: false,
  screenReaderOptimized: false,
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
      name: "listen-app-settings",
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

export const useAudioQuality = () => {
  const audioQuality = useSettingsStore((state) => state.audioQuality);
  return audioQuality;
};

export const useThemeSettings = () => {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const themeEnabled = useSettingsStore((state) => state.themeEnabled);
  return { themeMode, themeEnabled };
};
