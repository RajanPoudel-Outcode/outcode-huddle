import { Button, Snackbar } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAuth } from "@/features/auth";
import { useImagePicker } from "@/hooks/useImagePicker";
import type { PickedImage } from "@/types/upload.types";
import { Validators } from "@/utils/validators";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xxl,
    alignItems: "center",
  },
  title: {
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.text.secondary,
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
  rowInputs: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  rowInput: {
    flex: 1,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginLeft: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
    alignItems: "center",
  },
  button: {
    width: "100%",
  },
  link: {
    color: Colors.primary,
    fontWeight: "600",
  },
  footerText: {
    color: Colors.text.secondary,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    fontSize: 32,
  },
  avatarHint: {
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontWeight: "600",
  },
});

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuth();
  const { pickImage } = useImagePicker();

  const [successMessage, setSuccessMessage] = useState("");
  const [avatar, setAvatar] = useState<PickedImage | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!firstName.trim()) {
      setFirstNameError("First name is required");
      isValid = false;
    }

    if (!lastName.trim()) {
      setLastNameError("Last name is required");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!Validators.isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    const passwordValidation = Validators.isValidPassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.errors[0]);
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  const handlePickAvatar = async () => {
    const picked = await pickImage();
    if (picked) setAvatar(picked);
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      // Backend expects a single `name`; combine the first/last name fields.
      const { message } = await signUp({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        image: avatar ?? undefined,
      });
      setSuccessMessage(message);
      // Navigation is handled centrally by the root layout's auth effect.
    } catch {
      // Error is surfaced through `error` from useAuth (shown in the Snackbar).
    }
  };

  const handleLoginLink = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[TextStyles.h1, styles.title]}>Create Account</Text>
          <Text style={[TextStyles.body, styles.subtitle]}>
            Sign up to get started
          </Text>
        </View>

        {/* Avatar (optional) */}
        <View style={styles.avatarSection}>
          <Pressable
            style={styles.avatar}
            onPress={handlePickAvatar}
            disabled={isLoading}
          >
            {avatar ? (
              <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarPlaceholder}>📷</Text>
            )}
          </Pressable>
          <Text style={styles.avatarHint} onPress={handlePickAvatar}>
            {avatar ? "Change photo" : "Add photo (optional)"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Fields */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.rowInput]}>
              <Text style={[TextStyles.label, styles.label]}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                placeholderTextColor={Colors.text.secondary}
                editable={!isLoading}
                value={firstName}
                onChangeText={setFirstName}
              />
              {firstNameError && (
                <Text style={styles.errorText}>{firstNameError}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, styles.rowInput]}>
              <Text style={[TextStyles.label, styles.label]}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor={Colors.text.secondary}
                editable={!isLoading}
                value={lastName}
                onChangeText={setLastName}
              />
              {lastNameError && (
                <Text style={styles.errorText}>{lastNameError}</Text>
              )}
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, styles.label]}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              value={email}
              onChangeText={setEmail}
            />
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, styles.label]}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a strong password"
              placeholderTextColor={Colors.text.secondary}
              secureTextEntry
              editable={!isLoading}
              value={password}
              onChangeText={setPassword}
            />
            {passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}
            <Text
              style={[
                TextStyles.caption,
                {
                  color: Colors.text.secondary,
                  marginLeft: Spacing.sm,
                  marginTop: Spacing.xs,
                },
              ]}
            >
              Min 8 chars, uppercase, lowercase, digit, special char (@$!%*?&)
            </Text>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, styles.label]}>
              Confirm Password
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor={Colors.text.secondary}
              secureTextEntry
              editable={!isLoading}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {confirmPasswordError && (
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            )}
          </View>
        </View>

        {/* Register Button */}
        <Button
          title="Create Account"
          onPress={handleRegister}
          variant="primary"
          size="large"
          loading={isLoading}
          style={{ marginTop: Spacing.xl }}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <View style={{ flexDirection: "row", gap: Spacing.sm }}>
            <Text style={[TextStyles.body, styles.footerText]}>
              Already have an account?
            </Text>
            <Text
              style={[TextStyles.body, styles.link]}
              onPress={handleLoginLink}
            >
              Login
            </Text>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!successMessage}
        message={successMessage}
        variant="success"
        onDismiss={() => setSuccessMessage("")}
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
