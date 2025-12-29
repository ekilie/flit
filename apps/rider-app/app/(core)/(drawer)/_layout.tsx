import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/ctx';
import { useCurrentTheme } from '@/context/CentralTheme';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user, signOut } = useAuth();
  const theme = useCurrentTheme();
  const [isLoading, setIsLoading] = useState(false);

  const userInfo = useMemo(() => user || {}, [user]);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [signOut]);

  const gradientColors: [string, string, ...string[]] = theme.isDark 
    ? ['#ffc800', '#ff9500'] 
    : ['#ffc800', '#ff9500'];

  const menuItems = [
    {
      id: 'history',
      label: 'Ride History',
      icon: 'time-outline',
      route: '/(core)/ride/history',
    },
    {
      id: 'payment',
      label: 'Payment Methods',
      icon: 'wallet-outline',
      route: '/(core)/ride/payment',
    },
    {
      id: 'promotions',
      label: 'Promotions',
      icon: 'pricetag-outline',
      route: '/(core)/ride/promotions',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'notifications-outline',
      route: '/(core)/ride/notifications',
    },
  ];

  return (
    <View style={[styles.drawerContainer, { backgroundColor: theme.background }]}>
      {/* Header Section with User Info */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)' }]}>
              <View style={[styles.avatarCircle, { backgroundColor: theme.isDark ? '#2A2A2A' : '#FFFFFF' }]}>
                <Ionicons 
                  name="person" 
                  size={24} 
                  color={theme.isDark ? '#FFFFFF' : '#FFC800'} 
                />
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.isDark ? '#1A1A1A' : '#1A1A1A' }]} numberOfLines={1}>
                {(userInfo as any)?.fullName || (userInfo as any)?.name || 'Rider'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.isDark ? 'rgba(26,26,26,0.8)' : 'rgba(26,26,26,0.8)' }]} numberOfLines={1}>
                {(userInfo as any)?.email || 'rider@flit.com'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Drawer Menu Items */}
      <DrawerContentScrollView 
        {...props} 
        style={[styles.drawerLinks, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.drawerLinksContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.items}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem, 
                { 
                  backgroundColor: theme.surface,
                  borderColor: theme.border
                }
              ]}
              onPress={() => {
                props.navigation.closeDrawer();
                router.push(item.route as any);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.isDark ? '#2A2A2A' : '#F5F5F5' }]}>
                <Ionicons name={item.icon as any} size={22} color={theme.isDark ? '#FFC800' : '#FF9800'} />
              </View>
              <Text style={[styles.menuItemText, { color: theme.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.subtleText} />
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Footer Section */}
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.footerItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => {
            props.navigation.closeDrawer();
            router.push("/settings");
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: theme.isDark ? '#2A2A2A' : '#F5F5F5' }]}>
            <Ionicons name="settings-outline" size={20} color={theme.isDark ? '#FFC800' : '#FF9800'} />
          </View>
          <Text style={[styles.footerText, { color: theme.text }]}>Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.subtleText} />
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={[styles.signOutButton, { opacity: isLoading ? 0.5 : 1 }]}
          onPress={handleSignOut}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#ff3b30', '#ff6b6b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signOutGradient}
          >
            <View style={styles.signOutIcon}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.signOutText}>
              {isLoading ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function Layout() {
  const theme = useCurrentTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerStyle: [
            styles.drawerStyle,
            { 
              backgroundColor: theme.background,
              borderRightWidth: StyleSheet.hairlineWidth,
              borderRightColor: theme.border
            }
          ],
          drawerActiveBackgroundColor: theme.isDark ? 'rgba(255, 200, 0, 0.1)' : 'rgba(255, 152, 0, 0.1)',
          drawerActiveTintColor: theme.isDark ? '#ffc800' : '#ff9800',
          drawerInactiveTintColor: theme.subtleText,
          drawerLabelStyle: [styles.drawerLabelStyle, { color: theme.text }],
          headerShown: false,
          drawerType: 'slide',
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    borderRadius: 25,
    padding: 4,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
  },
  drawerLinks: {
    flex: 1,
  },
  drawerLinksContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  items: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 10,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 0,
  },
  signOutButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ff3b30',
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  signOutIcon: {
    marginRight: 10,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  drawerStyle: {
    width: width * 0.82,
  },
  drawerLabelStyle: {
    fontWeight: '500',
    fontSize: 15,
    marginLeft: -20,
  },
});