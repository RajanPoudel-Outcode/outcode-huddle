import { Button, Snackbar } from "@/components/ui";
import { buildAssetUrl } from "@/constants/config";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile";
import { useImagePicker } from "@/hooks/useImagePicker";
import type { PickedImage } from "@/types/upload.types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { pickImage } = useImagePicker();
  const { loadProfile, updateProfile, isSubmitting, error, clearError } =
    useProfile();

  // Prefill instantly from the cached user, then refresh from the API.
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState<PickedImage | null>(null);
  const [serverImage, setServerImage] = useState<string | undefined>(
    user?.avatar,
  );

  const [nameError, setNameError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;
    loadProfile()
      .then((profile) => {
        if (!active) return;
        setName(profile.name ?? "");
        setEmail(profile.email ?? "");
        setAddress(profile.address ?? "");
        setServerImage(profile.image);
      })
      .catch(() => {
        // error surfaced via the hook's `error` (shown in Snackbar)
      })
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [loadProfile]);

  const handlePickAvatar = async () => {
    const picked = await pickImage();
    if (picked) setAvatar(picked);
  };

  const validate = (): boolean => {
    setNameError("");
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      // Email is intentionally not editable, so it is not sent.
      const message = await updateProfile({
        name: name.trim(),
        address: address.trim(),
        image: avatar ?? undefined,
      });
      setSuccessMessage(message);
    } catch {
      // error shown in Snackbar
    }
  };

  const avatarUri = avatar?.uri ?? buildAssetUrl(serverImage);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <Pressable
            style={styles.avatar}
            onPress={handlePickAvatar}
            disabled={isSubmitting}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarPlaceholder}>📷</Text>
            )}
          </Pressable>
          <Text style={styles.avatarHint} onPress={handlePickAvatar}>
            Change photo
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, styles.label]}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={Colors.text.secondary}
              editable={!isSubmitting}
              value={name}
              onChangeText={setName}
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, styles.label]}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              editable={false}
              value={email}
            />
            <Text style={styles.hint}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, styles.label]}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Your address"
              placeholderTextColor={Colors.text.secondary}
              editable={!isSubmitting}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          variant="primary"
          size="large"
          loading={isSubmitting}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>

      <Snackbar
        visible={!!successMessage}
        message={successMessage}
        variant="success"
        onDismiss={() => {
          setSuccessMessage("");
          router.back();
        }}
      />

      <Snackbar
        visible={!!error}
        message={error ?? ""}
        variant="error"
        onDismiss={clearError}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.bg.primary,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.gray[10],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    fontSize: 36,
  },
  avatarHint: {
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontWeight: "600",
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.text.primary,
    backgroundColor: Colors.bg.secondary,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: Colors.gray[10],
    color: Colors.text.secondary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginLeft: Spacing.sm,
  },
  hint: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginLeft: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
