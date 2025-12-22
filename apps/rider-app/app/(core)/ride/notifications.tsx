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
  View,
} from "react-native";

// Dummy notifications data
const NOTIFICATIONS = [
  {
    id: "1",
    type: "ride",
    title: "Trip Completed",
    message: "Safari yako kwenda Julius Nyerere Airport imekamilika. Karibia dereva wako!",
    timestamp: "2024-01-15T14:30:00",
    read: false,
    icon: "checkmark-circle",
    color: "#4CAF50",
  },
  {
    id: "2",
    type: "promo",
    title: "New 30% Discount!",
    message: "Tumia msimbo WEEKEND30 na upate punguzo la 30% kwa safari zako za wikendi.",
    timestamp: "2024-01-15T10:00:00",
    read: false,
    icon: "pricetag",
    color: "#FF9800",
  },
  {
    id: "3",
    type: "payment",
    title: "Payment Completed",
    message: "Malipo yako ya TSh 25,000 kwa safari #1234 yamefanikiwa.",
    timestamp: "2024-01-15T09:15:00",
    read: true,
    icon: "card",
    color: "#2196F3",
  },
  {
    id: "4",
    type: "ride",
    title: "Driver Arriving",
    message: "Juma Mwangi anakuja kwa gari Toyota Corolla (T 123 ABC). ETA: 5 dakika.",
    timestamp: "2024-01-14T18:45:00",
    read: true,
    icon: "car",
    color: "#4CAF50",
  },
  {
    id: "5",
    type: "system",
    title: "App Update",
    message: "Toleo jipya la programu lipo. Sasisha ili upate vipengele vipya na maboresho.",
    timestamp: "2024-01-14T08:00:00",
    read: true,
    icon: "download",
    color: "#9C27B0",
  },
  {
    id: "6",
    type: "promo",
    title: "Welcome to Flit!",
    message: "Asante kwa kujiunga na Flit. Tumia msimbo WELCOME50 kwa punguzo la kwanza!",
    timestamp: "2024-01-13T12:00:00",
    read: true,
    icon: "gift",
    color: "#FF9800",
  },
];

interface NotificationItemProps {
  notification: typeof NOTIFICATIONS[0];
  onPress: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const theme = useCurrentTheme();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `min ${diffMins} ago`;
    if (diffHours < 24) return `hr ${diffHours} ago`;
    if (diffDays < 7) return `days ${diffDays} ago`;
    
    return date.toLocaleDateString("sw-TZ", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.notificationItem,
        {
          backgroundColor: notification.read ? theme.cardBackground : `${theme.primary}08`,
          borderLeftColor: notification.read ? theme.border : theme.primary,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${notification.color}15` }]}>
        <Ionicons
          name={notification.icon as any}
          size={24}
          color={notification.color}
        />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: theme.text }]}>
            {notification.title}
          </Text>
          {!notification.read && (
            <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
          )}
        </View>
        <Text
          style={[styles.notificationMessage, { color: theme.subtleText }]}
          numberOfLines={2}
        >
          {notification.message}
        </Text>
        <Text style={[styles.notificationTime, { color: theme.mutedText }]}>
          {formatTimestamp(notification.timestamp)}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          {
            backgroundColor: pressed ? `${theme.error}15` : "transparent",
          },
        ]}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Ionicons name="trash-outline" size={18} color={theme.error} />
      </Pressable>
    </Pressable>
  );
};

export default function NotificationsScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationPress = (id: string) => {
    haptics.selection();
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDeleteNotification = (id: string) => {
    haptics.medium();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    haptics.selection();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    haptics.medium();
    setNotifications([]);
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
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
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Text style={[styles.unreadCount, { color: theme.subtleText }]}>
                  {unreadCount} new
                </Text>
              )}
            </View>
          </View>
          
          {notifications.length > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.moreButton,
                {
                  backgroundColor: theme.cardBackground,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => {
                haptics.selection();
                // In production, show action sheet
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color={theme.text} />
            </Pressable>
          )}
        </View>

        {/* Filter Tabs */}
        {notifications.length > 0 && (
          <View style={[styles.filterTabs, { backgroundColor: theme.cardBackground }]}>
            <Pressable
              style={[
                styles.filterTab,
                filter === "all" && {
                  backgroundColor: `${theme.primary}15`,
                  borderBottomColor: theme.primary,
                },
              ]}
              onPress={() => {
                haptics.selection();
                setFilter("all");
              }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: filter === "all" ? theme.primary : theme.text,
                    fontWeight: filter === "all" ? "700" : "600",
                  },
                ]}
              >
                All ({notifications.length})
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterTab,
                filter === "unread" && {
                  backgroundColor: `${theme.primary}15`,
                  borderBottomColor: theme.primary,
                },
              ]}
              onPress={() => {
                haptics.selection();
                setFilter("unread");
              }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: filter === "unread" ? theme.primary : theme.text,
                    fontWeight: filter === "unread" ? "700" : "600",
                  },
                ]}
              >
                Unread ({unreadCount})
              </Text>
            </Pressable>
          </View>
        )}

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <>
            {unreadCount > 0 && filter === "all" && (
              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor: `${theme.primary}15`,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={handleMarkAllAsRead}
                >
                  <Ionicons name="checkmark-done" size={18} color={theme.primary} />
                  <Text style={[styles.actionText, { color: theme.primary }]}>
                    Mark all as read
                  </Text>
                </Pressable>
              </View>
            )}
            
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleNotificationPress(notification.id)}
                  onDelete={() => handleDeleteNotification(notification.id)}
                />
              ))}
            </ScrollView>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons
                name={
                  filter === "unread"
                    ? "checkmark-done-circle-outline"
                    : "notifications-outline"
                }
                size={64}
                color={theme.primary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {filter === "unread" ? "All zimesomwa!" : "Hakuna Notifications"}
            </Text>
            <Text style={[styles.emptyText, { color: theme.subtleText }]}>
              {filter === "unread"
                ? "Umesoma arifa zako zote. Hongera!"
                : "Hutakuwa na arifa zozote za kuona hapa kwa sasa."}
            </Text>
            {filter === "unread" && notifications.length > 0 && (
              <Pressable
                style={({ pressed }) => [
                  styles.viewAllButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => setFilter("all")}
              >
                <Text style={styles.viewAllText}>Ona All</Text>
              </Pressable>
            )}
          </View>
        )}
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
    paddingTop: 60,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    fontSize: 24,
    fontWeight: "bold",
  },
  unreadCount: {
    fontSize: 13,
    marginTop: 2,
  },
  moreButton: {
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
  filterTabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabText: {
    fontSize: 14,
  },
  actions: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 32,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 24,
  },
  viewAllButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  viewAllText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
});
