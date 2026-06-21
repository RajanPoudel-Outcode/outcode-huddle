import Joi from 'joi';
import { SUPPORT_STATUSES } from '@/features/support/types/support.types';

export const createSupportSchema = Joi.object({
  subject: Joi.string()
    .min(3)
    .max(150)
    .trim()
    .required()
    .messages({
      'string.min': 'Subject must be at least 3 characters long',
      'string.max': 'Subject cannot exceed 150 characters',
      'any.required': 'Subject is required',
      'string.empty': 'Subject cannot be empty'
    }),

  message: Joi.string()
    .min(5)
    .max(5000)
    .trim()
    .required()
    .messages({
      'string.min': 'Message must be at least 5 characters long',
      'string.max': 'Message cannot exceed 5000 characters',
      'any.required': 'Message is required',
      'string.empty': 'Message cannot be empty'
    })
});

export const updateSupportSchema = Joi.object({
  status: Joi.string()
    .valid(...SUPPORT_STATUSES)
    .optional()
    .messages({
      'any.only': `Status must be one of: ${SUPPORT_STATUSES.join(', ')}`
    }),

  response: Joi.string()
    .max(5000)
    .trim()
    .allow('')
    .optional()
})
  .min(1)
  .messages({
    'object.min': 'At least one field (status or response) must be provided'
  });
