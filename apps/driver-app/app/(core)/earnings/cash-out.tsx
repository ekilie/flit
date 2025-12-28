import ScreenLayout from "@/components/ScreenLayout";
import Colors from "@/constants/Colors";
import { useCurrentTheme } from "@/context/CentralTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { toast } from "yooo-native";
import * as Haptics from "expo-haptics";

const QUICK_AMOUNTS = [50000, 100000, 200000];

export default function CashOutScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  
  const [availableBalance] = useState(285000);
  const [amount, setAmount] = useState('');
  const [paymentMethod] = useState({
    type: 'M-Pesa',
    number: '+255 712 345 678',
  });

  const handleCashOut = async () => {
    const cashOutAmount = parseInt(amount);
    
    if (!cashOutAmount || cashOutAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (cashOutAmount > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }
    
    if (cashOutAmount < 10000) {
      toast.error('Minimum cash out amount is TSh 10,000');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.success(`Cash out of TSh ${cashOutAmount.toLocaleString()} initiated!`);
    
    // Navigate back after a delay
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const selectQuickAmount = (quickAmount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmount(quickAmount.toString());
  };

  const selectAllAmount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmount(availableBalance.toString());
  };

  return (
    <ScreenLayout>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            💸 Cash Out
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Available Balance Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.subtleText }]}>
            Available Balance
          </Text>
          <Text style={[styles.balanceAmount, { color: theme.text }]}>
            TSh {availableBalance.toLocaleString()}
          </Text>
        </View>

        {/* Amount Input */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.subtleText }]}>
            Select Amount
          </Text>
          <View style={[styles.inputContainer, { borderColor: theme.border }]}>
            <Text style={[styles.currencyPrefix, { color: theme.subtleText }]}>
              TSh
            </Text>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="0"
              placeholderTextColor={theme.inputPlaceholder}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          {/* Quick Select Buttons */}
          <View style={styles.quickSelectRow}>
            {QUICK_AMOUNTS.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[styles.quickButton, { borderColor: theme.border }]}
                onPress={() => selectQuickAmount(quickAmount)}
              >
                <Text style={[styles.quickButtonText, { color: theme.text }]}>
                  TSh {(quickAmount / 1000)}k
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.quickButton, styles.allButton, { backgroundColor: theme.primary }]}
              onPress={selectAllAmount}
            >
              <Text style={[styles.quickButtonText, styles.allButtonText]}>
                All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.subtleText }]}>
            Cash Out To
          </Text>
          <View style={[styles.paymentMethod, { borderColor: theme.border }]}>
            <MaterialCommunityIcons 
              name="cellphone" 
              size={24} 
              color={theme.primary} 
            />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentType, { color: theme.text }]}>
                📱 {paymentMethod.type}
              </Text>
              <Text style={[styles.paymentNumber, { color: theme.subtleText }]}>
                {paymentMethod.number}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.changeLink, { color: theme.primary }]}>
                Change
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons 
              name="information" 
              size={16} 
              color={theme.subtleText} 
            />
            <Text style={[styles.infoText, { color: theme.subtleText }]}>
              Processing Time: Instant
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons 
              name="information" 
              size={16} 
              color={theme.subtleText} 
            />
            <Text style={[styles.infoText, { color: theme.subtleText }]}>
              Fee: TSh 1,000
            </Text>
          </View>
        </View>

        {/* Cash Out Button */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cashOutButton}
            onPress={handleCashOut}
            disabled={!amount || parseInt(amount) <= 0}
          >
            <LinearGradient
              colors={[theme.primary, Colors.light.buttonBackground]}
              style={styles.cashOutButtonGradient}
            >
              <Text style={styles.cashOutButtonText}>
                Cash Out {amount ? `TSh ${parseInt(amount).toLocaleString()}` : ''}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
  },
  quickSelectRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  allButton: {
    borderWidth: 0,
  },
  allButtonText: {
    color: '#000',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentNumber: {
    fontSize: 14,
  },
  changeLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  actions: {
    paddingHorizontal: 20,
  },
  cashOutButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cashOutButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  cashOutButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});
