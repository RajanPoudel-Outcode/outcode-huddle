import { Faq, IFaqDocument } from '@/features/faq/models/faq.model';
import { ICreateFaqRequest, IFaqResponse, IUpdateFaqRequest } from '@/features/faq/types/faq.types';
import { NotFoundError } from '@/shared/exception/error_handler';

export class FaqService {
  private createFaqResponse(faq: IFaqDocument): IFaqResponse {
    const obj = faq.toObject();
    return {
      id: (obj._id as any).toString(),
      question: obj.question,
      answer: obj.answer,
      category: obj.category || '',
      order: obj.order || 0,
      isPublished: obj.isPublished ?? true,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    };
  }

  /**
   * Get all published FAQs ordered by `order` then creation date (public)
   */
  async getPublishedFaqs(): Promise<IFaqResponse[]> {
    const faqs = await Faq.find({ isPublished: true }).sort({ order: 1, createdAt: 1 });
    return faqs.map(faq => this.createFaqResponse(faq));
  }

  /**
   * Create a new FAQ (admin)
   */
  async createFaq(data: ICreateFaqRequest): Promise<IFaqResponse> {
    const faq = await Faq.create({
      question: data.question,
      answer: data.answer,
      category: data.category || '',
      order: data.order ?? 0,
      isPublished: data.isPublished ?? true
    });
    return this.createFaqResponse(faq);
  }

  /**
   * Update an existing FAQ (admin)
   */
  async updateFaq(id: string, data: IUpdateFaqRequest): Promise<IFaqResponse> {
    const faq = await Faq.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!faq) {
      throw new NotFoundError('FAQ not found');
    }
    return this.createFaqResponse(faq);
  }

  /**
   * Delete a FAQ (admin)
   */
  async deleteFaq(id: string): Promise<void> {
    const faq = await Faq.findByIdAndDelete(id);
    if (!faq) {
      throw new NotFoundError('FAQ not found');
    }
  }
}
