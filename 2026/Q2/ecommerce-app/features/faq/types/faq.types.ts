/**
 * FAQ Feature Types — aligned with the backend FAQ model.
 */

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}
