import HeaderBackButton from "@/components/ui/HeaderBackButton";
import { useAppDispatch } from "@/hooks/useRedux";
import OnboardingScreen from "@/screens/onboarding/OnboardingScreen";
import { storageService } from "@/services";
import { tokenStore } from "@/services/session.token";
import { CART_STORAGE_KEY, store, type RootState } from "@/store";
import { logout, restoreSession } from "@/store/slices/authSlice";
import { setCart, type CartItem } from "@/store/slices/cartSlice";
import {
  resetOnboarding,
  setHasViewedOnboarding,
} from "@/store/slices/onboardingSlice";

// DEV TOGGLE: set to true to wipe all persisted data (auth session, cart,
// onboarding flag, caches) on the next launch and boot into onboarding.
// Leave false for normal behavior.
const RESET_LOCAL_DATA = false;
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
        // TEMP (dev): clear everything and force the onboarding flow.
        if (RESET_LOCAL_DATA) {
          await storageService.clear();
          await tokenStore.clear();
          dispatch(logout());
          dispatch(resetOnboarding());
          dispatch(setCart([]));
          setIsHydrated(true);
          return;
        }

        const hasViewed = await storageService.getItem("hasViewedOnboarding");
        if (hasViewed === "true") {
          dispatch(setHasViewedOnboarding(true));
        }

        // Restore persisted auth session (tokens + user) into Redux.
        await dispatch(restoreSession());

        // Rehydrate the saved cart.
        const cart = await storageService.getItem<CartItem[]>(CART_STORAGE_KEY);
        if (Array.isArray(cart)) {
          dispatch(setCart(cart));
        }
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
        <Stack.Screen
          name="faq"
          options={{
            headerShown: true,
            title: "FAQ",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="legal/[type]"
          options={{
            headerShown: true,
            title: "",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="support"
          options={{
            headerShown: true,
            title: "Support Request",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="categories"
          options={{
            headerShown: true,
            title: "Categories",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="collection"
          options={{
            headerShown: true,
            title: "",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: true,
            title: "Checkout",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="order-confirmation"
          options={{
            headerShown: true,
            title: "Order Placed",
            headerBackVisible: false,
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="orders"
          options={{
            headerShown: true,
            title: "My Orders",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="orders/[id]"
          options={{
            headerShown: true,
            title: "Order Details",
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
