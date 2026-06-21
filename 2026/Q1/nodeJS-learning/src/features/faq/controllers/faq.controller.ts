import { createFaqSchema, updateFaqSchema } from '@/features/faq/schemas/faq.schemas';
import { FaqService } from '@/features/faq/services/faq.service';
import { ICreateFaqRequest, IUpdateFaqRequest } from '@/features/faq/types/faq.types';
import { joiValidation } from '@/shared/decorators/joi-validation.decorator';
import { createApiResponse } from '@/shared/middlewares/response.middleware';
import { NextFunction, Request, Response } from 'express';

export class FaqController {
  private faqService: FaqService;

  constructor() {
    this.faqService = new FaqService();
  }

  /**
   * Get all published FAQs (public)
   */
  async getFaqs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faqs = await this.faqService.getPublishedFaqs();
      const response = createApiResponse(true, 'FAQs retrieved successfully', faqs);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new FAQ (admin)
   */
  @joiValidation(createFaqSchema)
  async createFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: ICreateFaqRequest = req.body;
      const faq = await this.faqService.createFaq(data);
      const response = createApiResponse(true, 'FAQ created successfully', faq);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing FAQ (admin)
   */
  @joiValidation(updateFaqSchema)
  async updateFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json(createApiResponse(false, 'FAQ ID is required'));
        return;
      }

      const data: IUpdateFaqRequest = req.body;
      const faq = await this.faqService.updateFaq(id, data);
      const response = createApiResponse(true, 'FAQ updated successfully', faq);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a FAQ (admin)
   */
  async deleteFaq(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json(createApiResponse(false, 'FAQ ID is required'));
        return;
      }

      await this.faqService.deleteFaq(id);
      const response = createApiResponse(true, 'FAQ deleted successfully');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
