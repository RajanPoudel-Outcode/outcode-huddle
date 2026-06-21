import { Category, ICategoryDocument } from '@/features/categories/models/category.model';
import { ICategoryResponse, ICreateCategoryRequest } from '@/features/categories/types/categories.types';
import { ConflictError } from '@/shared/exception/error_handler';

const slugify = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export class CategoriesService {
  private createCategoryResponse(category: ICategoryDocument): ICategoryResponse {
    const obj = category.toObject();
    return {
      id: (obj._id as any).toString(),
      name: obj.name,
      slug: obj.slug,
      image: obj.image || '',
      order: obj.order || 0,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    };
  }

  /**
   * Get all categories ordered by `order` then name
   */
  async getCategories(): Promise<ICategoryResponse[]> {
    const categories = await Category.find({}).sort({ order: 1, name: 1 });
    return categories.map(category => this.createCategoryResponse(category));
  }

  /**
   * Create a new category (admin)
   */
  async createCategory(data: ICreateCategoryRequest, imagePath?: string): Promise<ICategoryResponse> {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);

    const existing = await Category.findOne({ $or: [{ name: data.name.trim() }, { slug }] });
    if (existing) {
      throw new ConflictError('Category with this name or slug already exists');
    }

    const category = new Category({
      name: data.name.trim(),
      slug,
      order: data.order ?? 0,
      image: imagePath || ''
    });

    const saved = await category.save();
    return this.createCategoryResponse(saved);
  }
}
