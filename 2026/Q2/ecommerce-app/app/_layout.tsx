import HeaderBackButton from "@/components/ui/HeaderBackButton";
import { useAppDispatch } from "@/hooks/useRedux";
import OnboardingScreen from "@/screens/onboarding/OnboardingScreen";
import { storageService } from "@/services";
import type { RootState } from "@/store";
import { store } from "@/store";
import { restoreSession } from "@/store/slices/authSlice";
import { setHasViewedOnboarding } from "@/store/slices/onboardingSlice";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";

function RootLayoutContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const hasViewedOnboarding = useSelector(
    (state: RootState) => state.onboarding.hasViewedOnboarding,
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  useEffect(() => {
    // Restore onboarding state and auth state from storage on app start
    const restoreState = async () => {
      try {
        const hasViewed = await storageService.getItem("hasViewedOnboarding");
        if (hasViewed === "true") {
          dispatch(setHasViewedOnboarding(true));
        }

        // Restore persisted auth session (tokens + user) into Redux.
        await dispatch(restoreSession());
      } catch (error) {
        console.error("Error restoring state:", error);
      } finally {
        setIsHydrated(true);
      }
    };

    restoreState();
  }, [dispatch]);

  // Navigate to correct screen when auth state changes
  useEffect(() => {
    if (isHydrated && hasViewedOnboarding) {
      console.log("Auth state changed - isAuthenticated:", isAuthenticated);
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [isAuthenticated, isHydrated, hasViewedOnboarding, router]);

  if (!isHydrated) {
    return null;
  }

  if (!hasViewedOnboarding) {
    return <OnboardingScreen />;
  }

  // Render both screen groups - navigation will handle which one is active
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="edit-profile"
          options={{
            headerShown: true,
            title: "Edit Profile",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="change-password"
          options={{
            headerShown: true,
            title: "Change Password",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export const unstable_settings = {
  initialRouteName: "(auth)",
};

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Provider store={store}>
        <RootLayoutContent />
      </Provider>
    </SafeAreaView>
  );
}
