import { contentTypeParamSchema, upsertContentSchema } from '@/features/content/schemas/content.schemas';
import { ContentService } from '@/features/content/services/content.service';
import { ContentPageType, IUpsertContentRequest } from '@/features/content/types/content.types';
import { joiParamsValidation, joiValidation } from '@/shared/decorators/joi-validation.decorator';
import { createApiResponse } from '@/shared/middlewares/response.middleware';
import { NextFunction, Request, Response } from 'express';

export class ContentController {
  private contentService: ContentService;

  constructor() {
    this.contentService = new ContentService();
  }

  /**
   * Get a content page by type (public)
   */
  @joiParamsValidation(contentTypeParamSchema)
  async getPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = req.params.type as ContentPageType;
      const page = await this.contentService.getPage(type);
      const response = createApiResponse(true, 'Content page retrieved successfully', page);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create or update a content page by type (admin)
   */
  @joiParamsValidation(contentTypeParamSchema)
  @joiValidation(upsertContentSchema)
  async upsertPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = req.params.type as ContentPageType;
      const data: IUpsertContentRequest = req.body;
      const page = await this.contentService.upsertPage(type, data);
      const response = createApiResponse(true, 'Content page saved successfully', page);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
