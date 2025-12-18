import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Dummy data
const VEHICLE_TYPES = [
  {
    id: "economy",
    name: "Economy",
    icon: "car-outline",
    price: "$12.50",
    eta: "5 min",
    description: "Affordable rides for everyday trips",
  },
  {
    id: "comfort",
    name: "Comfort",
    icon: "car-sport-outline",
    price: "$18.00",
    eta: "7 min",
    description: "Extra legroom and comfort",
  },
  {
    id: "premium",
    name: "Premium",
    icon: "diamond-outline",
    price: "$28.50",
    eta: "10 min",
    description: "Luxury vehicles with premium features",
  },
  {
    id: "xl",
    name: "XL",
    icon: "car-sport",
    price: "$22.00",
    eta: "8 min",
    description: "Spacious rides for up to 6 passengers",
  },
];

const RECENT_LOCATIONS = [
  { id: "1", name: "Home", address: "123 Main Street, City", icon: "home" },
  { id: "2", name: "Work", address: "456 Business Ave, City", icon: "briefcase" },
  { id: "3", name: "Airport", address: "789 Airport Road", icon: "airplane" },
];

interface LocationInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: string;
  onPress?: () => void;
  editable?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({
  placeholder,
  value,
  onChangeText,
  icon,
  onPress,
  editable = true,
}) => {
  const theme = useCurrentTheme();

  return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
        styles.locationInput,
          {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
      <View style={[styles.locationIcon, { backgroundColor: `${theme.primary}15` }]}>
        <Ionicons name={icon as any} size={20} color={theme.primary} />
      </View>
      <TextInput
        style={[styles.locationText, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.inputPlaceholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
    </Pressable>
  );
};

interface VehicleTypeCardProps {
  vehicle: typeof VEHICLE_TYPES[0];
  selected: boolean;
  onSelect: () => void;
}

const VehicleTypeCard: React.FC<VehicleTypeCardProps> = ({
  vehicle,
  selected,
  onSelect,
}) => {
  const theme = useCurrentTheme();

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.vehicleCard,
        {
          backgroundColor: selected ? `${theme.primary}15` : theme.cardBackground,
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: selected ? 2 : 1,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.vehicleIcon, { backgroundColor: `${theme.primary}10` }]}>
        <Ionicons name={vehicle.icon as any} size={24} color={theme.primary} />
        </View>
      <View style={styles.vehicleInfo}>
        <Text style={[styles.vehicleName, { color: theme.text }]}>{vehicle.name}</Text>
        <Text style={[styles.vehicleDescription, { color: theme.subtleText }]}>
          {vehicle.description}
        </Text>
        <View style={styles.vehicleMeta}>
          <View style={styles.vehicleMetaItem}>
            <Ionicons name="time-outline" size={14} color={theme.mutedText} />
            <Text style={[styles.vehicleMetaText, { color: theme.mutedText }]}>
              {vehicle.eta}
          </Text>
          </View>
          <Text style={[styles.vehiclePrice, { color: theme.primary }]}>
            {vehicle.price}
          </Text>
        </View>
      </View>
      {selected && (
        <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
      </Pressable>
  );
};

export default function RideScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [pickupLocation, setPickupLocation] = useState("Current Location");
  const [destination, setDestination] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);

  // Map animation
  const mapScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Simulate map loading animation
    Animated.spring(mapScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  const snapPoints = ["25%", "50%", "85%"];

  const handleSheetChange = useCallback((index: number) => {
    if (index === 2) {
      haptics.medium();
    }
  }, []);

  const handleSelectVehicle = (vehicleId: string) => {
    haptics.selection();
    setSelectedVehicle(vehicleId);
    bottomSheetRef.current?.snapToIndex(2);
  };

  const handleBookRide = () => {
    if (!selectedVehicle || !destination) {
      haptics.error();
      return;
    }
    haptics.success();
    setIsBooking(true);
    // Simulate booking process
    setTimeout(() => {
      setActiveRide({
        id: "1",
        vehicle: VEHICLE_TYPES.find((v) => v.id === selectedVehicle),
        pickup: pickupLocation,
        destination: destination,
        driver: {
          name: "John Doe",
          rating: 4.8,
          vehicle: "Toyota Camry",
          plate: "ABC-123",
        },
        eta: "5 min",
      });
      setIsBooking(false);
      router.push("/(core)/ride/active");
    }, 2000);
  };

  const handleLocationSelect = (location: typeof RECENT_LOCATIONS[0]) => {
    setDestination(location.address);
    setShowLocationPicker(false);
    bottomSheetRef.current?.snapToIndex(1);
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Map View */}
        <Animated.View
          style={[
            styles.mapContainer,
            {
              transform: [{ scale: mapScale }],
            },
          ]}
        >
          {/* Placeholder Map - In production, use react-native-maps or expo-maps */}
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.surface }]}>
            <Image
              source={{
                uri: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-122.4194,37.7749,12,0/600x400?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
              }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <View style={[styles.mapMarker, { backgroundColor: theme.primary }]}>
                <Ionicons name="location" size={24} color="white" />
              </View>
            </View>
          </View>

          {/* Top Controls */}
          <View style={styles.topControls}>
            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                {
                  backgroundColor: theme.cardBackground,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => router.push("/(core)/ride/history")}
            >
              <Ionicons name="menu" size={24} color={theme.text} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                {
                  backgroundColor: theme.cardBackground,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => router.push("/(core)/(tabs)/profile" as any)}
            >
              <Ionicons name="person-circle-outline" size={24} color={theme.text} />
            </Pressable>
          </View>

          {/* Location Inputs Overlay */}
          <View style={styles.locationInputsContainer}>
            <View style={styles.locationInputWrapper}>
              <LocationInput
                placeholder="Pickup location"
                value={pickupLocation}
                onChangeText={setPickupLocation}
                icon="radio-button-on"
                editable={false}
              />
              <View style={[styles.locationConnector, { backgroundColor: theme.border }]} />
              <LocationInput
                placeholder="Where to?"
                value={destination}
                onChangeText={setDestination}
                icon="location-outline"
                onPress={() => {
                  setShowLocationPicker(true);
                  bottomSheetRef.current?.snapToIndex(1);
                }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          onChange={handleSheetChange}
          backgroundStyle={{ backgroundColor: theme.cardBackground }}
          handleIndicatorStyle={{ backgroundColor: theme.mutedText }}
        >
          <BottomSheetScrollView
            style={styles.bottomSheetContent}
            contentContainerStyle={styles.bottomSheetScrollContent}
          >
            {!selectedVehicle ? (
              <>
                {/* Recent Locations */}
                {showLocationPicker && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Recent Locations
                  </Text>
                    {RECENT_LOCATIONS.map((location) => (
                      <Pressable
                        key={location.id}
                        style={({ pressed }) => [
                          styles.locationItem,
                          {
                            backgroundColor: theme.cardBackground,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        onPress={() => handleLocationSelect(location)}
                      >
                        <View style={[styles.locationItemIcon, { backgroundColor: `${theme.primary}15` }]}>
                          <Ionicons name={location.icon as any} size={20} color={theme.primary} />
                        </View>
                        <View style={styles.locationItemInfo}>
                          <Text style={[styles.locationItemName, { color: theme.text }]}>
                            {location.name}
                          </Text>
                          <Text style={[styles.locationItemAddress, { color: theme.subtleText }]}>
                            {location.address}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.mutedText} />
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Vehicle Selection */}
                {!showLocationPicker && destination && (
                  <>
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Choose a ride
                      </Text>
                      <Text style={[styles.sectionSubtitle, { color: theme.subtleText }]}>
                        Select your preferred vehicle type
                      </Text>
                    </View>

                    <View style={styles.vehicleList}>
                      {VEHICLE_TYPES.map((vehicle) => (
                        <VehicleTypeCard
                          key={vehicle.id}
                          vehicle={vehicle}
                          selected={selectedVehicle === vehicle.id}
                          onSelect={() => handleSelectVehicle(vehicle.id)}
                        />
                      ))}
                </View>
                  </>
                )}

                {/* Quick Actions */}
                {!destination && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Quick Actions
                </Text>
                    <View style={styles.quickActions}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.quickActionButton,
                          {
                            backgroundColor: `${theme.primary}15`,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        onPress={() => router.push("/(core)/ride/history")}
                      >
                        <Ionicons name="time-outline" size={24} color={theme.primary} />
                        <Text style={[styles.quickActionText, { color: theme.text }]}>
                          Ride History
                </Text>
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          styles.quickActionButton,
                          {
                            backgroundColor: `${theme.primary}15`,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        onPress={() => router.push("/(core)/ride/payment")}
                      >
                        <Ionicons name="card-outline" size={24} color={theme.primary} />
                        <Text style={[styles.quickActionText, { color: theme.text }]}>
                          Payment
                  </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Booking Summary */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Trip Summary
                  </Text>
                  <View style={styles.tripSummary}>
                    <View style={styles.tripLocation}>
                      <View style={[styles.tripDot, { backgroundColor: theme.primary }]} />
                      <View style={styles.tripLocationInfo}>
                        <Text style={[styles.tripLocationLabel, { color: theme.subtleText }]}>
                          From
                        </Text>
                        <Text style={[styles.tripLocationValue, { color: theme.text }]}>
                          {pickupLocation}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.tripLine, { backgroundColor: theme.border }]} />
                    <View style={styles.tripLocation}>
                      <View style={[styles.tripDot, { backgroundColor: theme.success }]} />
                      <View style={styles.tripLocationInfo}>
                        <Text style={[styles.tripLocationLabel, { color: theme.subtleText }]}>
                          To
                        </Text>
                        <Text style={[styles.tripLocationValue, { color: theme.text }]}>
                          {destination}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.tripDetails, { backgroundColor: theme.surface }]}>
                    <View style={styles.tripDetailRow}>
                      <Text style={[styles.tripDetailLabel, { color: theme.subtleText }]}>
                        Vehicle
                      </Text>
                      <Text style={[styles.tripDetailValue, { color: theme.text }]}>
                        {VEHICLE_TYPES.find((v) => v.id === selectedVehicle)?.name}
                      </Text>
                    </View>
                    <View style={styles.tripDetailRow}>
                      <Text style={[styles.tripDetailLabel, { color: theme.subtleText }]}>
                        Estimated Time
                      </Text>
                      <Text style={[styles.tripDetailValue, { color: theme.text }]}>
                        {VEHICLE_TYPES.find((v) => v.id === selectedVehicle)?.eta}
                      </Text>
                    </View>
                    <View style={styles.tripDetailRow}>
                      <Text style={[styles.tripDetailLabel, { color: theme.subtleText }]}>
                        Price
                      </Text>
                      <Text style={[styles.tripDetailPrice, { color: theme.primary }]}>
                        {VEHICLE_TYPES.find((v) => v.id === selectedVehicle)?.price}
                      </Text>
                    </View>
                  </View>
              </View>

                {/* Book Ride Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.bookButton,
                    {
                      backgroundColor: theme.primary,
                      opacity: pressed || isBooking ? 0.8 : 1,
                    },
                  ]}
                  onPress={handleBookRide}
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <Text style={styles.bookButtonText}>Booking...</Text>
                  ) : (
                    <>
                      <Text style={styles.bookButtonText}>Book Ride</Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </>
                  )}
                </Pressable>

                    <Pressable
                  style={styles.changeVehicleButton}
                  onPress={() => {
                    setSelectedVehicle(null);
                    bottomSheetRef.current?.snapToIndex(1);
                  }}
                >
                  <Text style={[styles.changeVehicleText, { color: theme.primary }]}>
                    Change Vehicle
                  </Text>
                </Pressable>
              </>
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
  },
  mapMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  topControls: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  controlButton: {
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
  locationInputsContainer: {
    position: "absolute",
    top: 110,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  locationInputWrapper: {
    gap: 8,
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  locationConnector: {
    width: 2,
    height: 20,
    marginLeft: 16,
    marginVertical: 4,
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetScrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  locationItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationItemInfo: {
    flex: 1,
  },
  locationItemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  locationItemAddress: {
    fontSize: 14,
  },
  vehicleList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    position: "relative",
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  vehicleMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vehicleMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vehicleMetaText: {
    fontSize: 12,
  },
  vehiclePrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 12,
    right: 12,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tripSummary: {
    marginBottom: 16,
  },
  tripLocation: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tripDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  tripLocationInfo: {
    flex: 1,
  },
  tripLocationLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  tripLocationValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  tripLine: {
    width: 2,
    height: 20,
    marginLeft: 5,
    marginBottom: 12,
  },
  tripDetails: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  tripDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripDetailLabel: {
    fontSize: 14,
  },
  tripDetailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  tripDetailPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 8,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  changeVehicleButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  changeVehicleText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
