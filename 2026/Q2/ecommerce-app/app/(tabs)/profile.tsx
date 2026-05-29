import { Button, ProfileHeader, ProfileMenuItem } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { storageService } from "@/services";
import type { RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const handleLogout = async () => {
    dispatch(logout());
    await storageService.removeItem("authToken");
    await storageService.removeItem("authRefreshToken");
    await storageService.removeItem("authUser");
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log("Edit profile");
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
});
