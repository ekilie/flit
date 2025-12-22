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
  TextInput,
  View,
} from "react-native";

// Dummy promotions data
const ACTIVE_PROMOS = [
  {
    id: "1",
    code: "WELCOME50",
    title: "Punguzo la Kwanza",
    description: "Punguzo la 50% kwa safari yako ya kwanza",
    discount: "50% OFF",
    minAmount: "TSh 10,000",
    maxDiscount: "TSh 25,000",
    expiresAt: "2024-03-31",
    type: "percentage",
  },
  {
    id: "2",
    code: "WEEKEND20",
    title: "Wikendi Furaha",
    description: "Punguzo la 20% kwa safari za Jumamosi na Jumapili",
    discount: "20% OFF",
    minAmount: "TSh 15,000",
    maxDiscount: "TSh 10,000",
    expiresAt: "2024-02-28",
    type: "percentage",
  },
  {
    id: "3",
    code: "FLAT5K",
    title: "Punguzo la Moja kwa Moja",
    description: "Ondoa TSh 5,000 kutoka kwa safari yoyote",
    discount: "TSh 5,000",
    minAmount: "TSh 20,000",
    maxDiscount: "TSh 5,000",
    expiresAt: "2024-02-15",
    type: "fixed",
  },
];

const EXPIRED_PROMOS = [
  {
    id: "4",
    code: "NEWYEAR",
    title: "Mwaka Mpya",
    description: "Punguzo maalum la Mwaka Mpya",
    discount: "30% OFF",
    expiresAt: "2024-01-05",
    type: "percentage",
  },
];

interface PromoCardProps {
  promo: typeof ACTIVE_PROMOS[0];
  onApply: () => void;
  expired?: boolean;
}

