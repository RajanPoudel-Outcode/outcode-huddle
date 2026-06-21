import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnboardingState {
  hasViewedOnboarding: boolean;
  currentPage: number;
}

const initialState: OnboardingState = {
  hasViewedOnboarding: false,
  currentPage: 0,
};

export const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setHasViewedOnboarding: (state, action: PayloadAction<boolean>) => {
      state.hasViewedOnboarding = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    resetOnboarding: (state) => {
      state.hasViewedOnboarding = false;
      state.currentPage = 0;
    },
  },
});

export const { setHasViewedOnboarding, setCurrentPage, resetOnboarding } =
  onboardingSlice.actions;

export default onboardingSlice.reducer;
