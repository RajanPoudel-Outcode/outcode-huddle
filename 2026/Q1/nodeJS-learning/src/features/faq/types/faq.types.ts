export interface IFaq {
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateFaqRequest {
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isPublished?: boolean;
}

export interface IUpdateFaqRequest {
  question?: string;
  answer?: string;
  category?: string;
  order?: number;
  isPublished?: boolean;
}

export interface IFaqResponse {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
