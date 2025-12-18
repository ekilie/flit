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
            backgroundColor: theme.colorScheme === "dark" ? "#000" : "#fff",
            borderTopWidth: 0.5,
            borderTopColor: "rgba(0, 0, 0, 0.16)",
            paddingVertical: 20,
            height: 85,
          },
          tabBarActiveTintColor:
            Colors.tabColors[route.name as keyof typeof Colors.tabColors] ||
            theme.primary,
          tabBarInactiveTintColor: theme.isDark ? "#666666" : "#999999",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        })}
      >
        <Tabs.Screen
          name="feed"
          options={{
            title: "Listen",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="headphones" tabName="feed" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                name="align-left"
                tabName="insights"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="voice-memory"
          options={{
            title: "Memories",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                name="microphone"
                tabName="voice-memory"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="me"
          options={{
            title: "Me",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="user" tabName="me" focused={focused} />
            ),
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