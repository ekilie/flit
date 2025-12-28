import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import Api from "@/lib/api";
import { Payment, PaymentMethod } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { toast } from "yooo-native";

interface PaymentItemProps {
  payment: Payment;
  onPress: () => void;
}

const PaymentItem: React.FC<PaymentItemProps> = ({ payment, onPress }) => {
  const theme = useCurrentTheme();

  const getPaymentIcon = (method: PaymentMethod): string => {
    const iconMap: Record<PaymentMethod, string> = {
      [PaymentMethod.CARD]: "card-outline",
      [PaymentMethod.CASH]: "cash-outline",
      [PaymentMethod.WALLET]: "wallet-outline",
      [PaymentMethod.MOBILE_MONEY]: "phone-portrait-outline",
    };
    return iconMap[method] || "card-outline";
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      completed: "#4CAF50",
      pending: "#FF9800",
      processing: "#2196F3",
      failed: "#F44336",
      refunded: "#9C27B0",
    };
    return colorMap[status.toLowerCase()] || "#607D8B";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.paymentItem,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.paymentLeft}>
        <View style={[styles.paymentIcon, { backgroundColor: `${theme.primary}15` }]}>
          <Ionicons name={getPaymentIcon(payment.method) as any} size={24} color={theme.primary} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentAmount, { color: theme.text }]}>
            TSh {payment.amount.toLocaleString()}
          </Text>
          <Text style={[styles.paymentMethod, { color: theme.subtleText }]}>
            {payment.method.replace("_", " ")}
          </Text>
          <Text style={[styles.paymentDate, { color: theme.mutedText }]}>
            {formatDate(payment.createdAt)}
          </Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(payment.status)}15` }]}>
        <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
          {payment.status}
        </Text>
      </View>
    </Pressable>
  );
};

export default function PaymentScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoPay, setAutoPay] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const user = await Api.getCurrentUser();
      const userData = user.data || user;
      const userPayments = await Api.getPaymentsByUser(userData.id);
      
      // Sort by most recent first
      userPayments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setPayments(userPayments);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  const handlePaymentPress = (payment: Payment) => {
    haptics.selection();
    // Navigate to payment details or ride details
    if (payment.rideId) {
      router.push({
        pathname: "/(core)/ride/details",
        params: { rideId: payment.rideId.toString() },
      } as any);
    }
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              {
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Payment History</Text>
            <Text style={[styles.headerSubtitle, { color: theme.subtleText }]}>
              View your payment transactions
            </Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.subtleText }]}>
              Loading payments...
            </Text>
          </View>
        ) : (
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
            {/* Auto Pay Toggle */}
            <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: theme.text }]}>
                    Auto Pay
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.subtleText }]}>
                    Automatically charge your default payment method after each ride
                  </Text>
                </View>
                <Switch
                  value={autoPay}
                  onValueChange={setAutoPay}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={autoPay ? "white" : theme.mutedText}
                />
              </View>
            </View>

            {/* Payment History */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Recent Transactions
                </Text>
              </View>

              {payments.length > 0 ? (
                <View style={styles.paymentList}>
                  {payments.map((payment) => (
                    <PaymentItem
                      key={payment.id}
                      payment={payment}
                      onPress={() => handlePaymentPress(payment)}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={64} color={theme.mutedText} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No Payments Yet
                  </Text>
                  <Text style={[styles.emptyText, { color: theme.subtleText }]}>
                    Your payment history will appear here
                  </Text>
                </View>
              )}
            </View>

            {/* Payment Info */}
            <View style={[styles.infoSection, { backgroundColor: `${theme.primary}10` }]}>
              <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.subtleText }]}>
                Your payment information is encrypted and secure. We never store your full card details.
              </Text>
            </View>
          </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  paymentList: {
    gap: 12,
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    position: "relative",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    textTransform: "capitalize",
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  infoSection: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

