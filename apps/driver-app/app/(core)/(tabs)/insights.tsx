import EmptyState from "@/components/EmptyState";
import FloatingActionButton from "@/components/FloatingActionButton";
import PostItem from "@/components/PostItem";
import ScreenLayout from "@/components/ScreenLayout";
import InsightsSkeleton from "@/components/skeletons/InsightsSkeleton";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useInsights } from "@/hooks/useInsights";
import { Post } from "@/lib/api/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

export default function Insights() {
  const theme = useCurrentTheme();
  const { insights, loading, error, refresh } = useInsights();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const allPosts = insights
    ? [...insights.recent_posts, ...insights.top_posts]
        .filter((post) => post && post.id)
        .reduce((acc, current) => {
          const x = acc.find((item) => item.id === current.id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, [] as Post[])
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    : [];

  const renderPost = ({ item }: { item: Post }) => (
    <PostItem
      post={item}
      onPress={() => {
        if (item?.id) {
          router.push(`/(core)/posts/edit/${item.id}`);
        }
      }}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.heroSection}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Insights</Text>
          <Text style={[styles.subtitle, { color: theme.subtleText }]}>
            All shared insights and ideas
          </Text>
        </View>
        <View
          style={[styles.heroIcon, { backgroundColor: `${theme.primary}15` }]}
        >
          <Ionicons name="document-text" size={28} color={theme.primary} />
        </View>
      </View>

      {/* {allPosts.length > 0 && (
        <View style={styles.postsCount}>
          <Text style={[styles.countText, { color: theme.subtleText }]}>
            {allPosts.length} {allPosts.length === 1 ? "thought" : "Insights"}
          </Text>
        </View>
      )} */}
    </View>
  );

  if (loading) {
    return <InsightsSkeleton />;
  }

  if (!insights) {
    return (
      <ScreenLayout>
        <EmptyState
          iconName="document-text"
          title="No Insights Yet"
          message="Start writing to share insights and ideas."
          actionText="Create First Thought"
          onAction={() => router.push("/(core)/posts/create")}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <View style={[styles.container]}>
        <FlatList
          data={allPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[
            styles.contentContainer,
            allPosts.length === 0 && styles.emptyContentContainer,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: `${theme.primary}15` },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Insights Yet
              </Text>
              <Text
                style={[styles.emptyDescription, { color: theme.subtleText }]}
              >
                insights and ideas will appear here once you start writing
              </Text>
            </View>
          )}
        />

        <FloatingActionButton
          icon="add"
          onPress={() => router.push("/(core)/posts/create")}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 8,
  },
  heroSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  postsCount: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  countText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    minHeight: 400,
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
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.7,
  },
});