const PromoCard: React.FC<PromoCardProps> = ({ promo, onApply, expired = false }) => {
  const theme = useCurrentTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sw-TZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDiscountColor = () => {
    if (expired) return theme.mutedText;
    return promo.type === "percentage" ? "#FF9800" : "#4CAF50";
  };

  return (
    <View
      style={[
        styles.promoCard,
        {
          backgroundColor: theme.cardBackground,
          opacity: expired ? 0.6 : 1,
        },
      ]}
    >
      {/* Discount Badge */}
      <View style={styles.promoHeader}>
        <View
          style={[
            styles.discountBadge,
            { backgroundColor: `${getDiscountColor()}15` },
          ]}
        >
          <Text style={[styles.discountText, { color: getDiscountColor() }]}>
            {promo.discount}
          </Text>
        </View>
        {!expired && (
          <View style={[styles.validBadge, { backgroundColor: `${theme.success}15` }]}>
            <Ionicons name="checkmark-circle" size={14} color={theme.success} />
            <Text style={[styles.validText, { color: theme.success }]}>Active</Text>
          </View>
        )}
        {expired && (
          <View style={[styles.expiredBadge, { backgroundColor: `${theme.error}15` }]}>
            <Ionicons name="close-circle" size={14} color={theme.error} />
            <Text style={[styles.expiredText, { color: theme.error }]}>Expired</Text>
          </View>
        )}
      </View>

      {/* Promo Details */}
      <Text style={[styles.promoTitle, { color: theme.text }]}>{promo.title}</Text>
      <Text style={[styles.promoDescription, { color: theme.subtleText }]}>
        {promo.description}
      </Text>

      {/* Promo Code */}
      <View style={[styles.codeContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.codeLeft}>
          <Ionicons name="pricetag" size={16} color={theme.primary} />
          <Text style={[styles.codeText, { color: theme.text }]}>{promo.code}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.copyButton,
            {
              backgroundColor: `${theme.primary}15`,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={handleCopy}
        >
          <Ionicons
            name={copied ? "checkmark" : "copy-outline"}
            size={16}
            color={theme.primary}
          />
          <Text style={[styles.copyText, { color: theme.primary }]}>
            {copied ? "Copied" : "Copy"}
          </Text>
        </Pressable>
      </View>

      {/* Terms */}
      {!expired && (
        <View style={styles.terms}>
          {promo.minAmount && (
            <View style={styles.termRow}>
              <Ionicons name="information-circle-outline" size={14} color={theme.mutedText} />
              <Text style={[styles.termText, { color: theme.mutedText }]}>
                Min amount: {promo.minAmount}
              </Text>
            </View>
          )}
          {promo.maxDiscount && (
            <View style={styles.termRow}>
              <Ionicons name="information-circle-outline" size={14} color={theme.mutedText} />
              <Text style={[styles.termText, { color: theme.mutedText }]}>
                Max discount: {promo.maxDiscount}
              </Text>
            </View>
          )}
          <View style={styles.termRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.mutedText} />
            <Text style={[styles.termText, { color: theme.mutedText }]}>
              Expires: {formatDate(promo.expiresAt)}
            </Text>
          </View>
        </View>
      )}

      {/* Apply Button */}
      {!expired && (
        <Pressable
          style={({ pressed }) => [
            styles.applyButton,
            {
              backgroundColor: theme.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={onApply}
        >
          <Text style={styles.applyButtonText}>Apply Sasa</Text>
        </Pressable>
      )}
    </View>
  );
};

export default function PromotionsScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  
  const [promoCode, setPromoCode] = useState("");
  const [showExpired, setShowExpired] = useState(false);

  const handleApplyPromo = (code: string) => {
    haptics.success();
    // In production, apply promo and navigate back
    router.back();
  };

  const handleManualApply = () => {
    if (!promoCode.trim()) {
      haptics.error();
      return;
    }
    handleApplyPromo(promoCode);
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
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
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Promotions & Discounts
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Manual Code Entry */}
          <View style={[styles.manualEntry, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Have a Promo Code?
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Enter code here"
                placeholderTextColor={theme.inputPlaceholder}
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
              <Pressable
                style={({ pressed }) => [
                  styles.applyManualButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: pressed || !promoCode.trim() ? 0.5 : 1,
                  },
                ]}
                onPress={handleManualApply}
                disabled={!promoCode.trim()}
              >
                <Text style={styles.applyManualText}>Apply</Text>
              </Pressable>
            </View>
          </View>

          {/* Active Promotions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Active Promotions
              </Text>
              <View style={[styles.countBadge, { backgroundColor: `${theme.primary}15` }]}>
                <Text style={[styles.countText, { color: theme.primary }]}>
                  {ACTIVE_PROMOS.length}
                </Text>
              </View>
            </View>
            
            {ACTIVE_PROMOS.map((promo) => (
              <PromoCard
                key={promo.id}
                promo={promo}
                onApply={() => handleApplyPromo(promo.code)}
              />
            ))}
          </View>

          {/* Expired Promotions Toggle */}
          <Pressable
            style={({ pressed }) => [
              styles.toggleButton,
              {
                backgroundColor: theme.cardBackground,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => {
              haptics.selection();
              setShowExpired(!showExpired);
            }}
          >
            <View style={styles.toggleLeft}>
              <Ionicons
                name="time-outline"
                size={20}
                color={theme.mutedText}
              />
              <Text style={[styles.toggleText, { color: theme.text }]}>
                Expired Promotions ({EXPIRED_PROMOS.length})
              </Text>
            </View>
            <Ionicons
              name={showExpired ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.mutedText}
            />
          </Pressable>

          {/* Expired Promotions */}
          {showExpired && (
            <View style={styles.section}>
              {EXPIRED_PROMOS.map((promo) => (
                <PromoCard
                  key={promo.id}
                  promo={promo}
                  onApply={() => {}}
                  expired
                />
              ))}
            </View>
          )}

          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: `${theme.primary}10` }]}>
            <Ionicons name="bulb" size={24} color={theme.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.primary }]}>
                Tips
              </Text>
              <Text style={[styles.infoText, { color: theme.primary }]}>
                Check your email regularly for new promotions and special discounts!
              </Text>
            </View>
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
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 60,
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
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  manualEntry: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontWeight: "600",
  },
  applyManualButton: {
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  applyManualText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  promoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  promoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  discountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  validBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  validText: {
    fontSize: 12,
    fontWeight: "600",
  },
  expiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  expiredText: {
    fontSize: 12,
    fontWeight: "600",
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  promoDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  codeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  copyText: {
    fontSize: 13,
    fontWeight: "600",
  },
  terms: {
    gap: 8,
    marginBottom: 16,
  },
  termRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  termText: {
    fontSize: 12,
  },
  applyButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "600",
  },
  infoBanner: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
