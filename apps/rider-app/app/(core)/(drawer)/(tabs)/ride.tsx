import ScreenLayout from "@/components/ScreenLayout";
import { Colors } from "@/constants/Colors";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';


import * as Location from 'expo-location';
import { alert, toast } from "yooo-native";
import { HapticFeedback } from "@/lib/haptics";
import { ActivityIndicator } from "react-native";
import Api from "@/lib/api";
import { useAuth } from "@/context/ctx";
import { pricingApi, FareEstimate } from "@/lib/api/pricing-api";

const { width, height } = Dimensions.get("window");

// Tanzania locations
const VEHICLE_TYPES = [
  {
    id: "economy",
    name: "Economy",
    icon: "car-outline",
    price: "TSh 15,000",
    eta: "5 min",
    description: "Affordable rides for everyday trips",
  },
  {
    id: "comfort",
    name: "Comfort",
    icon: "car-sport-outline",
    price: "TSh 25,000",
    eta: "7 min",
    description: "Extra legroom and comfort",
  },
  {
    id: "premium",
    name: "Premium",
    icon: "diamond-outline",
    price: "TSh 45,000",
    eta: "10 min",
    description: "Luxury vehicles with premium features",
  },
  {
    id: "xl",
    name: "XL",
    icon: "car-sport",
    price: "TSh 35,000",
    eta: "8 min",
    description: "Spacious rides for up to 6 passengers",
  },
];

const RECENT_LOCATIONS = [
  {
    id: "1",
    name: "Home",
    address: "Mikocheni, Dar es Salaam",
    icon: "home",
    coordinates: { latitude: -6.7735, longitude: 39.2395 }
  },
  {
    id: "2",
    name: "Work",
    address: "Posta Road, Dar es Salaam",
    icon: "briefcase",
    coordinates: { latitude: -6.8160, longitude: 39.2803 }
  },
  {
    id: "3",
    name: "Airport",
    address: "Julius Nyerere International Airport",
    icon: "airplane",
    coordinates: { latitude: -6.8781, longitude: 39.2026 }
  },
  {
    id: "4",
    name: "Mlimani City",
    address: "Sam Nujoma Road, Dar es Salaam",
    icon: "cart",
    coordinates: { latitude: -6.7730, longitude: 39.2120 }
  },
  {
    id: "5",
    name: "Coco Beach",
    address: "Msasani Peninsula, Dar es Salaam",
    icon: "water",
    coordinates: { latitude: -6.7583, longitude: 39.2738 }
  },
];

// Default map center (Dar es Salaam, Tanzania)
// const DEFAULT_COORDINATES = {
//   latitude: -6.7924,
//   longitude: 39.2083,
// };

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
  fareEstimate?: FareEstimate;
}

