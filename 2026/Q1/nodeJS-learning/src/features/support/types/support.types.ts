export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export const SUPPORT_STATUSES: SupportStatus[] = ['open', 'in_progress', 'resolved', 'closed'];

export interface ISupportRequest {
  user: any;
  subject: string;
  message: string;
  status: SupportStatus;
  response?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateSupportRequest {
  subject: string;
  message: string;
}

export interface IUpdateSupportRequest {
  status?: SupportStatus;
  response?: string;
}

export interface ISupportRequestResponse {
  id: string;
  user: string;
  subject: string;
  message: string;
  status: SupportStatus;
  response: string;
  createdAt: Date;
  updatedAt: Date;
}
