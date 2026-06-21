import { Loading, NotFound } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useFaqs } from "@/features/faq";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function FaqScreen() {
  const router = useRouter();
  const { faqs, isLoading, error, refetch } = useFaqs();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return <Loading fullscreen message="Loading FAQs…" />;
  }

  if (error) {
    return (
      <NotFound
        fullscreen
        icon="⚠️"
        title="Couldn't load FAQs"
        description={error}
        actionLabel="Try Again"
        onActionPress={refetch}
      />
    );
  }

  if (faqs.length === 0) {
    return (
      <NotFound
        fullscreen
        icon="❓"
        title="No FAQs yet"
        description="There are no frequently asked questions to show right now."
        actionLabel="Go Back"
        onActionPress={() => router.back()}
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={faqs}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const expanded = expandedId === item.id;
        return (
          <Pressable
            style={styles.card}
            onPress={() => setExpandedId(expanded ? null : item.id)}
          >
            <View style={styles.questionRow}>
              <Text style={styles.question}>{item.question}</Text>
              <MaterialCommunityIcons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={22}
                color={Colors.text.secondary}
              />
            </View>
            {expanded ? <Text style={styles.answer}>{item.answer}</Text> : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.secondary },
  content: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  question: { ...TextStyles.h4, flex: 1 },
  answer: {
    ...TextStyles.body,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
});
