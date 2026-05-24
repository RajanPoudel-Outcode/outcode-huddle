import { Button } from "@/components/ui";
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
    await storageService.removeItem("authUser");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={TextStyles.h1}>My Profile</Text>
      </View>

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
          {/* User Info */}
          <View style={styles.section}>
            <View style={styles.userCard}>
              <View style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={TextStyles.h3}>{user?.name || "User"}</Text>
                <Text style={TextStyles.bodySmall}>{user?.email}</Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.section}>
            <Text style={TextStyles.h3}>Account Settings</Text>
            <View style={[styles.menuItem, { borderTopWidth: 1 }]}>
              <Text style={TextStyles.body}>My Orders</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={TextStyles.body}>Saved Addresses</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={TextStyles.body}>Payment Methods</Text>
            </View>
            <View style={styles.menuItem}>
              <Text style={TextStyles.body}>Settings</Text>
            </View>
            <View style={[styles.menuItem, { borderBottomWidth: 1 }]}>
              <Text style={TextStyles.body}>Help & Support</Text>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.section}>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="secondary"
              size="large"
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
    backgroundColor: Colors.bg.primary,
    paddingHorizontal: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  authSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: Spacing.lg,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  userCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    marginRight: Spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  menuItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.gray[50],
    borderColor: Colors.gray[20],
  },
});
