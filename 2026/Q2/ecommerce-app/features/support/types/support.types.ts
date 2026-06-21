/**
 * Support Request Feature Types — aligned with the backend SupportRequest model.
 */

export type SupportStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportRequest {
  id: string;
  user: string;
  subject: string;
  message: string;
  status: SupportStatus;
  response: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupportPayload {
  subject: string;
  message: string;
}
