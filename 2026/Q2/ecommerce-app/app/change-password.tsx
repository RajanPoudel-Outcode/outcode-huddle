import { Button, Snackbar } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useProfile } from "@/features/profile";
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

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { changePassword, isSubmitting, error, clearError } = useProfile();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [currentError, setCurrentError] = useState("");
  const [newError, setNewError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validate = (): boolean => {
    let valid = true;
    setCurrentError("");
    setNewError("");
    setConfirmError("");

    if (!currentPassword) {
      setCurrentError("Current password is required");
      valid = false;
    }

    const passwordValidation = Validators.isValidPassword(newPassword);
    if (!passwordValidation.isValid) {
      setNewError(passwordValidation.errors[0]);
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const message = await changePassword({ currentPassword, newPassword });
      setSuccessMessage(message);
    } catch {
      // error shown in Snackbar
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, styles.label]}>
              Current Password
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              placeholderTextColor={Colors.text.secondary}
              secureTextEntry={!showPasswords}
              editable={!isSubmitting}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            {currentError ? (
              <Text style={styles.errorText}>{currentError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, styles.label]}>New Password</Text>
            <View>
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor={Colors.text.secondary}
                secureTextEntry={!showPasswords}
                editable={!isSubmitting}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPasswords((v) => !v)}
                style={styles.eyeButton}
              >
                <MaterialIcons
                  name={showPasswords ? "visibility" : "visibility-off"}
                  size={24}
                  color={Colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
            {newError ? <Text style={styles.errorText}>{newError}</Text> : null}
            <Text style={styles.hint}>
              Min 8 chars, uppercase, lowercase, digit, special char (@$!%*?&)
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[TextStyles.label, styles.label]}>
              Confirm New Password
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your new password"
              placeholderTextColor={Colors.text.secondary}
              secureTextEntry={!showPasswords}
              editable={!isSubmitting}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {confirmError ? (
              <Text style={styles.errorText}>{confirmError}</Text>
            ) : null}
          </View>
        </View>

        <Button
          title="Update Password"
          onPress={handleSubmit}
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
  scrollContent: {
    padding: Spacing.lg,
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
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 14,
    padding: 4,
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
