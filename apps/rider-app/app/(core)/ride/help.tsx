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

const HELP_CATEGORIES = [
  {
    id: "rides",
    title: "Rides & Promotions",
    icon: "car",
    color: "#4CAF50",
    topics: [
      "Jinsi ya kuagiza safari",
      "Kubadilisha au kughairi safari",
      "Matatizo ya kulipiwa",
      "Punguzo na matoleo",
    ],
  },
  {
    id: "account",
    title: "My Account",
    icon: "person",
    color: "#2196F3",
    topics: [
      "Mabadiliko ya akaunti",
      "Nywila na usalama",
      "Njia za malipo",
      "Punguzo na bakshishi",
    ],
  },
  {
    id: "safety",
    title: "Safety",
    icon: "shield-checkmark",
    color: "#FF9800",
    topics: [
      "Vipengele vya usalama",
      "Ripoti tatizo la usalama",
      "Msaada wa dharura",
      "Kupoteza mali",
    ],
  },
  {
    id: "payment",
    title: "Payment",
    icon: "card",
    color: "#9C27B0",
    topics: [
      "Njia za malipo",
      "Payment ya ziada",
      "Rejea fedha",
      "Risiti na historia",
    ],
  },
];

const FAQ_ITEMS = [
  {
    id: "1",
    question: "Je, ninaweza kughairi safari baada ya kuagiza?",
    answer: "Ndiyo, unaweza kughairi safari yako kabla dereva hajafikia. Unaweza kulipishwa ada ya kughairi kulingana na wakati ulioghairi.",
  },
  {
    id: "2",
    question: "Ninatumia njia gani za malipo?",
    answer: "Tunakubali malipo kwa njia za kadi za benki (Visa, Mastercard), M-Pesa, Airtel Money, na malipo kwa mkono kwa dereva.",
  },
  {
    id: "3",
    question: "Je, ninaweza kuagiza safari kwa ajili ya mtu mwingine?",
    answer: "Ndiyo, unaweza kuagiza safari kwa niaba ya rafiki au jamaa. Hakikisha unawasiliana nao ili wajue kuhusu safari.",
  },
  {
    id: "4",
    question: "Nifanye nini ikiwa nimepoteza kitu kwenye gari?",
    answer: "Wasiliana nasi mara moja kupitia sehemu ya 'Mali Iliyopotea' ili tuweze kukusaidia kupata mali yako.",
  },
];

const QUICK_ACTIONS = [
  {
    id: "lost-items",
    title: "Report Lost Item",
    description: "Help me find something I lost",
    icon: "cube-outline",
    color: "#FF5722",
  },
  {
    id: "safety-issue",
    title: "Report Safety Issue",
    description: "Report a safety incident",
    icon: "warning-outline",
    color: "#F44336",
  },
  {
    id: "feedback",
    title: "Give Feedback",
    description: "Help us improve our service",
    icon: "chatbubble-outline",
    color: "#2196F3",
  },
  {
    id: "contact",
    title: "Contact Us",
    description: "Talk to our support team",
    icon: "call-outline",
    color: "#4CAF50",
  },
];

interface CategoryCardProps {
  category: typeof HELP_CATEGORIES[0];
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const theme = useCurrentTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.categoryCard,
        {
          backgroundColor: theme.cardBackground,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
        <Ionicons name={category.icon as any} size={28} color={category.color} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={[styles.categoryTitle, { color: theme.text }]}>
          {category.title}
        </Text>
        <Text style={[styles.topicCount, { color: theme.subtleText }]}>
          {category.topics.length} topics
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.mutedText} />
    </Pressable>
  );
};

interface FAQItemProps {
  item: typeof FAQ_ITEMS[0];
}

const FAQItem: React.FC<FAQItemProps> = ({ item }) => {
  const theme = useCurrentTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      style={[styles.faqItem, { backgroundColor: theme.cardBackground }]}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: theme.text }]}>
          {item.question}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.mutedText}
        />
      </View>
      {expanded && (
        <Text style={[styles.faqAnswer, { color: theme.subtleText }]}>
          {item.answer}
        </Text>
      )}
    </Pressable>
  );
};

interface QuickActionProps {
  action: typeof QUICK_ACTIONS[0];
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ action, onPress }) => {
  const theme = useCurrentTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor: theme.cardBackground,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}15` }]}>
        <Ionicons name={action.icon as any} size={24} color={action.color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: theme.text }]}>
          {action.title}
        </Text>
        <Text style={[styles.actionDescription, { color: theme.subtleText }]}>
          {action.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.mutedText} />
    </Pressable>
  );
};

export default function HelpSupportScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const haptics = useHaptics();
  
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategoryPress = (categoryId: string) => {
    haptics.selection();
    // In production, navigate to category details
  };

  const handleQuickAction = (actionId: string) => {
    haptics.selection();
    // In production, handle specific action
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
            Help & Support
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="search" size={20} color={theme.mutedText} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search for help..."
              placeholderTextColor={theme.inputPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={theme.mutedText} />
              </Pressable>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              {QUICK_ACTIONS.map((action) => (
                <QuickAction
                  key={action.id}
                  action={action}
                  onPress={() => handleQuickAction(action.id)}
                />
              ))}
            </View>
          </View>

          {/* Help Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Help Categories
            </Text>
            <View style={styles.categories}>
              {HELP_CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onPress={() => handleCategoryPress(category.id)}
                />
              ))}
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Frequently Asked Questions
            </Text>
            <View style={styles.faqList}>
              {FAQ_ITEMS.map((item) => (
                <FAQItem key={item.id} item={item} />
              ))}
            </View>
          </View>

          {/* Contact Support */}
          <View style={[styles.contactCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.contactIcon, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name="headset" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.contactTitle, { color: theme.text }]}>
              Still need help?
            </Text>
            <Text style={[styles.contactText, { color: theme.subtleText }]}>
              Our support team is ready to help you 24/7
            </Text>
            <View style={styles.contactButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.contactButton,
                  {
                    backgroundColor: `${theme.primary}15`,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => haptics.selection()}
              >
                <Ionicons name="call" size={20} color={theme.primary} />
                <Text style={[styles.contactButtonText, { color: theme.primary }]}>
                  Call
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.contactButton,
                  {
                    backgroundColor: `${theme.primary}15`,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => haptics.selection()}
              >
                <Ionicons name="mail" size={20} color={theme.primary} />
                <Text style={[styles.contactButtonText, { color: theme.primary }]}>
                  Email
                </Text>
              </Pressable>
            </View>
            
            <View style={styles.contactInfo}>
              <View style={styles.contactInfoRow}>
                <Ionicons name="call-outline" size={16} color={theme.mutedText} />
                <Text style={[styles.contactInfoText, { color: theme.subtleText }]}>
                  +255 123 456 789
                </Text>
              </View>
              <View style={styles.contactInfoRow}>
                <Ionicons name="mail-outline" size={16} color={theme.mutedText} />
                <Text style={[styles.contactInfoText, { color: theme.subtleText }]}>
                  support@flit.co.tz
                </Text>
              </View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  quickActions: {
    gap: 12,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
  },
  categories: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  topicCount: {
    fontSize: 13,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  contactCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  contactText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 20,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  contactInfo: {
    alignSelf: "stretch",
    gap: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  contactInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  contactInfoText: {
    fontSize: 14,
  },
});
