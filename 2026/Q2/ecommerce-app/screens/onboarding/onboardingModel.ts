/**
 * Onboarding Data Model
 */

export interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ONBOARDING_DATA: OnboardingItem[] = [
  {
    id: "1",
    title: "Welcome to Shop Hub",
    description:
      "Discover amazing products and exclusive deals right at your fingertips",
    icon: "🛍️",
  },
  {
    id: "2",
    title: "Easy & Secure Checkout",
    description:
      "Safe payment methods with encrypted transactions for your peace of mind",
    icon: "💳",
  },
  {
    id: "3",
    title: "Fast Delivery",
    description:
      "Get your orders delivered quickly and track them every step of the way",
    icon: "🚀",
  },
];
