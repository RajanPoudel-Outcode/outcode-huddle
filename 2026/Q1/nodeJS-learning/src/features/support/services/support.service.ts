import { ISupportRequestDocument, SupportRequest } from '@/features/support/models/support-request.model';
import {
  ICreateSupportRequest,
  ISupportRequestResponse,
  IUpdateSupportRequest,
  SupportStatus
} from '@/features/support/types/support.types';
import { ForbiddenError, NotFoundError } from '@/shared/exception/error_handler';

export class SupportService {
  private createSupportResponse(request: ISupportRequestDocument): ISupportRequestResponse {
    const obj = request.toObject();
    return {
      id: (obj._id as any).toString(),
      user: (obj.user as any).toString(),
      subject: obj.subject,
      message: obj.message,
      status: obj.status,
      response: obj.response || '',
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    };
  }

  /**
   * Create a support request for the current user
   */
  async createRequest(userId: string, data: ICreateSupportRequest): Promise<ISupportRequestResponse> {
    const request = await SupportRequest.create({
      user: userId,
      subject: data.subject,
      message: data.message
    });
    return this.createSupportResponse(request);
  }

  /**
   * List the current user's support requests (newest first)
   */
  async getUserRequests(userId: string): Promise<ISupportRequestResponse[]> {
    const requests = await SupportRequest.find({ user: userId }).sort({ createdAt: -1 });
    return requests.map(request => this.createSupportResponse(request));
  }

  /**
   * Get one of the current user's support requests (ownership enforced)
   */
  async getUserRequestById(userId: string, id: string): Promise<ISupportRequestResponse> {
    const request = await SupportRequest.findById(id);
    if (!request) {
      throw new NotFoundError('Support request not found');
    }
    if (request.user.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this support request');
    }
    return this.createSupportResponse(request);
  }

  /**
   * List all support requests, optionally filtered by status (admin)
   */
  async getAllRequests(status?: SupportStatus): Promise<ISupportRequestResponse[]> {
    const filter = status ? { status } : {};
    const requests = await SupportRequest.find(filter).sort({ createdAt: -1 });
    return requests.map(request => this.createSupportResponse(request));
  }

  /**
   * Get any support request by id (admin)
   */
  async getRequestById(id: string): Promise<ISupportRequestResponse> {
    const request = await SupportRequest.findById(id);
    if (!request) {
      throw new NotFoundError('Support request not found');
    }
    return this.createSupportResponse(request);
  }

  /**
   * Update a support request's status and/or response (admin)
   */
  async updateRequest(id: string, data: IUpdateSupportRequest): Promise<ISupportRequestResponse> {
    const request = await SupportRequest.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!request) {
      throw new NotFoundError('Support request not found');
    }
    return this.createSupportResponse(request);
  }
}
