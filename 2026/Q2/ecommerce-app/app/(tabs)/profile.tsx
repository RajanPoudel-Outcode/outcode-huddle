import { Button, Dialog, ProfileHeader, ProfileMenuItem } from "@/components/ui";
import { buildAssetUrl } from "@/constants/config";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAuth } from "@/features/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [confirm, setConfirm] = useState<"logout" | "delete" | null>(null);

  const avatarUri = buildAssetUrl(user?.avatar);

  const handleLogout = () => {
    setConfirm("logout");
  };

  const confirmLogout = () => {
    setConfirm(null);
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

  const handleWishlist = () => {
    router.navigate("/(tabs)/wishlist");
  };

  const handleAccountDeletion = () => {
    setConfirm("delete");
  };

  const confirmAccountDeletion = () => {
    setConfirm(null);
    // Account deletion is not wired to a backend endpoint yet.
    console.log("Account deletion confirmed");
  };

  const handleFaq = () => {
    router.push("/faq");
  };

  const handleTerms = () => {
    router.push("/legal/terms");
  };

  const handlePrivacy = () => {
    router.push("/legal/privacy");
  };

  const handleSupport = () => {
    router.push("/support");
  };

  const handleMyOrders = () => {
    router.push("/orders");
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
            icon={<MenuIcon name="heart-outline" />}
            label="My Wishlist"
            onPress={handleWishlist}
            isFirst
          />

          <ProfileMenuItem
            icon={<MenuIcon name="package-variant-closed" />}
            label="My Orders"
            onPress={handleMyOrders}
          />

          <ProfileMenuItem
            icon={<MenuIcon name="lock-outline" />}
            label="Change Password"
            onPress={handleChangePassword}
          />

          <ProfileMenuItem
            icon={<MenuIcon name="help-circle-outline" />}
            label="FAQ"
            onPress={handleFaq}
          />
          <ProfileMenuItem
            icon={<MenuIcon name="file-document-outline" />}
            label="Terms and Conditions"
            onPress={handleTerms}
          />
          <ProfileMenuItem
            icon={<MenuIcon name="shield-lock-outline" />}
            label="Privacy Policy"
            onPress={handlePrivacy}
          />

          <ProfileMenuItem
            icon={<MenuIcon name="lifebuoy" />}
            label="Support Request"
            onPress={handleSupport}
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

      <Dialog
        visible={confirm === "logout"}
        title="Log out?"
        message="You'll need to sign in again to access your account."
        variant="warning"
        confirmText="Log Out"
        dismissText="Cancel"
        onDismiss={() => setConfirm(null)}
        onConfirm={confirmLogout}
      />

      <Dialog
        visible={confirm === "delete"}
        title="Delete account?"
        message="This permanently deletes your account and all its data. This can't be undone."
        variant="error"
        confirmText="Delete"
        dismissText="Cancel"
        onDismiss={() => setConfirm(null)}
        onConfirm={confirmAccountDeletion}
      />
    </View>
  );
}

function MenuIcon({
  name,
}: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}) {
  return (
    <MaterialCommunityIcons name={name} size={22} color={Colors.text.primary} />
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
