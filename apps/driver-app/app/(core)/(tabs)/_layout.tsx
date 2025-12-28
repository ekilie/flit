import Colors from "@/constants/Colors";
import { ThemeStatusBar, useCurrentTheme } from "@/context/CentralTheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  tabName: keyof typeof Colors.tabColors;
  focused: boolean;
}) {
  const theme = useCurrentTheme();

  const iconColor = props.focused
    ? Colors.tabColors[props.tabName]
    : theme.isDark
    ? "#666666"
    : "#999999";

  return (
    <FontAwesome
      size={26}
      style={{ marginBottom: -3 }}
      name={props.name}
      color={iconColor}
    />
  );
}

export default function TabsLayout() {
  const theme = useCurrentTheme();

  return (
    <View style={styles.container}>
      <ThemeStatusBar />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.isDark ? "#000" : "#fff",
            borderTopWidth: 0.5,
            borderTopColor: "rgba(0, 0, 0, 0.16)",
            paddingVertical: 18,
            height: 82,
          },
          tabBarActiveTintColor:
            Colors.tabColors[route.name as keyof typeof Colors.tabColors] ??
            theme.primary,
          tabBarInactiveTintColor: theme.isDark ? "#666666" : "#999999",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        })}
      >
        {/* HOME TAB - Driver Map View */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="map-marker" tabName="ride" focused={focused} />
            ),
          }}
        />

        {/* EARNINGS TAB */}
        <Tabs.Screen
          name="earnings"
          options={{
            title: "Earnings",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="money" tabName="profile" focused={focused} />
            ),
          }}
        />

        {/* PROFILE / ACCOUNT TAB */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Account",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="user" tabName="profile" focused={focused} />
            ),
          }}
        />
        
        {/* HIDE RIDE TAB - Not needed for drivers */}
        <Tabs.Screen
          name="ride"
          options={{
            href: null, // Hide this tab
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
