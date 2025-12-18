import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import {
  AudioQuality,
  AutoPlayMode,
  NotificationFrequency,
  useSettingsStore,
} from "@/stores/settings";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { toast } from "yooo-native";

const { width } = Dimensions.get("window");

interface SettingItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialIcons.glyphMap;
  iconType?: "ionicon" | "material";
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  disabled?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  icon,
  iconType = "ionicon",
  onPress,
  rightElement,
  showChevron = false,
  disabled = false,
}) => {
  const theme = useCurrentTheme();
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);

  const handlePress = () => {
    if (disabled || !onPress) return;

    if (hapticsEnabled) {
      // Use selection haptic for toggles and switches, light impact for navigation
      if (rightElement) {
        Haptics.selectionAsync();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    onPress();
  };

  const IconComponent = iconType === "material" ? MaterialIcons : Ionicons;

  // Icon colors based on category
  const getIconColor = () => {
    if (icon === "musical-notes" || icon === "mic") return "#6C5CE7";
    if (icon === "phone-portrait" || icon === "volume-medium") return "#45B7D1";
    if (icon === "notifications" || icon === "time") return "#FFB84D";
    if (icon === "analytics" || icon === "location") return "#96CEB4";
    if (icon === "text" || icon === "contrast") return "#FF6B6B";
    return theme.primary;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        {
          backgroundColor: pressed ? theme.highlight : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={handlePress}
      disabled={disabled || !onPress}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${getIconColor()}15` },
          ]}
        >
          <IconComponent name={icon as any} size={22} color={getIconColor()} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.subtleText }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.mutedText}
            style={styles.chevron}
          />
        )}
      </View>
    </Pressable>
  );
};

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  const theme = useCurrentTheme();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {subtitle && (
        <Text style={[styles.sectionSubtitle, { color: theme.subtleText }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default function Settings() {
  const theme = useCurrentTheme();
  const {
    hapticsEnabled,
    soundEffectsEnabled,
    audioQuality,
    autoPlay,
    downloadQuality,
    enableAudioEnhancement,
    maxRecordingDuration,
    autoStopRecording,
    pushNotificationsEnabled,
    notificationFrequency,
    notifyOnNewFollowers,
    notifyOnComments,
    notifyOnMentions,
    shareAnalytics,
    allowLocationAccess,
    showOnlineStatus,
    dataSaverMode,
    preloadContent,
    fontSize,
    highContrastMode,
    reduceMotion,
    themeMode,
    themeEnabled,
    updateSetting,
    resetToDefaults,
    exportSettings,
  } = useSettingsStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleHapticsToggle = (value: boolean) => {
    updateSetting("hapticsEnabled", value);
    if (value) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleAudioQualitySelect = () => {
    const qualities: AudioQuality[] = ["low", "medium", "high", "lossless"];
    const options = qualities.map((q) => ({
      text: q.charAt(0).toUpperCase() + q.slice(1),
      onPress: () => updateSetting("audioQuality", q),
      style: (q === audioQuality ? "default" : "cancel") as
        | "default"
        | "cancel"
        | "destructive",
    }));

    Alert.alert("Audio Quality", "Select playback quality", [
      ...options,
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const handleAutoPlaySelect = () => {
    const modes: AutoPlayMode[] = ["never", "wifi-only", "always"];
    const options = modes.map((mode) => ({
      text: mode.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      onPress: () => updateSetting("autoPlay", mode),
      style: (mode === autoPlay ? "default" : "cancel") as
        | "default"
        | "cancel"
        | "destructive",
    }));

    Alert.alert("Auto Play", "When should audio auto-play?", [
      ...options,
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const handleNotificationFrequencySelect = () => {
    const frequencies: NotificationFrequency[] = [
      "never",
      "low",
      "medium",
      "high",
    ];
    const options = frequencies.map((freq) => ({
      text: freq.charAt(0).toUpperCase() + freq.slice(1),
      onPress: () => updateSetting("notificationFrequency", freq),
      style: (freq === notificationFrequency ? "default" : "cancel") as
        | "default"
        | "cancel"
        | "destructive",
    }));

    Alert.alert("Notification Frequency", "How often should we notify you?", [
      ...options,
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const handleFontSizeSelect = () => {
    const sizes = ["small", "medium", "large", "xl"] as const;
    const options = sizes.map((size) => ({
      text: size.charAt(0).toUpperCase() + size.slice(1),
      onPress: () => updateSetting("fontSize", size),
      style: (size === fontSize ? "default" : "cancel") as
        | "default"
        | "cancel"
        | "destructive",
    }));

    Alert.alert("Font Size", "Select text size", [
      ...options,
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const handleRecordingDurationSelect = () => {
    const durations = [5, 10, 15, 30, 60];
    const options = durations.map((duration) => ({
      text: `${duration} minutes`,
      onPress: () => updateSetting("maxRecordingDuration", duration),
      style: (duration === maxRecordingDuration ? "default" : "cancel") as
        | "default"
        | "cancel"
        | "destructive",
    }));

    Alert.alert("Max Recording Duration", "Select maximum recording length", [
      ...options,
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "This will reset all settings to their default values. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetToDefaults();
            if (hapticsEnabled) {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              );
            }
            toast.success("Settings reset to defaults");
          },
        },
      ]
    );
  };

  const handleExportSettings = async () => {
    try {
      const settingsString = await exportSettings();
      await Share.share({
        message: settingsString,
        title: "Listen App Settings Export",
      });
    } catch (error) {
      toast.error("Failed to export settings");
    }
  };

  return (
    <ScreenLayout>
      <ScrollView
        style={[styles.container]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <View style={styles.headerIconWrapper}>
                <Ionicons name="settings" size={28} color="#6C5CE7" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
                <Text style={[styles.headerSubtitle, { color: theme.subtleText }]}>
                  Customize your experience
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme Section (Disabled) */}
        {/* <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Appearance"
            subtitle="Theme options coming soon"
          />

          <SettingItem
            title="Theme Mode"
            subtitle={`Current: ${themeMode} (Fixed for now)`}
            icon="color-palette"
            disabled={!themeEnabled}
            rightElement={
              <Text style={[styles.disabledText, { color: theme.mutedText }]}>
                Coming Soon
              </Text>
            }
          />
        </View> */}

        {/* Audio Settings */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Audio & Recording"
            subtitle="Customize your audio experience"
          />

          <SettingItem
            title="Audio Quality"
            subtitle={`Current: ${audioQuality}`}
            icon="musical-notes"
            onPress={handleAudioQualitySelect}
            showChevron
          />

          <SettingItem
            title="Auto Play"
            subtitle={`Current: ${autoPlay.replace("-", " ")}`}
            icon="play-circle"
            onPress={handleAutoPlaySelect}
            showChevron
          />

          <SettingItem
            title="Audio Enhancement"
            subtitle="Improve audio quality with processing"
            icon="volume-high"
            rightElement={
              <Switch
                value={enableAudioEnhancement}
                onValueChange={(value) =>
                  updateSetting("enableAudioEnhancement", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={enableAudioEnhancement ? "white" : theme.mutedText}
              />
            }
          />

          <SettingItem
            title="Max Recording Duration"
            subtitle={`${maxRecordingDuration} minutes`}
            icon="mic"
            onPress={handleRecordingDurationSelect}
            showChevron
          />

          <SettingItem
            title="Auto Stop Recording"
            subtitle="Stop recording when reaching max duration"
            icon="stop-circle"
            rightElement={
              <Switch
                value={autoStopRecording}
                onValueChange={(value) =>
                  updateSetting("autoStopRecording", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={autoStopRecording ? "white" : theme.mutedText}
              />
            }
          />
        </View>

        {/* Interaction Settings */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Interaction"
            subtitle="Control how you interact with the app"
          />

          <SettingItem
            title="Haptic Feedback"
            subtitle="Vibrations for touch interactions"
            icon="phone-portrait"
            rightElement={
              <Switch
                value={hapticsEnabled}
                onValueChange={handleHapticsToggle}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={hapticsEnabled ? "white" : theme.mutedText}
              />
            }
          />

          <SettingItem
            title="Sound Effects"
            subtitle="UI sounds and audio cues"
            icon="volume-medium"
            rightElement={
              <Switch
                value={soundEffectsEnabled}
                onValueChange={(value) =>
                  updateSetting("soundEffectsEnabled", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={soundEffectsEnabled ? "white" : theme.mutedText}
              />
            }
          />
        </View>

        {/* Notifications */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Notifications"
            subtitle="Manage how and when you're notified"
          />

          <SettingItem
            title="Push Notifications"
            subtitle="Enable notifications from flit"
            icon="notifications"
            rightElement={
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={(value) =>
                  updateSetting("pushNotificationsEnabled", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={
                  pushNotificationsEnabled ? "white" : theme.mutedText
                }
              />
            }
          />

          <SettingItem
            title="Notification Frequency"
            subtitle={`Current: ${notificationFrequency}`}
            icon="time"
            onPress={handleNotificationFrequencySelect}
            showChevron
            disabled={!pushNotificationsEnabled}
          />

          <SettingItem
            title="New Followers"
            subtitle="Notify when someone follows you"
            icon="person-add"
            rightElement={
              <Switch
                value={notifyOnNewFollowers}
                onValueChange={(value) =>
                  updateSetting("notifyOnNewFollowers", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={notifyOnNewFollowers ? "white" : theme.mutedText}
              />
            }
            disabled={!pushNotificationsEnabled}
          />

          <SettingItem
            title="Comments & Mentions"
            subtitle="Notify for interactions on your posts"
            icon="chatbubble"
            rightElement={
              <Switch
                value={notifyOnComments}
                onValueChange={(value) =>
                  updateSetting("notifyOnComments", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={notifyOnComments ? "white" : theme.mutedText}
              />
            }
            disabled={!pushNotificationsEnabled}
          />
        </View>

        {/* Ride Settings */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Ride Preferences"
            subtitle="Customize your ride experience"
          />

          <SettingItem
            title="Default Vehicle Type"
            subtitle="Economy"
            icon="car"
            onPress={() => {
              const types = ["Economy", "Comfort", "Premium", "XL"];
              Alert.alert("Default Vehicle", "Select your preferred vehicle type", [
                ...types.map((type) => ({
                  text: type,
                  onPress: () => toast.success(`Default vehicle set to ${type}`),
                })),
                { text: "Cancel", style: "cancel" },
              ]);
            }}
            showChevron
          />

          <SettingItem
            title="Auto-Request Ride"
            subtitle="Automatically request ride when opening app"
            icon="flash"
            rightElement={
              <Switch
                value={false}
                onValueChange={(value) => {
                  if (hapticsEnabled) {
                    Haptics.selectionAsync();
                  }
                  toast.info(value ? "Auto-request enabled" : "Auto-request disabled");
                }}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="white"
              />
            }
          />

          <SettingItem
            title="Share ETA"
            subtitle="Automatically share arrival time with contacts"
            icon="share-social"
            rightElement={
              <Switch
                value={false}
                onValueChange={(value) => {
                  if (hapticsEnabled) {
                    Haptics.selectionAsync();
                  }
                  toast.info(value ? "ETA sharing enabled" : "ETA sharing disabled");
                }}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="white"
              />
            }
          />
        </View>

        {/* Privacy & Data */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Privacy & Data"
            subtitle="Control your privacy and data usage"
          />

          <SettingItem
            title="Share Analytics"
            subtitle="Help improve the app with anonymous usage data"
            icon="analytics"
            rightElement={
              <Switch
                value={shareAnalytics}
                onValueChange={(value) =>
                  updateSetting("shareAnalytics", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={shareAnalytics ? "white" : theme.mutedText}
              />
            }
          />

          <SettingItem
            title="Location Access"
            subtitle="Allow location-based features"
            icon="location"
            rightElement={
              <Switch
                value={allowLocationAccess}
                onValueChange={(value) =>
                  updateSetting("allowLocationAccess", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={allowLocationAccess ? "white" : theme.mutedText}
              />
            }
          />

          <SettingItem
            title="Show Online Status"
            subtitle="Let others see when you're active"
            icon="radio-button-on"
            rightElement={
              <Switch
                value={showOnlineStatus}
                onValueChange={(value) =>
                  updateSetting("showOnlineStatus", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={showOnlineStatus ? "white" : theme.mutedText}
              />
            }
          />

          <SettingItem
            title="Data Saver Mode"
            subtitle="Reduce data usage"
            icon="cellular"
            rightElement={
              <Switch
                value={dataSaverMode}
                onValueChange={(value) => updateSetting("dataSaverMode", value)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={dataSaverMode ? "white" : theme.mutedText}
              />
            }
          />
        </View>

        {/* Accessibility */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Accessibility"
            subtitle="Make the app work better for you"
          />


          <SettingItem
            title="Reduce Motion"
            subtitle="Minimize animations and transitions"
            icon="pause"
            rightElement={
              <Switch
                value={reduceMotion}
                onValueChange={(value) => updateSetting("reduceMotion", value)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={reduceMotion ? "white" : theme.mutedText}
              />
            }
          />
        </View>

        {/* Advanced Settings */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Pressable
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Advanced Settings
            </Text>
            <Ionicons
              name={showAdvanced ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.text}
            />
          </Pressable>

          {showAdvanced && (
            <>
              <SettingItem
                title="Preload Content"
                subtitle="Load content in advance for faster access"
                icon="download"
                rightElement={
                  <Switch
                    value={preloadContent}
                    onValueChange={(value) =>
                      updateSetting("preloadContent", value)
                    }
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={preloadContent ? "white" : theme.mutedText}
                  />
                }
              />

              <SettingItem
                title="Export Settings"
                subtitle="Save your settings configuration"
                icon="share"
                onPress={handleExportSettings}
                showChevron
              />

              <SettingItem
                title="Reset to Defaults"
                subtitle="Reset all settings to original values"
                icon="refresh"
                onPress={handleResetSettings}
                showChevron
              />
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedText }]}>
            FLIT • Special Hire Vehicle Platform © 2024
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6C5CE715",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  advancedToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chevron: {
    marginLeft: 4,
  },
  disabledText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 11,
    textAlign: "center",
    opacity: 0.6,
  },
});
