import SimpleAvatarModal from "@/components/SimpleAvatarModal";
import { useCurrentTheme } from "@/context/CentralTheme";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

interface ClickableAvatarProps {
  name: string;
  subtitle?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
  showModal?: boolean;
  initials?: string;
  statusIndicator?: {
    show: boolean;
    color: string;
  };
}

const ClickableAvatar: React.FC<ClickableAvatarProps> = ({
  name,
  subtitle,
  size = 40,
  backgroundColor,
  textColor = "white",
  style,
  showModal = true,
  initials,
  statusIndicator,
}) => {
  const theme = useCurrentTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const getInitials = (fullName: string) => {
    if (initials) return initials;
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const fontSize = size * 0.4;

  const handlePress = () => {
    if (showModal) {
      setModalVisible(true);
    }
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.avatar,
          avatarSize,
          {
            backgroundColor: backgroundColor || theme.primary,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
          style,
        ]}
        onPress={handlePress}
        disabled={!showModal}
      >
        <Text
          style={[
            styles.avatarText,
            {
              fontSize,
              color: textColor,
            },
          ]}
        >
          {getInitials(name)}
        </Text>

        {/* Status Indicator */}
        {statusIndicator?.show && (
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: statusIndicator.color,
                borderColor: theme.background,
                width: size * 0.25,
                height: size * 0.25,
                borderRadius: size * 0.125,
                borderWidth: size * 0.04,
                bottom: size * 0.05,
                right: size * 0.05,
              },
            ]}
          />
        )}
      </Pressable>

      {showModal && (
        <SimpleAvatarModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          name={name}
          subtitle={subtitle}
          initials={initials}
          backgroundColor={backgroundColor}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontWeight: "bold",
  },
  statusIndicator: {
    position: "absolute",
  },
});

export default ClickableAvatar;
