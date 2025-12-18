import { useCurrentTheme } from "@/context/CentralTheme";
import { VoiceMemoCategory } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CategoryChipProps {
  category: VoiceMemoCategory;
  isSelected?: boolean;
  onPress: (category: VoiceMemoCategory) => void;
  showCount?: boolean;
  count?: number;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isSelected = false,
  onPress,
  showCount = false,
  count = 0,
}) => {
  const theme = useCurrentTheme();
  const [pressed, setPressed] = useState(false);

  const categoryColor = category.color || theme.primary;
  const iconName =
    (category.icon as keyof typeof Ionicons.glyphMap) || "folder-outline";

  return (
    <Pressable
      onPress={() => onPress(category)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? categoryColor + "20"
            : pressed
            ? theme.card + "CC"
            : theme.card,
          borderColor: isSelected ? categoryColor : theme.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSelected
                ? categoryColor + "30"
                : categoryColor + "15",
            },
          ]}
        >
          <Ionicons name={iconName} size={20} color={categoryColor} />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.name,
              {
                color: isSelected ? categoryColor : theme.text,
                fontWeight: isSelected ? "600" : "500",
              },
            ]}
            numberOfLines={1}
          >
            {category.name}
          </Text>

          {showCount && (
            <Text
              style={[
                styles.count,
                {
                  color: isSelected ? categoryColor : theme.subtleText,
                },
              ]}
            >
              {count} memo{count !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </View>

      {isSelected && (
        <View
          style={[styles.selectedIndicator, { backgroundColor: categoryColor }]}
        >
          <Ionicons name="checkmark" size={14} color="white" />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 72,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    textTransform: "capitalize",
    marginBottom: 2,
  },
  count: {
    fontSize: 12,
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CategoryChip;
