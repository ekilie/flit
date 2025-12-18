import { useCurrentTheme } from "@/context/CentralTheme";
import { MaterialIcons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, View, Text } from "react-native";

const { width } = Dimensions.get("window");

export interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  description,
}) => {
  const theme = useCurrentTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.statHeader}>
        <View
          style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}
        >
          <MaterialIcons name={icon as any} size={20} color={color} />
        </View>
        <Text style={[styles.statValue, { color: theme.text }]}>
          {value.toLocaleString()}
        </Text>
      </View>
      <Text style={[styles.statTitle, { color: theme.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.statDescription, { color: theme.subtleText }]}>
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
  },
});
