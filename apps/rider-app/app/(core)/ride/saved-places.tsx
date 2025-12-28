import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Dummy saved places data
const SAVED_PLACES = [
  {
    id: "1",
    name: "Home",
    address: "Mikocheni B, Plot 123, Dar es Salaam",
    icon: "home",
    color: "#4CAF50",
  },
  {
    id: "2",
    name: "Work",
    address: "Posta Road, Kariakoo, Dar es Salaam",
    icon: "briefcase",
    color: "#2196F3",
  },
  {
    id: "3",
    name: "Gym",
    address: "Slipway, Msasani Peninsula, Dar es Salaam",
    icon: "fitness",
    color: "#FF9800",
  },
];

const PLACE_ICONS = [
  { id: "home", icon: "home", label: "Home", color: "#4CAF50" },
  { id: "work", icon: "briefcase", label: "Work", color: "#2196F3" },
  { id: "gym", icon: "fitness", label: "Gym", color: "#FF9800" },
  { id: "restaurant", icon: "restaurant", label: "Restaurant", color: "#F44336" },
  { id: "shopping", icon: "cart", label: "Store", color: "#9C27B0" },
  { id: "school", icon: "school", label: "School", color: "#00BCD4" },
  { id: "hospital", icon: "medical", label: "Hospital", color: "#E91E63" },
  { id: "other", icon: "location", label: "Other", color: "#607D8B" },
];

interface SavedPlaceItemProps {
  place: typeof SAVED_PLACES[0];
  onEdit: () => void;
  onDelete: () => void;
}

const SavedPlaceItem: React.FC<SavedPlaceItemProps> = ({ place, onEdit, onDelete }) => {
  const theme = useCurrentTheme();

  return (
    <View style={[styles.placeItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.placeContent}>
        <View style={[styles.placeIcon, { backgroundColor: `${place.color}15` }]}>
          <Ionicons name={place.icon as any} size={24} color={place.color} />
        </View>
        <View style={styles.placeInfo}>
          <Text style={[styles.placeName, { color: theme.text }]}>{place.name}</Text>
          <Text style={[styles.placeAddress, { color: theme.subtleText }]} numberOfLines={1}>
            {place.address}
          </Text>
        </View>
      </View>
      <View style={styles.placeActions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: `${theme.primary}15`,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={onEdit}
        >
          <Ionicons name="pencil" size={18} color={theme.primary} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: `${theme.error}15`,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={18} color={theme.error} />
        </Pressable>
      </View>
    </View>
  );
};

export default function SavedPlacesScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  
  const [places, setPlaces] = useState(SAVED_PLACES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceAddress, setNewPlaceAddress] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(PLACE_ICONS[0]);

  const handleAddPlace = () => {
    if (!newPlaceName.trim() || !newPlaceAddress.trim()) {
      haptics.error();
      return;
    }

    haptics.success();
    const newPlace = {
      id: String(Date.now()),
      name: newPlaceName,
      address: newPlaceAddress,
      icon: selectedIcon.icon,
      color: selectedIcon.color,
    };

    setPlaces([...places, newPlace]);
    setShowAddForm(false);
    setNewPlaceName("");
    setNewPlaceAddress("");
    setSelectedIcon(PLACE_ICONS[0]);
  };

  const handleEditPlace = (placeId: string) => {
    haptics.selection();
    // In production, show edit modal
  };

  const handleDeletePlace = (placeId: string) => {
    haptics.medium();
    setPlaces(places.filter((p) => p.id !== placeId));
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: theme.cardBackground,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Saved Places
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: `${theme.primary}10` }]}>
            <Ionicons name="information-circle" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.primary }]}>
              Save frequently visited places for easier bookings
            </Text>
          </View>

          {/* Saved Places List */}
          {places.length > 0 ? (
            <View style={styles.placesList}>
              {places.map((place) => (
                <SavedPlaceItem
                  key={place.id}
                  place={place}
                  onEdit={() => handleEditPlace(place.id)}
                  onDelete={() => handleDeletePlace(place.id)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: `${theme.primary}15` }]}>
                <Ionicons name="location-outline" size={48} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Hakuna Saved Places
              </Text>
              <Text style={[styles.emptyText, { color: theme.subtleText }]}>
                Add places you visit frequently to save time
              </Text>
            </View>
          )}

          {/* Add New Place Form */}
          {showAddForm ? (
            <View style={[styles.addForm, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: theme.text }]}>
                  Add New Place
                </Text>
                <Pressable
                  onPress={() => {
                    setShowAddForm(false);
                    setNewPlaceName("");
                    setNewPlaceAddress("");
                  }}
                >
                  <Ionicons name="close" size={24} color={theme.text} />
                </Pressable>
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Place name (e.g: Home)"
                placeholderTextColor={theme.inputPlaceholder}
                value={newPlaceName}
                onChangeText={setNewPlaceName}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Full address"
                placeholderTextColor={theme.inputPlaceholder}
                value={newPlaceAddress}
                onChangeText={setNewPlaceAddress}
                multiline
                numberOfLines={2}
              />

              <Text style={[styles.label, { color: theme.text }]}>
                Select Icon:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.iconPicker}
              >
                {PLACE_ICONS.map((iconOption) => (
                  <Pressable
                    key={iconOption.id}
                    style={({ pressed }) => [
                      styles.iconOption,
                      {
                        backgroundColor:
                          selectedIcon.id === iconOption.id
                            ? `${iconOption.color}15`
                            : theme.surface,
                        borderColor:
                          selectedIcon.id === iconOption.id
                            ? iconOption.color
                            : theme.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                    onPress={() => {
                      haptics.selection();
                      setSelectedIcon(iconOption);
                    }}
                  >
                    <Ionicons
                      name={iconOption.icon as any}
                      size={24}
                      color={
                        selectedIcon.id === iconOption.id
                          ? iconOption.color
                          : theme.mutedText
                      }
                    />
                    <Text
                      style={[
                        styles.iconLabel,
                        {
                          color:
                            selectedIcon.id === iconOption.id
                              ? iconOption.color
                              : theme.text,
                        },
                      ]}
                    >
                      {iconOption.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.formActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    {
                      backgroundColor: theme.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={() => {
                    setShowAddForm(false);
                    setNewPlaceName("");
                    setNewPlaceAddress("");
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.saveButton,
                    {
                      backgroundColor: theme.primary,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={handleAddPlace}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => {
                haptics.selection();
                setShowAddForm(true);
              }}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.addButtonText}>Add New Place</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  placesList: {
    gap: 12,
    marginBottom: 20,
  },
  placeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  placeContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
  },
  placeActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
  },
  addForm: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  iconPicker: {
    gap: 10,
    marginBottom: 20,
  },
  iconOption: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 80,
    gap: 6,
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
