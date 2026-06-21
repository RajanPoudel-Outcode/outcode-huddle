import { ContentPage, IContentPageDocument } from '@/features/content/models/content-page.model';
import { ContentPageType, IContentPageResponse, IUpsertContentRequest } from '@/features/content/types/content.types';
import { NotFoundError } from '@/shared/exception/error_handler';

export class ContentService {
  private createContentResponse(page: IContentPageDocument): IContentPageResponse {
    const obj = page.toObject();
    return {
      id: (obj._id as any).toString(),
      type: obj.type,
      title: obj.title,
      body: obj.body,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    };
  }

  /**
   * Get a single content page by type (public)
   */
  async getPage(type: ContentPageType): Promise<IContentPageResponse> {
    const page = await ContentPage.findOne({ type });
    if (!page) {
      throw new NotFoundError(`No ${type} page has been published yet`);
    }
    return this.createContentResponse(page);
  }

  /**
   * Create or update the content page for a given type (admin)
   */
  async upsertPage(type: ContentPageType, data: IUpsertContentRequest): Promise<IContentPageResponse> {
    const page = await ContentPage.findOneAndUpdate(
      { type },
      { $set: { type, title: data.title, body: data.body } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return this.createContentResponse(page as IContentPageDocument);
  }
}
