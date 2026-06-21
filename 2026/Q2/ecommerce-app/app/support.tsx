import { Button, Loading, Snackbar } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAuth } from "@/features/auth";
import { useSupportRequests, type SupportStatus } from "@/features/support";
import { ErrorHandler } from "@/utils/error-handler";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const STATUS_META: Record<SupportStatus, { label: string; color: string }> = {
  open: { label: "Open", color: Colors.primary },
  in_progress: { label: "In Progress", color: "#F5A623" },
  resolved: { label: "Resolved", color: Colors.success },
  closed: { label: "Closed", color: Colors.text.tertiary },
};

export default function SupportScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { requests, isLoading, error, isSubmitting, createRequest } =
    useSupportRequests();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");

  const canSubmit = subject.trim().length >= 3 && message.trim().length >= 5;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createRequest({ subject: subject.trim(), message: message.trim() });
      setSubject("");
      setMessage("");
      setToast("Your support request has been submitted");
    } catch (err) {
      setToast(ErrorHandler.getUserMessage(err));
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={TextStyles.h3}>Please log in</Text>
        <Text style={[TextStyles.body, styles.muted]}>
          You need to be logged in to submit and view support requests.
        </Text>
        <Button
          title="Go Back"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* New request form */}
        <View style={styles.card}>
          <Text style={[TextStyles.h4, styles.cardTitle]}>New request</Text>

          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief summary of your issue"
            placeholderTextColor={Colors.text.tertiary}
            maxLength={150}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue in detail"
            placeholderTextColor={Colors.text.tertiary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={5000}
          />

          <Button
            title="Submit Request"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
            style={styles.submit}
          />
        </View>

        {/* History */}
        <Text style={[TextStyles.h4, styles.historyTitle]}>Your requests</Text>

        {isLoading ? (
          <Loading message="Loading your requests…" />
        ) : error ? (
          <Text style={[TextStyles.body, styles.muted]}>{error}</Text>
        ) : requests.length === 0 ? (
          <Text style={[TextStyles.body, styles.muted]}>
            You haven&apos;t submitted any support requests yet.
          </Text>
        ) : (
          requests.map((req) => {
            const meta = STATUS_META[req.status];
            return (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestSubject} numberOfLines={1}>
                    {req.subject}
                  </Text>
                  <View
                    style={[styles.badge, { backgroundColor: meta.color }]}
                  >
                    <Text style={styles.badgeText}>{meta.label}</Text>
                  </View>
                </View>
                <Text style={styles.requestMessage}>{req.message}</Text>
                {req.response ? (
                  <View style={styles.responseBox}>
                    <Text style={styles.responseLabel}>Support replied</Text>
                    <Text style={styles.responseText}>{req.response}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <Snackbar
        visible={!!toast}
        message={toast}
        variant="info"
        onDismiss={() => setToast("")}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg.secondary },
  container: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.bg.secondary,
  },
  muted: { color: Colors.text.secondary, textAlign: "center" },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  cardTitle: { marginBottom: Spacing.sm },
  label: {
    ...TextStyles.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text.primary,
    fontSize: 15,
    backgroundColor: Colors.bg.primary,
  },
  textArea: { minHeight: 110 },
  submit: { marginTop: Spacing.md },
  historyTitle: { marginTop: Spacing.sm },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  requestSubject: { ...TextStyles.h4, flex: 1 },
  badge: {
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: "700" },
  requestMessage: { ...TextStyles.body, color: Colors.text.secondary },
  responseBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 10,
    backgroundColor: Colors.bg.tertiary,
  },
  responseLabel: {
    ...TextStyles.caption,
    color: Colors.primary,
    fontWeight: "700",
    marginBottom: 2,
  },
  responseText: { ...TextStyles.body, color: Colors.text.primary },
});
