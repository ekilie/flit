import TagChip from "@/components/TagChip";
import { useCurrentTheme } from "@/context/CentralTheme";
import Api from "@/lib/api";
import { Tag } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

interface TagInputProps {
  // Accept either an array of tag ids (string[]) or an array of Tag objects
  selectedTags: string[] | Tag[];
  // We persist/return an array of tag ids to the parent
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export default function TagInput({
  selectedTags,
  onTagsChange,
  maxTags = 5,
}: TagInputProps) {
  const theme = useCurrentTheme();
  // bottom sheet index: -1 = closed, 0 = first snap, 1 = second snap
  const [sheetIndex, setSheetIndex] = useState<number>(-1);
  const snapPoints = useMemo(() => ["50%", "85%"], []);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When the sheet opens, load popular tags
    if (sheetIndex >= 0) {
      loadPopularTags();
    }
  }, [sheetIndex]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchTags();
    } else {
      loadPopularTags();
    }
  }, [searchQuery]);

  const loadPopularTags = async () => {
    setLoading(true);
    try {
      const popularTags = await Api.getPopularTags(20);
      setTags(popularTags);
    } catch (error) {
      console.error("Failed to load popular tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchTags = async () => {
    setLoading(true);
    try {
      const searchResults = await Api.searchTags(searchQuery);
      setTags(searchResults);
    } catch (error) {
      console.error("Failed to search tags:", error);
    } finally {
      setLoading(false);
    }
  };

  // Defensive normalization: ensure we always work with arrays and ids
  const selectedTagsArray = Array.isArray(selectedTags) ? selectedTags : [];
  const selectedTagIds: string[] = selectedTagsArray.map((s) =>
    typeof s === "string" ? s : (s as Tag).id
  );

  const safeTags = Array.isArray(tags) ? tags : [];

  const handleTagSelect = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else if (selectedTagIds.length < maxTags) {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const selectedTagObjects = safeTags.filter((tag) =>
    selectedTagIds.includes(tag.id)
  );

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.triggerButton,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={() => setSheetIndex(0)}
      >
        <Ionicons name="pricetag-outline" size={20} color={theme.primary} />
        <Text style={[styles.triggerText, { color: theme.text }]}>
          {selectedTagIds.length > 0
            ? `${selectedTagIds.length} tag${
                selectedTagIds.length > 1 ? "s" : ""
              } selected`
            : "Add tags"}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.mutedText} />
      </Pressable>

      {/* Selected Tags Display */}
      {selectedTagObjects.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          {selectedTagObjects.map((tag) => (
            <View key={tag.id} style={styles.selectedTagWrapper}>
              <TagChip label={tag.name} size="small" color={tag.color} />
              <Pressable
                style={({ pressed }) => [
                  styles.removeButton,
                  {
                    backgroundColor: theme.cardBackground,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => handleRemoveTag(tag.id)}
              >
                <Ionicons name="close" size={14} color={theme.text} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <BottomSheet
        index={sheetIndex}
        onChange={(i) => setSheetIndex(i)}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.background }}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Add Tags
          </Text>
          <Text style={[styles.modalSubtitle, { color: theme.subtleText }]}>
            {selectedTagIds.length}/{maxTags} selected
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => setSheetIndex(-1)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
        </View>

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.mutedText}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search tags..."
            placeholderTextColor={theme.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={theme.mutedText} />
            </Pressable>
          )}
        </View>

        {/* Tags List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : safeTags.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="pricetags-outline"
              size={48}
              color={theme.mutedText}
            />
            <Text style={[styles.emptyText, { color: theme.subtleText }]}>
              No tags found
            </Text>
          </View>
        ) : (
          <FlatList
            data={safeTags}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedTagIds.includes(item.id);
              const isDisabled =
                !isSelected && selectedTagIds.length >= maxTags;

              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.tagItem,
                    {
                      backgroundColor: isSelected
                        ? `${item.color || theme.primary}15`
                        : theme.cardBackground,
                      borderColor: isSelected
                        ? item.color || theme.primary
                        : theme.border,
                      opacity: pressed ? 0.7 : isDisabled ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => handleTagSelect(item.id)}
                  disabled={isDisabled}
                >
                  <View style={styles.tagInfo}>
                    <Text
                      style={[
                        styles.tagName,
                        {
                          color: isSelected
                            ? item.color || theme.primary
                            : theme.text,
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text
                        style={[
                          styles.tagDescription,
                          { color: theme.subtleText },
                        ]}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.tagRight}>
                    <Text style={[styles.tagCount, { color: theme.mutedText }]}>
                      {item.usage_count}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={item.color || theme.primary}
                      />
                    )}
                  </View>
                </Pressable>
              );
            }}
            contentContainerStyle={styles.listContent}
          />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
  },
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  selectedTagWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    height: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  tagInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  tagDescription: {
    fontSize: 13,
  },
  tagRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagCount: {
    fontSize: 13,
  },
});
