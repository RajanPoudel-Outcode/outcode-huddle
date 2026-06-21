import { createSupportSchema, updateSupportSchema } from '@/features/support/schemas/support.schemas';
import { SupportService } from '@/features/support/services/support.service';
import {
  ICreateSupportRequest,
  IUpdateSupportRequest,
  SupportStatus
} from '@/features/support/types/support.types';
import { joiValidation } from '@/shared/decorators/joi-validation.decorator';
import { createApiResponse } from '@/shared/middlewares/response.middleware';
import { NextFunction, Request, Response } from 'express';

export class SupportController {
  private supportService: SupportService;

  constructor() {
    this.supportService = new SupportService();
  }

  /**
   * Create a support request (authenticated user)
   */
  @joiValidation(createSupportSchema)
  async createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: ICreateSupportRequest = req.body;
      const request = await this.supportService.createRequest(req.user.id, data);
      const response = createApiResponse(true, 'Support request submitted successfully', request);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List the current user's support requests (authenticated user)
   */
  async getMyRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await this.supportService.getUserRequests(req.user.id);
      const response = createApiResponse(true, 'Support requests retrieved successfully', requests);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get one of the current user's support requests (authenticated user)
   */
  async getMyRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json(createApiResponse(false, 'Support request ID is required'));
        return;
      }

      const request = await this.supportService.getUserRequestById(req.user.id, id);
      const response = createApiResponse(true, 'Support request retrieved successfully', request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all support requests, optional ?status filter (admin)
   */
  async getAllRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as SupportStatus | undefined;
      const requests = await this.supportService.getAllRequests(status);
      const response = createApiResponse(true, 'Support requests retrieved successfully', requests);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get any support request by id (admin)
   */
  async getRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json(createApiResponse(false, 'Support request ID is required'));
        return;
      }

      const request = await this.supportService.getRequestById(id);
      const response = createApiResponse(true, 'Support request retrieved successfully', request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a support request's status and/or response (admin)
   */
  @joiValidation(updateSupportSchema)
  async updateRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json(createApiResponse(false, 'Support request ID is required'));
        return;
      }

      const data: IUpdateSupportRequest = req.body;
      const request = await this.supportService.updateRequest(id, data);
      const response = createApiResponse(true, 'Support request updated successfully', request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
