import { Loading, NotFound } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useContentPage, type ContentPageType } from "@/features/legal";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

const VALID_TYPES: ContentPageType[] = ["terms", "privacy"];

const FALLBACK_TITLE: Record<ContentPageType, string> = {
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
};

export default function LegalPageScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const pageType = VALID_TYPES.includes(type as ContentPageType)
    ? (type as ContentPageType)
    : undefined;

  const { page, isLoading, error, refetch } = useContentPage(pageType);

  const headerTitle = pageType ? FALLBACK_TITLE[pageType] : "Not Found";

  if (!pageType) {
    return (
      <>
        <Stack.Screen options={{ title: "Not Found" }} />
        <NotFound
          fullscreen
          title="Page not found"
          description="This page does not exist."
          actionLabel="Go Back"
          onActionPress={() => router.back()}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: headerTitle }} />
        <Loading fullscreen message="Loading…" />
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        <Stack.Screen options={{ title: headerTitle }} />
        <NotFound
          fullscreen
          icon="⚠️"
          title="Couldn't load page"
          description={error ?? "This page hasn't been published yet."}
          actionLabel="Try Again"
          onActionPress={refetch}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: page.title }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[TextStyles.h2, styles.title]}>{page.title}</Text>
        <Text style={styles.body}>{page.body}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl },
  title: { marginBottom: Spacing.md },
  body: { ...TextStyles.body, color: Colors.text.secondary, lineHeight: 22 },
});
