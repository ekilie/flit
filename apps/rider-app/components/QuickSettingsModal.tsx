import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useSettingsStore } from "@/stores/settings";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface QuickSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QuickSettingsModal: React.FC<QuickSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const theme = useCurrentTheme();
  const haptics = useHaptics();
  const {
    hapticsEnabled,
    soundEffectsEnabled,
    dataSaverMode,
    autoPlay,
    updateSetting,
  } = useSettingsStore();

  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const QuickToggle = ({
    title,
    subtitle,
    icon,
    value,
    onToggle,
  }: {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <View style={[styles.toggleItem, { backgroundColor: theme.surface }]}>
      <View style={styles.toggleLeft}>
        <View
          style={[styles.toggleIcon, { backgroundColor: `${theme.primary}15` }]}
        >
          <Ionicons name={icon} size={20} color={theme.primary} />
        </View>
        <View style={styles.toggleText}>
          <Text style={[styles.toggleTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.toggleSubtitle, { color: theme.subtleText }]}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => {
          haptics.selection();
          onToggle(newValue);
        }}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor={value ? "white" : theme.mutedText}
      />
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.background,
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Quick Settings
              </Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => {
                  haptics.light();
                  onClose();
                }}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            {/* Quick Toggles */}
            <View style={styles.togglesContainer}>
              <QuickToggle
                title="Haptic Feedback"
                subtitle="Vibration on touch"
                icon="phone-portrait"
                value={hapticsEnabled}
                onToggle={(value) => updateSetting("hapticsEnabled", value)}
              />

              <QuickToggle
                title="Sound Effects"
                subtitle="UI audio feedback"
                icon="volume-medium"
                value={soundEffectsEnabled}
                onToggle={(value) =>
                  updateSetting("soundEffectsEnabled", value)
                }
              />

              <QuickToggle
                title="Data Saver"
                subtitle="Reduce data usage"
                icon="cellular"
                value={dataSaverMode}
                onToggle={(value) => updateSetting("dataSaverMode", value)}
              />
            </View>

            {/* Quick Info */}
            <View style={styles.infoSection}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                Current Audio Mode
              </Text>
              <Text style={[styles.infoValue, { color: theme.subtleText }]}>
                Auto Play: {autoPlay.replace("-", " ")}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                style={[
                  styles.actionButton,
                  { backgroundColor: `${theme.primary}15` },
                ]}
                onPress={() => {
                  haptics.selection();
                  onClose();
                  // Navigate to full settings
                }}
              >
                <Ionicons name="settings" size={20} color={theme.primary} />
                <Text style={[styles.actionText, { color: theme.primary }]}>
                  All Settings
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  togglesContainer: {
    gap: 12,
    marginBottom: 20,
  },
  toggleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 13,
  },
  infoSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
