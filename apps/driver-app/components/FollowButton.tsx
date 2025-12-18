import { useCurrentTheme } from "@/context/CentralTheme";
import Api from "@/lib/api";
import { HapticFeedback } from "@/lib/haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import Toast from "react-native-toast-message";

interface FollowButtonProps {
  userId: string;
  size?: "small" | "medium" | "large";
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  userId,
  size = "medium",
  onFollowChange,
}: FollowButtonProps) {
  const theme = useCurrentTheme();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkFollowStatus();
  }, [userId]);

  const checkFollowStatus = async () => {
    try {
      const status = await Api.isFollowing(userId);
      setIsFollowing(status);
    } catch (error) {
      console.error("Failed to check follow status:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleFollowToggle = async () => {
    if (loading) return;

    setLoading(true);
    const previousState = isFollowing;

    // Optimistic update
    setIsFollowing(!isFollowing);
    HapticFeedback("light");

    try {
      if (isFollowing) {
        await Api.unfollowUser(userId);
        Toast.show({
          type: "success",
          text1: "Unfollowed",
          text2: "You have unfollowed this user",
          position: "bottom",
        });
      } else {
        await Api.followUser(userId);
        Toast.show({
          type: "success",
          text1: "Following",
          text2: "You are now following this user",
          position: "bottom",
        });
      }
      onFollowChange?.(!isFollowing);
    } catch (error) {
      // Revert on error
      setIsFollowing(previousState);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error instanceof Error ? error.message : "Failed to update follow status",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Pressable
        style={[
          styles.button,
          styles[size],
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
        disabled
      >
        <ActivityIndicator size="small" color={theme.mutedText} />
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[size],
        {
          backgroundColor: isFollowing ? theme.cardBackground : theme.primary,
          borderColor: isFollowing ? theme.border : theme.primary,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={handleFollowToggle}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? theme.text : "white"}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            styles[`${size}Text`],
            { color: isFollowing ? theme.text : "white" },
          ]}
        >
          {isFollowing ? "Following" : "Follow"}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  small: {
    height: 28,
    paddingHorizontal: 12,
  },
  medium: {
    height: 32,
    paddingHorizontal: 16,
  },
  large: {
    height: 36,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontWeight: "600",
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 15,
  },
});
