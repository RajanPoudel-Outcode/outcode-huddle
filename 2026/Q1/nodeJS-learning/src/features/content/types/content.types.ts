export type ContentPageType = 'terms' | 'privacy';

export const CONTENT_PAGE_TYPES: ContentPageType[] = ['terms', 'privacy'];

export interface IContentPage {
  type: ContentPageType;
  title: string;
  body: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpsertContentRequest {
  title: string;
  body: string;
}

export interface IContentPageResponse {
  id: string;
  type: ContentPageType;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}
