import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface SimpleAvatarModalProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  subtitle?: string;
  initials?: string;
  backgroundColor?: string;
}

const SimpleAvatarModal: React.FC<SimpleAvatarModalProps> = ({
  visible,
  onClose,
  name,
  subtitle,
  initials,
  backgroundColor,
}) => {
  const theme = useCurrentTheme();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.3)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, modalScale, modalOpacity]);

  const getInitials = (fullName: string) => {
    if (initials) return initials;
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            backgroundColor: theme.isDark
              ? "rgba(0,0,0,0.8)"
              : "rgba(0,0,0,0.6)",
            opacity: backdropOpacity,
          },
        ]}
      >
        <Pressable style={styles.backdropPress} onPress={onClose} />

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              transform: [{ scale: modalScale }],
              opacity: modalOpacity,
            },
          ]}
        >
          {/* Close Button */}
          <Pressable
            style={[
              styles.closeButton,
              { backgroundColor: `${theme.mutedText}20` },
            ]}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color={theme.mutedText} />
          </Pressable>

          {/* Large Avatar */}
          <View style={styles.avatarSection}>
            <View
              style={[
                styles.largeAvatar,
                {
                  backgroundColor: backgroundColor || theme.primary,
                  shadowColor: backgroundColor || theme.primary,
                },
              ]}
            >
              <Text style={styles.largeAvatarText}>{getInitials(name)}</Text>
            </View>
          </View>

          {/* User Information */}
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>{name}</Text>

            {subtitle && (
              <Text style={[styles.userSubtitle, { color: theme.subtleText }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdropPress: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.75,
    maxWidth: 320,
    borderRadius: 24,
    padding: 24,
    paddingTop: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  largeAvatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  userSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default SimpleAvatarModal;
