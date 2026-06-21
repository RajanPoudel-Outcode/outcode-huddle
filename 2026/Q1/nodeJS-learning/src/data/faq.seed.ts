import { ICreateFaqRequest } from '@/features/faq/types/faq.types';

interface SeedFaq extends ICreateFaqRequest {
  order: number;
}

/**
 * Seed FAQs grouped loosely by category. Managed via the admin FAQ API later.
 */
export const faqSeed: SeedFaq[] = [
  {
    question: 'How do I place an order?',
    answer:
      'Browse the catalog, tap a product to view its details, add it to your cart, then proceed to checkout and confirm your shipping and payment information.',
    category: 'Orders',
    order: 1,
    isPublished: true
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept major credit and debit cards. Additional payment options may be available at checkout depending on your region.',
    category: 'Payments',
    order: 2,
    isPublished: true
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Standard shipping typically takes 3–7 business days. You will receive a tracking link by email once your order ships.',
    category: 'Shipping',
    order: 3,
    isPublished: true
  },
  {
    question: 'Can I track my order?',
    answer:
      'Yes. Once your order is dispatched you can track it from the Orders section of your account, or via the tracking link in your confirmation email.',
    category: 'Shipping',
    order: 4,
    isPublished: true
  },
  {
    question: 'What is your return policy?',
    answer:
      'Items can be returned within 14 days of delivery if they are unused and in their original packaging. Start a return from your order details page.',
    category: 'Returns',
    order: 5,
    isPublished: true
  },
  {
    question: 'How do I reset my password?',
    answer:
      'Use the "Forgot password" option on the login screen and follow the instructions sent to your registered email address.',
    category: 'Account',
    order: 6,
    isPublished: true
  }
];
