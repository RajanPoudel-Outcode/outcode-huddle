import { Button, ProfileHeader, ProfileMenuItem } from "@/components/ui";
import { buildAssetUrl } from "@/constants/config";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAuth } from "@/features/auth";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const avatarUri = buildAssetUrl(user?.avatar);

  const handleLogout = () => {
    // useAuth clears persistent storage and resets Redux auth state.
    // The root layout's auth effect handles redirecting to login.
    logout();
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleMyOrders = () => {
    router.navigate("/(tabs)/orders");
  };

  const handleAccountDeletion = () => {
    // Show confirmation dialog
    console.log("Account deletion");
  };

  return (
    <View style={styles.container}>
      <Text style={TextStyles.h1}>Profile</Text>

      {!isAuthenticated ? (
        <View style={styles.authSection}>
          <View style={styles.placeholder}>
            <Text style={TextStyles.h3}>Not Logged In</Text>
            <Text style={TextStyles.body}>
              Please log in to view your profile
            </Text>
          </View>
        </View>
      ) : (
        <>
          {/* Profile Header with Edit Button */}
          <ProfileHeader
            name={user?.name || "User"}
            email={user?.email || ""}
            avatar={
              avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : undefined
            }
            onEditPress={handleEditProfile}
          />

          {/* Account Menu Items */}
          <ProfileMenuItem
            icon={<Text style={styles.icon}>📋</Text>}
            label="My Orders"
            onPress={handleMyOrders}
            isFirst
          />

          <ProfileMenuItem
            icon={<Text style={styles.icon}>🔑</Text>}
            label="Change Password"
            onPress={handleChangePassword}
          />

          <ProfileMenuItem
            icon={<Text style={styles.icon}>❓</Text>}
            label="FAQ"
            onPress={() => console.log("FAQ")}
          />
          <ProfileMenuItem
            icon={<Text style={styles.icon}>📄</Text>}
            label="Terms and Conditions"
            onPress={() => console.log("Terms")}
          />
          <ProfileMenuItem
            icon={<Text style={styles.icon}>🔒</Text>}
            label="Privacy Policy"
            onPress={() => console.log("Privacy")}
          />

          <ProfileMenuItem
            icon={<Text style={styles.icon}>🆘</Text>}
            label="Support Request"
            onPress={() => console.log("Support")}
          />

          {/* Spacer to push buttons to bottom */}
          <View style={styles.spacer} />

          {/* Account Actions */}
          <View style={styles.buttonContainer}>
            <Button title="Log Out" onPress={handleLogout} />

            <Button
              title="Account Deletion"
              variant="secondary"
              onPress={handleAccountDeletion}
              style={styles.deleteButton}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingVertical: Spacing.md,
  },
  deleteButton: {
    marginTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  authSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: Spacing.lg,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
