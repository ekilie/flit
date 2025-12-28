import ScreenLayout from "@/components/ScreenLayout";
import Colors from "@/constants/Colors";
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
  Switch,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import { toast } from "yooo-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

// Default location: Dar es Salaam center
const DEFAULT_REGION = {
  latitude: -6.7924,
  longitude: 39.2083,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
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
    <ScreenLayout>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      
      <View style={styles.container}>
        {/* Map View */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={DEFAULT_REGION}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
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
                  size={20} 
                  color="#fff" 
                />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Online/Offline Toggle */}
        <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusLabel, { color: theme.subtleText }]}>
                {isOnline ? "You're Online" : "You're Offline"}
              </Text>
              <Text style={[styles.statusSubtext, { color: theme.mutedText }]}>
                {isOnline 
                  ? "You can receive ride requests" 
                  : "Go online to start earning"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleOnlineStatus}
              disabled={isLoadingLocation}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isOnline ? ['#10b981', '#059669'] : ['#6b7280', '#4b5563']}
                style={styles.toggleButton}
              >
                {isLoadingLocation ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.toggleButtonText}>
                    {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings Summary Card */}
        <View style={[styles.earningsCard, { backgroundColor: theme.card }]}>
          <View style={styles.earningsHeader}>
            <Text style={[styles.earningsTitle, { color: theme.text }]}>
              📊 Today's Summary
            </Text>
            <TouchableOpacity onPress={() => {
              // TODO: Create earnings details screen
              toast.info('Earnings details coming soon');
            }}>
              <Text style={[styles.viewDetailsLink, { color: theme.primary }]}>
                View Details
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.earningsStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                TSh {todayEarnings.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                Earnings
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {tripCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                Trips
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {onlineTime}
              </Text>
              <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                Online
              </Text>
            </View>
          </View>
        </View>

        {/* Center on Location Button */}
        {currentLocation && (
          <TouchableOpacity
            style={[styles.centerButton, { backgroundColor: theme.card }]}
            onPress={centerOnCurrentLocation}
          >
            <MaterialCommunityIcons 
              name="crosshairs-gps" 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
        )}

        {/* Settings Button */}
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.card }]}
          onPress={() => router.push('/(core)/settings')}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
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
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  driverMarkerOnline: {
    backgroundColor: '#10b981',
  },
  statusCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 13,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  earningsCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewDetailsLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 220,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsButton: {
    position: 'absolute',
    left: 16,
    bottom: 220,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
