/**
 * Legal / Content Page Feature Types — aligned with the backend ContentPage model.
 */

export type ContentPageType = "terms" | "privacy";

export interface ContentPage {
  id: string;
  type: ContentPageType;
  title: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
}
