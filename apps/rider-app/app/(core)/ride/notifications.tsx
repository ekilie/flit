import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import Api from "@/lib/api";
import { Notification } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { toast } from "yooo-native";

interface NotificationItemProps {
  notification: Notification;
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
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("sw-TZ", {
      month: "short",
      day: "numeric",
    });
  };

  // Icon mapping based on notification type
  const getIconForType = (type: string): string => {
    const iconMap: Record<string, string> = {
      ride_request: "car",
      ride_accepted: "checkmark-circle",
      ride_started: "play-circle",
      ride_completed: "checkmark-done-circle",
      ride_cancelled: "close-circle",
      driver_arrived: "navigate-circle",
      payment_received: "card",
      rating_received: "star",
      system: "information-circle",
    };
    return iconMap[type] || "notifications";
  };

  // Color mapping based on notification type
  const getColorForType = (type: string): string => {
    const colorMap: Record<string, string> = {
      ride_request: "#4CAF50",
      ride_accepted: "#4CAF50",
      ride_started: "#2196F3",
      ride_completed: "#4CAF50",
      ride_cancelled: "#F44336",
      driver_arrived: "#FF9800",
      payment_received: "#2196F3",
      rating_received: "#FFC107",
      system: "#9C27B0",
    };
    return colorMap[type] || "#607D8B";
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.notificationItem,
        {
          backgroundColor: notification.isRead ? theme.cardBackground : `${theme.primary}08`,
          borderLeftColor: notification.isRead ? theme.border : theme.primary,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${getColorForType(notification.type)}15` }]}>
        <Ionicons
          name={getIconForType(notification.type) as any}
          size={24}
          color={getColorForType(notification.type)}
        />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: theme.text }]}>
            {notification.title}
          </Text>
          {!notification.isRead && (
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
          {formatTimestamp(notification.createdAt)}
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
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchNotifications();
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    try {
      const user = await Api.getCurrentUser();
      const userData = user.data || user;
      setUserId(userData.id);
    } catch (error) {
      console.error("Failed to fetch user ID:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const user = await Api.getCurrentUser();
      const userData = user.data || user;
      const notifs = await Api.getNotificationsByUser(userData.id);
      setNotifications(notifs);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationPress = async (id: number) => {
    haptics.selection();
    
    // Mark as read
    try {
      await Api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    haptics.medium();
    try {
      await Api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    
    haptics.selection();
    try {
      await Api.markAllNotificationsAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
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
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.subtleText }]}>
              Loading notifications...
            </Text>
          </View>
        ) : (
          <>
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
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={theme.primary}
                      colors={[theme.primary]}
                    />
                  }
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
                  {filter === "unread" ? "All Read!" : "No Notifications"}
                </Text>
                <Text style={[styles.emptyText, { color: theme.subtleText }]}>
                  {filter === "unread"
                    ? "You've read all your notifications. Great job!"
                    : "You don't have any notifications to view at this time."}
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
                    <Text style={styles.viewAllText}>View All</Text>
                  </Pressable>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
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