const VehicleTypeCard: React.FC<VehicleTypeCardProps> = ({
  vehicle,
  selected,
  onSelect,
  fareEstimate,
}) => {
  const theme = useCurrentTheme();

  // Format fare with surge indicator
  const getFareDisplay = () => {
    if (!fareEstimate) {
      return vehicle.price; // Fallback to static price
    }

    const hasSurge = fareEstimate.surgeMultiplier > 1.0;
    const fareText = `${fareEstimate.currency} ${fareEstimate.estimatedFare.toLocaleString()}`;
    
    if (hasSurge) {
      return `${fareText} (${fareEstimate.surgeMultiplier}x)`;
    }
    
    return fareText;
  };

  // Format distance and duration
  const getMetaDisplay = () => {
    if (!fareEstimate) {
      return vehicle.eta; // Fallback to static ETA
    }

    const minutes = Math.round(fareEstimate.duration / 60);
    return `${fareEstimate.distance.toFixed(1)} km • ${minutes} min`;
  };

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.vehicleName, { color: theme.text }]}>{vehicle.name}</Text>
          {fareEstimate && fareEstimate.surgeMultiplier > 1.0 && (
            <View style={{ backgroundColor: '#FF6B6B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                SURGE
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.vehicleDescription, { color: theme.subtleText }]}>
          {vehicle.description}
        </Text>
        <View style={styles.vehicleMeta}>
          <View style={styles.vehicleMetaItem}>
            <Ionicons name="time-outline" size={14} color={theme.mutedText} />
            <Text style={[styles.vehicleMetaText, { color: theme.mutedText }]}>
              {getMetaDisplay()}
            </Text>
          </View>
          <Text style={[styles.vehiclePrice, { color: theme.primary, fontWeight: '700' }]}>
            {getFareDisplay()}
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
  const { user } = useAuth();
  const navigation = useNavigation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  const [pickupLocation, setPickupLocation] = useState("Current Location");
  const [pickupCoordinates, setPickupCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [destination, setDestination] = useState("");
  const [destinationCoordinates, setDestinationCoordinates] = useState<{ latitude: number, longitude: number } | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [fareEstimates, setFareEstimates] = useState<Record<string, FareEstimate>>({});
  const [isLoadingFares, setIsLoadingFares] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        HapticFeedback("error");
        alert.dialog('Error', 'Permission to access location was denied\n Please grant permission to access your location', [
          {
            text: 'Grant',
            onPress: () => {
              Linking.openSettings().then(() => {
                getCurrentLocation();
              }).catch((error) => {
                alert.error('Error granting permission\n Please try again');
                console.error(error);
              });
            },
          },
        ]);
        return;
      }
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log('location', location);
      if (location) {
        setLocation(location);
        setPickupLocation(location.coords.latitude.toString() + ', ' + location.coords.longitude.toString());
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setPickupCoordinates(coords);
        console.log('pickupCoordinates', pickupCoordinates);



        requestAnimationFrame(() => {
          mapRef.current?.animateCamera(
            {
              center: coords,
              zoom: 16,
            },
            { duration: 800 }
          );
        });

      } else {
        alert.error('Error getting current location\n Please try again');
        console.error('error');
        HapticFeedback("error");
        alert.dialog('Error', 'Error getting current location\n Please try again', [
          {
            text: 'OK',
            onPress: () => {
              return;
            },
          },
        ]);
      }
    }

    getCurrentLocation();
  }, []);


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

  useEffect(() => {
    if (!pickupCoordinates || !destinationCoordinates || !mapRef.current) return;

    mapRef.current.fitToCoordinates(
      [pickupCoordinates, destinationCoordinates],
      {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      }
    );
  }, [destinationCoordinates, pickupCoordinates]);


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

  const handleBookRide = async () => {
    if (!selectedVehicle || !destination || !pickupCoordinates || !destinationCoordinates) {
      haptics.error();
      toast.error("Please select both pickup and destination");
      return;
    }

    if (!user?.id) {
      haptics.error();
      toast.error("User not authenticated");
      return;
    }

    try {
      haptics.success();
      setIsBooking(true);

      // Create ride request
      const rideData = {
        pickupLatitude: pickupCoordinates.latitude,
        pickupLongitude: pickupCoordinates.longitude,
        pickupAddress: pickupLocation,
        dropoffLatitude: destinationCoordinates.latitude,
        dropoffLongitude: destinationCoordinates.longitude,
        dropoffAddress: destination,
        vehicleType: selectedVehicle,
        riderId: user.id,
      };

      const createdRide = await Api.createRide(rideData);
      
      toast.success("Ride booked successfully!");
      
      // Navigate to active ride screen with the ride ID
      router.push({
        pathname: "/(core)/ride/active",
        params: { rideId: createdRide.id }
      });
    } catch (error: any) {
      console.error("Failed to book ride:", error);
      toast.error(error.message || "Failed to book ride");
      haptics.error();
    } finally {
      setIsBooking(false);
    }
  };

  const handleLocationSelect = async (location: typeof RECENT_LOCATIONS[0]) => {
    setDestination(location.address);
    setDestinationCoordinates(location.coordinates);
    setShowLocationPicker(false);
    bottomSheetRef.current?.snapToIndex(1);
    
    // Fetch fare estimates for all vehicle types
    if (pickupCoordinates) {
      await fetchFareEstimates(pickupCoordinates, location.coordinates);
    }
  };

  const fetchFareEstimates = async (
    pickup: { latitude: number; longitude: number },
    dropoff: { latitude: number; longitude: number }
  ) => {
    setIsLoadingFares(true);
    try {
      const estimates: Record<string, FareEstimate> = {};
      
      // Fetch estimates for all vehicle types in parallel
      await Promise.all(
        VEHICLE_TYPES.map(async (vehicleType) => {
          try {
            const estimate = await pricingApi.getFareEstimate({
              pickupLat: pickup.latitude,
              pickupLng: pickup.longitude,
              dropoffLat: dropoff.latitude,
              dropoffLng: dropoff.longitude,
              vehicleType: vehicleType.id,
            });
            estimates[vehicleType.id] = estimate;
          } catch (error) {
            console.error(`Failed to fetch fare for ${vehicleType.id}:`, error);
          }
        })
      );
      
      setFareEstimates(estimates);
    } catch (error) {
      console.error("Error fetching fare estimates:", error);
      toast.error("Failed to calculate fares");
    } finally {
      setIsLoadingFares(false);
    }
  };

  // Fetch fare estimates when destination changes
  useEffect(() => {
    if (pickupCoordinates && destinationCoordinates) {
      fetchFareEstimates(pickupCoordinates, destinationCoordinates);
    }
  }, [pickupCoordinates, destinationCoordinates]);

  return (
    <ScreenLayout styles={{ backgroundColor: Colors.light.background }} fullScreen>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Hamburger Menu Button */}
        <Pressable
          style={[styles.menuButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={() => {
            haptics.light();
            navigation.dispatch(DrawerActions.openDrawer());
          }}
        >
          <Ionicons name="menu" size={28} color={theme.text} />
        </Pressable>

        {/* Map View */}
        <Animated.View
          style={[
            styles.mapContainer,
            {
              transform: [{ scale: mapScale }],
            },
          ]}
        >
          {!pickupCoordinates && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ color: theme.text }}>Loading map...</Text>
            </View>
          )}
          {pickupCoordinates && (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                ...pickupCoordinates,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              showsUserLocation
              showsMyLocationButton
              showsCompass
              showsTraffic
              toolbarEnabled={true}
              userInterfaceStyle={theme.colorScheme === 'dark' ? 'dark' : 'light'}
            >
              {/* Pickup Marker */}
              <Marker
                coordinate={pickupCoordinates}
                title="Pickup Location"
                description={pickupLocation}
                pinColor={theme.primary}
              />

              {/* Destination Marker */}
              {destinationCoordinates && (
                <Marker
                  coordinate={destinationCoordinates}
                  title="Destination"
                  description={destination}
                  pinColor={theme.success || '#10b981'}
                />
              )}

              {/* Route Line */}
              {destinationCoordinates && (
                <Polyline
                  coordinates={[pickupCoordinates, destinationCoordinates]}
                  strokeColor={theme.primary}
                  strokeWidth={3}
                  lineDashPattern={[10, 5]}

                />
              )}
            </MapView>
          )}

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
                      {isLoadingFares && (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                          <ActivityIndicator size="large" color={theme.primary} />
                          <Text style={{ color: theme.mutedText, marginTop: 10 }}>
                            Calculating fares...
                          </Text>
                        </View>
                      )}
                      {!isLoadingFares && VEHICLE_TYPES.map((vehicle) => (
                        <VehicleTypeCard
                          key={vehicle.id}
                          vehicle={vehicle}
                          selected={selectedVehicle === vehicle.id}
                          onSelect={() => handleSelectVehicle(vehicle.id)}
                          fareEstimate={fareEstimates[vehicle.id]}
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
                      {/* <Pressable
                        style={({ pressed }) => [
                          styles.quickActionButton,
                          {
                            backgroundColor: `${theme.primary}15`,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        onPress={() => router.push("/(core)/ride/promotions")}
                      >
                        <Ionicons name="pricetag-outline" size={24} color={theme.primary} />
                        <Text style={[styles.quickActionText, { color: theme.text }]}>
                          Promotions
                        </Text>
                      </Pressable> */}
                    </View>
                    
                    {/* Welcome Message */}
                    <View style={[styles.welcomeCard, { backgroundColor: `${theme.primary}08`, borderColor: `${theme.primary}30` }]}>
                      <Ionicons name="information-circle-outline" size={20} color={theme.primary} style={styles.welcomeIcon} />
                      <Text style={[styles.welcomeText, { color: theme.text }]}>
                        Start a new ride with Flit, the best special hire & ride sharing app in Tanzania.
                      </Text>
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
                      <View style={[styles.tripDot, { backgroundColor: theme.success || '#10b981' }]} />
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
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 16,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
    zIndex: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  welcomeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  welcomeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  welcomeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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