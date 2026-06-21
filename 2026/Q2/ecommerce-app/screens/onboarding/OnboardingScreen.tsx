import { Button } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { storageService } from "@/services";
import type { RootState } from "@/store";
import {
  setCurrentPage,
  setHasViewedOnboarding,
} from "@/store/slices/onboardingSlice";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { ONBOARDING_DATA } from "./onboardingModel";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  skipButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    fontSize: 100,
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  description: {
    textAlign: "center",
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[30],
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  footerButton: {
    width: "100%",
  },
});

export default function OnboardingScreen() {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(
    (state: RootState) => state.onboarding.currentPage,
  );
  const scrollRef = useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();
  const [size, setSize] = useState({ width: windowWidth, height: 0 });
  const [localPage, setLocalPage] = useState(0);

  // Sync scroll position when the page changes from outside (e.g. restored state).
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: currentPage * size.width, animated: true });
  }, [currentPage, size.width]);

  // Mark onboarding complete and persist it. The root layout watches
  // `hasViewedOnboarding` and, once true, mounts the navigator and routes to
  // the tabs (if authenticated) or the login screen. We must NOT call `router`
  // here: onboarding renders outside the navigator, so navigating from this
  // screen happens before the Root Layout's <Stack> is mounted.
  const completeOnboarding = async () => {
    await storageService.setItem("hasViewedOnboarding", "true");
    dispatch(setHasViewedOnboarding(true));
  };

  const handleSkip = completeOnboarding;
  const handleGetStarted = completeOnboarding;

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (size.width === 0) return;
    const page = Math.round(e.nativeEvent.contentOffset.x / size.width);
    setLocalPage(page);
    dispatch(setCurrentPage(page));
  };

  return (
    <View style={styles.container}>
      {/* Header with Skip Button */}
      <View style={styles.header}>
        <Button
          title="Skip"
          onPress={handleSkip}
          variant="secondary"
          size="small"
        />
      </View>

      {/* Swipeable carousel (cross-platform: works on iOS, Android & web) */}
      <View
        style={styles.pagerView}
        onLayout={(e) =>
          setSize({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          })
        }
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
        >
          {ONBOARDING_DATA.map((item) => (
            <View
              key={item.id}
              style={[
                styles.pageContainer,
                { width: size.width, height: size.height },
              ]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[TextStyles.h1, styles.title]}>{item.title}</Text>
              <Text style={[TextStyles.body, styles.description]}>
                {item.description}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {ONBOARDING_DATA.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              localPage === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}
