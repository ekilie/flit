import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SettingValueDisplayProps {
  value: string | number | boolean;
  type?: "text" | "boolean" | "number";
}

export const SettingValueDisplay: React.FC<SettingValueDisplayProps> = ({
  value,
  type = "text",
}) => {
  const theme = useCurrentTheme();

  const renderValue = () => {
    switch (type) {
      case "boolean":
        return (
          <View
            style={[
              styles.booleanContainer,
              {
                backgroundColor: value
                  ? `${theme.primary}20`
                  : `${theme.mutedText}20`,
              },
            ]}
          >
            <Ionicons
              name={value ? "checkmark" : "close"}
              size={12}
              color={value ? theme.primary : theme.mutedText}
            />
            <Text
              style={[
                styles.booleanText,
                {
                  color: value ? theme.primary : theme.mutedText,
                },
              ]}
            >
              {value ? "On" : "Off"}
            </Text>
          </View>
        );
      case "number":
        return (
          <Text style={[styles.valueText, { color: theme.subtleText }]}>
            {value}
          </Text>
        );
      default:
        return (
          <Text style={[styles.valueText, { color: theme.subtleText }]}>
            {String(value)}
          </Text>
        );
    }
  };

  return renderValue();
};

const styles = StyleSheet.create({
  booleanContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  booleanText: {
    fontSize: 12,
    fontWeight: "600",
  },
  valueText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
