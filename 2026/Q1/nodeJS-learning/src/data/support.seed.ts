import { ISupportRequest } from '@/features/support/types/support.types';

/**
 * Seed support requests for a given user id. Returns sample tickets in
 * different states so the admin support workflow has data to display.
 */
export const supportSeed = (userId: string): ISupportRequest[] => [
  {
    user: userId,
    subject: 'Where is my order?',
    message: 'I placed an order three days ago but I have not received a tracking number yet. Can you check the status?',
    status: 'open'
  },
  {
    user: userId,
    subject: 'Wrong item received',
    message: 'The headphones I received are a different color than what I ordered. How do I exchange them?',
    status: 'resolved',
    response: 'Apologies for the mix-up. We have shipped the correct color and included a prepaid return label for the wrong item.'
  }
];
