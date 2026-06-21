import { Button } from "@/components/ui";
import { Colors, Spacing, TextStyles } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { storageService } from "@/services";
import type { RootState } from "@/store";
import {
  setCurrentPage,
  setHasViewedOnboarding,
} from "@/store/slices/onboardingSlice";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
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
    flex: 1,
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
  const router = useRouter();
  const currentPage = useAppSelector(
    (state: RootState) => state.onboarding.currentPage,
  );
  const pagerViewRef = useRef<PagerView>(null);
  const [localPage, setLocalPage] = useState(0);

  useEffect(() => {
    pagerViewRef.current?.setPage(currentPage);
  }, [currentPage]);

  const handleSkip = async () => {
    await storageService.setItem("hasViewedOnboarding", "true");
    dispatch(setHasViewedOnboarding(true));
    router.replace("/(tabs)");
  };

  const handleGetStarted = async () => {
    await storageService.setItem("hasViewedOnboarding", "true");
    dispatch(setHasViewedOnboarding(true));
    router.replace("/(tabs)");
  };

  const handlePageSelected = (e: any) => {
    const page = e.nativeEvent.position;
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

      {/* PageView Carousel */}
      <PagerView
        ref={pagerViewRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {ONBOARDING_DATA.map((item) => (
          <View key={item.id} style={styles.pageContainer}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[TextStyles.h1, styles.title]}>{item.title}</Text>
            <Text style={[TextStyles.body, styles.description]}>
              {item.description}
            </Text>
          </View>
        ))}
      </PagerView>

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
