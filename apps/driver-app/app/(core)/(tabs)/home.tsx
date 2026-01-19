import ScreenLayout from "@/components/ScreenLayout";
import Colors, { brandColor } from "@/constants/Colors";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import { toast } from "yooo-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { LIGHT_MAP_STYLE } from "@/constants/mapstyle";

const { width } = Dimensions.get("window");

// Default location: Dar es Salaam center
const DEFAULT_REGION = {
  latitude: -6.7924,
  longitude: 39.2083,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// UI Color Constants - extracted for theme consistency
const UI_COLORS = {
  online: brandColor,        // Green for online status and earnings
  onlineGradient: '#059669', // Darker green for gradient
  offline: '#6b7280',       // Gray for offline status
  offlineDark: '#1f2937',   // Dark gray for offline button
  offlineDarker: '#111827', // Darker gray for gradient
  earnings: brandColor,      // Green for earnings icon
  trips: '#fbbf24',         // Amber for trips/navigation
  time: '#3b82f6',          // Blue for time/clock
  iconBg: 'rgba(16, 185, 129, 0.1)',   // Light green background for icons
  iconBgSubtle: 'rgba(16, 185, 129, 0.08)', // Subtle green for stat icons
  border: 'rgba(0, 0, 0, 0.05)',       // Subtle border
  borderSeparator: 'rgba(0, 0, 0, 0.06)', // Separator line
};

export default function DriverHomeScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();

  // Driver state
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Today's earnings data (mock for now)
  const [todayEarnings, setTodayEarnings] = useState(45000);
  const [tripCount, setTripCount] = useState(5);
  const [onlineTime, setOnlineTime] = useState("3h 24m");

  const mapRef = React.useRef<MapView>(null);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          toast.error('Location permission is required to go online');
          setIsLoadingLocation(false);
          return;
        }

        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setCurrentLocation(location);
        setIsLoadingLocation(false);
      } catch (error) {
        console.error('Error getting location:', error);
        toast.error('Failed to get your location');
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  // Track location when online
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    if (isOnline && locationPermission) {
      (async () => {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // or when moved 10 meters
          },
          (location) => {
            setCurrentLocation(location);
            // TODO: Send location to backend via Socket.IO
          }
        );
      })();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isOnline, locationPermission]);

  const toggleOnlineStatus = async () => {
    if (!locationPermission) {
      toast.error('Please grant location permission to go online');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isOnline) {
      // Going online
      setIsOnline(true);
      toast.success('You are now online and can receive ride requests');
    } else {
      // Going offline
      setIsOnline(false);
      toast.info('You are now offline');
    }
  };

  const centerOnCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <ScreenLayout fullScreen>

      <StatusBar style="dark" translucent backgroundColor="transparent" />

      <View style={styles.container}>
        {/* Map View */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={DEFAULT_REGION}
          showsTraffic={true}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          customMapStyle={LIGHT_MAP_STYLE}
          region={currentLocation ? {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          } : undefined}
        >
          {/* Driver's current location marker */}
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.driverMarker, isOnline && styles.driverMarkerOnline]}>
                <MaterialCommunityIcons
                  name="car"
                  size={24}
                  color="#fff"
                />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Online/Offline Toggle - Modern Bolt-style */}
        <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
          <View style={styles.statusContent}>
            <View style={styles.statusIconContainer}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: isOnline ? UI_COLORS.online : UI_COLORS.offline }
              ]} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusLabel, { color: theme.text }]}>
                {isOnline ? "You're Online" : "You're Offline"}
              </Text>
              <Text style={[styles.statusSubtext, { color: theme.subtleText }]}>
                {isOnline
                  ? "Ready to accept requests"
                  : "Tap to start earning"}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={toggleOnlineStatus}
            disabled={isLoadingLocation}
            activeOpacity={0.7}
            style={styles.toggleButtonContainer}
          >
            <LinearGradient
              colors={isOnline ? [UI_COLORS.online, UI_COLORS.onlineGradient] : [UI_COLORS.offlineDark, UI_COLORS.offlineDarker]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.toggleButton, isLoadingLocation && styles.toggleButtonDisabled]}
            >
              {isLoadingLocation ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={isOnline ? "pause-circle-outline" : "play-circle-outline"}
                    size={20}
                    color="#fff"
                    style={styles.toggleIcon}
                  />
                  <Text style={styles.toggleButtonText}>
                    {isOnline ? 'Stop' : 'Start'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Earnings Summary Card - Enhanced Design */}
        <View style={[styles.earningsCard, { backgroundColor: theme.card }]}>
          <View style={styles.earningsHeader}>
            <View style={styles.earningsHeaderLeft}>
              <View style={styles.earningsIconContainer}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={20}
                  color={UI_COLORS.earnings}
                />
              </View>
              <Text style={[styles.earningsTitle, { color: theme.text }]}>
                Today's Summary
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toast.info('Earnings details coming soon');
              }}
              style={styles.viewDetailsButton}
            >
              <Text style={styles.viewDetailsLink}>Details</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={UI_COLORS.earnings}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.earningsStats}>
            <View style={styles.statItem}>
              <View style={styles.statIconWrapper}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={18}
                  color={UI_COLORS.earnings}
                />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                TSh {todayEarnings.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                Total Earnings
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconWrapper}>
                <MaterialCommunityIcons
                  name="map-marker-path"
                  size={18}
                  color={UI_COLORS.trips}
                />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {tripCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                Completed Trips
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconWrapper}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={18}
                  color={UI_COLORS.time}
                />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {onlineTime}
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                Time Online
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons - Bottom Right */}
        <View style={styles.actionButtons}>
          {currentLocation && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSpacing, { backgroundColor: theme.card }]}
              onPress={centerOnCurrentLocation}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={22}
                color={theme.text}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(core)/settings');
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Enhanced Driver Marker
  driverMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  driverMarkerOnline: {
    backgroundColor: UI_COLORS.online,
    borderColor: '#fff',
  },
  // Modern Status Card
  statusCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    marginRight: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: UI_COLORS.online,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statusSubtext: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButtonContainer: {
    alignSelf: 'stretch',
  },
  toggleButton: {
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  toggleButtonDisabled: {
    opacity: 0.6,
  },
  toggleIcon: {
    marginRight: 8,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Enhanced Earnings Card
  earningsCard: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.borderSeparator,
  },
  earningsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: UI_COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  earningsTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewDetailsLink: {
    fontSize: 14,
    fontWeight: '600',
    color: UI_COLORS.earnings,
    marginRight: 2,
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: UI_COLORS.iconBgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.7,
  },
  // Action Buttons
  actionButtons: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 240 : 220,
  },
  actionButtonSpacing: {
    marginBottom: 12,
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
});
