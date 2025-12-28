import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
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

  const gradientColors = (theme.isDark 
    ? ['#ffc800', '#ffb700'] 
    : ['#ffc800', '#ffb700']) as [string, string, ...string[]];

  return (
    <View style={[styles.drawerContainer, { backgroundColor: theme.background }]}>
      {/* Header Section with User Info */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color={theme.text} />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
              {(userInfo as any)?.fullName || (userInfo as any)?.name || 'Rider'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
              {(userInfo as any)?.email || 'rider@flit.com'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Drawer Menu Items */}
      <DrawerContentScrollView 
        {...props} 
        style={[styles.drawerLinks, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.drawerLinksContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.items}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.surface }]}
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/(core)/ride/history');
            }}
          >
            <Ionicons name="time-outline" size={22} color={theme.text} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Ride History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.surface }]}
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/(core)/ride/payment');
            }}
          >
            <Ionicons name="wallet-outline" size={22} color={theme.text} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Payment Methods</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.surface }]}
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/(core)/ride/promotions');
            }}
          >
            <Ionicons name="pricetag-outline" size={22} color={theme.text} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Promotions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: theme.surface }]}
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/(core)/ride/notifications');
            }}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.text} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>Notifications</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Footer Section */}
      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.footerItem, { backgroundColor: theme.background }]}
          onPress={() => {
            props.navigation.closeDrawer();
            router.push("/settings");
          }}
        >
          <Ionicons name="settings-outline" size={20} color={theme.text} />
          <Text style={[styles.footerText, { color: theme.text }]}>Settings</Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={[styles.signOutButton, { opacity: isLoading ? 0.5 : 1 }]}
          onPress={handleSignOut}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#ff3b30', '#ff6b6b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signOutGradient}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
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
            { backgroundColor: theme.background }
          ],
          drawerActiveBackgroundColor: 'rgba(255, 200, 0, 0.1)',
          drawerActiveTintColor: '#ffc800',
          drawerInactiveTintColor: theme.subtleText,
          drawerLabelStyle: [styles.drawerLabelStyle, { color: theme.text }],
          headerShown: false,
          drawerType: 'slide',
        }}
      >
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    padding: 3,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  drawerLinks: {
    flex: 1,
  },
  drawerLinksContent: {
    paddingTop: 10,
  },
  items: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding:20,
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 15,
  },
  footer: {
    padding: 15,
    paddingBottom: 30,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 10,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  signOutButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  drawerStyle: {
    width: width * 0.8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  drawerLabelStyle: {
    fontWeight: '600',
    fontSize: 15,
    marginLeft: -20,
  },
});
