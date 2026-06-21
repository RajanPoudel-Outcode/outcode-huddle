import { ICreateCategoryRequest } from '@/features/categories/types/categories.types';

interface SeedCategory extends ICreateCategoryRequest {
  slug: string;
  image: string;
}

/**
 * Seed categories. Images use a reliable remote placeholder service; swap for
 * uploaded assets via the admin API later.
 */
export const categoriesSeed: SeedCategory[] = [
  { name: 'Mobile', slug: 'mobile', order: 1, image: 'https://picsum.photos/seed/cat-mobile/300/300' },
  { name: 'Headphone', slug: 'headphone', order: 2, image: 'https://picsum.photos/seed/cat-headphone/300/300' },
  { name: 'Tablets', slug: 'tablets', order: 3, image: 'https://picsum.photos/seed/cat-tablets/300/300' },
  { name: 'Laptop', slug: 'laptop', order: 4, image: 'https://picsum.photos/seed/cat-laptop/300/300' },
  { name: 'Speakers', slug: 'speakers', order: 5, image: 'https://picsum.photos/seed/cat-speakers/300/300' },
];
