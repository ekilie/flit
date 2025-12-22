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
  Switch,
  Text,
  View,
} from "react-native";

// Tanzania payment methods
const PAYMENT_METHODS = [
  {
    id: "1",
    type: "card",
    name: "Visa •••• 1234",
    icon: "card-outline",
    isDefault: true,
    expiry: "12/25",
    provider: "CRDB Bank",
  },
  {
    id: "2",
    type: "mobile",
    name: "M-Pesa",
    icon: "phone-portrait-outline",
    isDefault: false,
    phone: "+255 712 345 678",
  },
  {
    id: "3",
    type: "mobile",
    name: "Airtel Money",
    icon: "phone-portrait-outline",
    isDefault: false,
    phone: "+255 765 432 109",
  },
  {
    id: "4",
    type: "mobile",
    name: "Tigo Pesa",
    icon: "phone-portrait-outline",
    isDefault: false,
    phone: "+255 654 321 098",
  },
  {
    id: "5",
    type: "cash",
    name: "Malipo kwa Mkono",
    icon: "cash-outline",
    isDefault: false,
  },
];

interface PaymentMethodItemProps {
  method: typeof PAYMENT_METHODS[0];
  isSelected: boolean;
  onSelect: () => void;
  onSetDefault?: () => void;
}

const PaymentMethodItem: React.FC<PaymentMethodItemProps> = ({
  method,
  isSelected,
  onSelect,
  onSetDefault,
}) => {
  const theme = useCurrentTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.paymentItem,
        {
          backgroundColor: theme.cardBackground,
          borderColor: isSelected ? theme.primary : theme.border,
          borderWidth: isSelected ? 2 : 1,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onSelect}
    >
      <View style={styles.paymentLeft}>
        <View style={[styles.paymentIcon, { backgroundColor: `${theme.primary}15` }]}>
          <Ionicons name={method.icon as any} size={24} color={theme.primary} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentName, { color: theme.text }]}>{method.name}</Text>
          {method.expiry && (
            <Text style={[styles.paymentExpiry, { color: theme.subtleText }]}>
              Inaisha {method.expiry}
            </Text>
          )}
          {method.phone && (
            <Text style={[styles.paymentExpiry, { color: theme.subtleText }]}>
              {method.phone}
            </Text>
          )}
          {method.provider && (
            <Text style={[styles.paymentExpiry, { color: theme.subtleText }]}>
              {method.provider}
            </Text>
          )}
          {method.isDefault && (
            <View style={[styles.defaultBadge, { backgroundColor: `${theme.primary}15` }]}>
              <Text style={[styles.defaultText, { color: theme.primary }]}>Chaguo Kuu</Text>
            </View>
          )}
        </View>
      </View>
      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
    </Pressable>
  );
};

export default function PaymentScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const [paymentMethods, setPaymentMethods] = useState(PAYMENT_METHODS);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [autoPay, setAutoPay] = useState(true);

  const handleSelectMethod = (methodId: string) => {
    haptics.selection();
    setSelectedMethod(methodId);
  };

  const handleAddPayment = () => {
    haptics.medium();
    // Navigate to add payment screen
    router.push("/(core)/ride/add-payment" as any);
  };

  const handleSetDefault = (methodId: string) => {
    haptics.success();
    setPaymentMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === methodId }))
    );
  };

  const handleDeleteMethod = (methodId: string) => {
    haptics.medium();
    setPaymentMethods((prev) => prev.filter((m) => m.id !== methodId));
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
            <Text style={[styles.headerTitle, { color: theme.text }]}>Njia za Malipo</Text>
            <Text style={[styles.headerSubtitle, { color: theme.subtleText }]}>
              Simamia chaguzi zako za malipo
            </Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Auto Pay Toggle */}
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Malipo Otomatiki
                </Text>
                <Text style={[styles.settingDescription, { color: theme.subtleText }]}>
                  Lipa otomatiki kwa kutumia njia yako ya kawaida baada ya kila safari
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

          {/* Payment Methods */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Njia za Malipo
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  {
                    backgroundColor: `${theme.primary}15`,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleAddPayment}
              >
                <Ionicons name="add" size={20} color={theme.primary} />
                <Text style={[styles.addButtonText, { color: theme.primary }]}>Ongeza</Text>
              </Pressable>
            </View>

            <View style={styles.paymentList}>
              {paymentMethods.map((method) => (
                <PaymentMethodItem
                  key={method.id}
                  method={method}
                  isSelected={selectedMethod === method.id}
                  onSelect={() => handleSelectMethod(method.id)}
                />
              ))}
            </View>
          </View>

          {/* Payment Info */}
          <View style={[styles.infoSection, { backgroundColor: `${theme.primary}10` }]}>
            <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.subtleText }]}>
              Taarifa zako za malipo zimehifadhiwa kwa usalama. Hatuhifadhi maelezo kamili ya kadi yako.
            </Text>
          </View>
        </ScrollView>
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
  paymentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentExpiry: {
    fontSize: 13,
  },
  defaultBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: "600",
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
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

