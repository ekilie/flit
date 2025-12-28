import { useCurrentTheme } from "@/context/CentralTheme";
import { User } from "@/lib/api/types";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
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

const { width, height } = Dimensions.get("window");

interface AvatarModalProps {
  visible: boolean;
  onClose: () => void;
  user: User;
}

const AvatarModal: React.FC<AvatarModalProps> = ({
  visible,
  onClose,
  user,
}) => {
  const theme = useCurrentTheme();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.3)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(50)).current;

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
        Animated.spring(slideAnimation, {
          toValue: 0,
          friction: 8,
          tension: 100,
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
        Animated.timing(slideAnimation, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, modalScale, modalOpacity, slideAnimation]);

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== "string") {
      return "U";
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getUserRole = () => {
    const role = (user as any).role;
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getUserStatus = () => {
    const isActive = (user as any).isActive ?? (user as any).is_active ?? true;
    return isActive ? "Online" : "Offline";
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
              transform: [
                { scale: modalScale },
                { translateY: slideAnimation },
              ],
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
                  backgroundColor: theme.primary,
                  shadowColor: theme.primary,
                },
              ]}
            >
              <Text style={styles.largeAvatarText}>
                {getInitials((user as any).fullName || (user as any).name)}
              </Text>

              {/* Status Indicator */}
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: ((user as any).isActive ?? (user as any).is_active ?? true) ? "#4CAF50" : "#F44336",
                    borderColor: theme.card,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: ((user as any).isActive ?? (user as any).is_active ?? true) ? "#4CAF50" : "#F44336" },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* User Information */}
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {(user as any).displayName || (user as any).fullName || (user as any).name || "User"}
            </Text>

            {((user as any).displayName || (user as any).fullName || (user as any).name) && (
              <Text style={[styles.userHandle, { color: theme.subtleText }]}>
                @{((user as any).fullName || (user as any).name || "").toLowerCase().replace(/\s+/g, "")}
              </Text>
            )}

            <Text style={[styles.userEmail, { color: theme.mutedText }]}>
              {user.email}
            </Text>
          </View>

          {/* Status and Role */}
          <View style={styles.credentialsSection}>
            <View style={styles.credentialItem}>
              <View style={styles.credentialIcon}>
                <MaterialIcons
                  name="circle"
                  size={12}
                  color={((user as any).isActive ?? (user as any).is_active ?? true) ? "#4CAF50" : "#F44336"}
                />
              </View>
              <Text
                style={[styles.credentialText, { color: theme.subtleText }]}
              >
                {getUserStatus()}
              </Text>
            </View>

            {getUserRole() && (
              <>
                <View style={styles.credentialSeparator}>
                  <Text style={[styles.separator, { color: theme.mutedText }]}>
                    •
                  </Text>
                </View>

                <View style={styles.credentialItem}>
                  <View style={styles.credentialIcon}>
                    <MaterialIcons
                      name="verified-user"
                      size={12}
                      color={theme.primary}
                    />
                  </View>
                  <Text
                    style={[styles.credentialText, { color: theme.subtleText }]}
                  >
                    {getUserRole()}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoItem}>
              <MaterialIcons
                name="calendar-today"
                size={14}
                color={theme.mutedText}
              />
              <Text style={[styles.infoText, { color: theme.mutedText }]}>
                Member since {formatDate((user as any).createdAt || (user as any).created_at)}
              </Text>
            </View>

            {((user as any).lastLogin || (user as any).last_login) && (
              <View style={styles.infoItem}>
                <MaterialIcons
                  name="access-time"
                  size={14}
                  color={theme.mutedText}
                />
                <Text style={[styles.infoText, { color: theme.mutedText }]}>
                  Last active {formatDate((user as any).lastLogin || (user as any).last_login)}
                </Text>
              </View>
            )}

            {(user as any).metadata?.location && (
              <View style={styles.infoItem}>
                <MaterialIcons
                  name="location-on"
                  size={14}
                  color={theme.mutedText}
                />
                <Text style={[styles.infoText, { color: theme.mutedText }]}>
                  {(user as any).metadata.location}
                </Text>
              </View>
            )}
          </View>

          {/* Stats Quick View */}
          <View style={[styles.quickStats, { borderTopColor: theme.border }]}>
            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => router.push("/(core)/profile/edit")}
            >
              <Ionicons name="create-outline" size={30} color="#fff" />
              <Text
                style={[styles.editButtonText]}
              >
                Edit Profile
              </Text>
            </Pressable>
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
    width: width * 0.85,
    maxWidth: 400,
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
    position: "relative",
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
  statusIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  userHandle: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "500",
  },
  userEmail: {
    fontSize: 14,
    textAlign: "center",
  },
  credentialsSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  credentialItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  credentialIcon: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  credentialText: {
    fontSize: 14,
    fontWeight: "500",
  },
  credentialSeparator: {
    marginHorizontal: 12,
  },
  separator: {
    fontSize: 16,
    fontWeight: "bold",
  },
  additionalInfo: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "center",
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding:16,
    borderRadius: 20,
    width: "100%",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 8,
  },
});

export default AvatarModal;
