import { createCategorySchema } from '@/features/categories/schemas/categories.schemas';
import { CategoriesService } from '@/features/categories/services/categories.service';
import { ICreateCategoryRequest } from '@/features/categories/types/categories.types';
import { joiValidation } from '@/shared/decorators/joi-validation.decorator';
import { createApiResponse } from '@/shared/middlewares/response.middleware';
import { NextFunction, Request, Response } from 'express';

export class CategoriesController {
  private categoriesService: CategoriesService;

  constructor() {
    this.categoriesService = new CategoriesService();
  }

  /**
   * Get all categories
   */
  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.categoriesService.getCategories();
      const response = createApiResponse(true, 'Categories retrieved successfully', categories);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new category (admin)
   */
  @joiValidation(createCategorySchema)
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: ICreateCategoryRequest = req.body;
      const imagePath = req.file?.path;

      const category = await this.categoriesService.createCategory(data, imagePath);
      const response = createApiResponse(true, 'Category created successfully', category);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}
