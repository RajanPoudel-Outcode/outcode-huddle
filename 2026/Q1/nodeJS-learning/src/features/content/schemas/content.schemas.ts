import Joi from 'joi';
import { CONTENT_PAGE_TYPES } from '@/features/content/types/content.types';

export const contentTypeParamSchema = Joi.object({
  type: Joi.string()
    .valid(...CONTENT_PAGE_TYPES)
    .required()
    .messages({
      'any.only': `Page type must be one of: ${CONTENT_PAGE_TYPES.join(', ')}`,
      'any.required': 'Page type is required'
    })
});

export const upsertContentSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required',
      'string.empty': 'Title cannot be empty'
    }),

  body: Joi.string()
    .min(2)
    .trim()
    .required()
    .messages({
      'string.min': 'Body must be at least 2 characters long',
      'any.required': 'Body is required',
      'string.empty': 'Body cannot be empty'
    })
});
