export interface ICategory {
  name: string;
  slug: string;
  image?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCategoryRequest {
  name: string;
  slug?: string;
  order?: number;
}

export interface ICategoryResponse {
  id: string;
  name: string;
  slug: string;
  image: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
