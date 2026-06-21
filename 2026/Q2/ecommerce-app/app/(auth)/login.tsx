import { Button, Snackbar } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAuth } from "@/features/auth";
import { Validators } from "@/utils/validators";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
    position: "relative",
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
    fontSize: 16,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 35,
    padding: 4,
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
  // inputContainer: {
  //   marginBottom: 20,
  //   // position: "relative",
  // },
  // textInput: {
  //   fontSize: 16,
  //   color: Colors.text.primary,
  //   paddingVertical: 16,
  //   paddingHorizontal: 20,
  //   backgroundColor: Colors.bg.secondary,
  //   borderRadius: 12,
  //   borderWidth: 1,
  //   borderColor: Colors.border,
  // },
  // eyeButton: {
  //   position: "absolute",
  //   right: 16,
  //   top: 16,
  //   padding: 4,
  // },
});

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!Validators.isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      // useAuth handles the API call, token persistence, and Redux state.
      // It resolves with the server's success message, or throws on failure
      // (the error message is already in auth.error via the rejected reducer).
      const { message } = await signIn({ email, password });
      setSuccessMessage(message);
      // Navigation is handled centrally by the root layout's auth effect.
    } catch {
      // Error is surfaced through `error` from useAuth.
    }
  };

  const handleRegisterLink = () => {
    router.navigate({
      pathname: "/(auth)/register" as any,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[TextStyles.h1, styles.title]}>Welcome Back</Text>
          <Text style={[TextStyles.body, styles.subtitle]}>
            Sign in to your account
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
              placeholder="Enter your password"
              placeholderTextColor={Colors.text.secondary}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={24}
                color={Colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}
        </View>

        {/* Login Button */}
        <Button
          title="Login"
          onPress={handleLogin}
          variant="primary"
          size="large"
          loading={isLoading}
          // disabled={true}
          style={{ marginTop: Spacing.xl }}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <View style={{ flexDirection: "row", gap: Spacing.sm }}>
            <Text style={[TextStyles.body, styles.footerText]}>
              Don&apos;t have an account?
            </Text>
            <Text
              style={[
                TextStyles.body,
                styles.link,
                {
                  fontWeight: "600",
                  textDecorationLine: "underline",
                  textDecorationStyle: "solid",
                },
              ]}
              onPress={handleRegisterLink}
            >
              Register
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
