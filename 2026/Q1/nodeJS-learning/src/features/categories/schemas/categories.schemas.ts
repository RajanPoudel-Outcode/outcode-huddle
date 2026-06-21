import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 50 characters',
      'any.required': 'Category name is required',
      'string.empty': 'Category name cannot be empty'
    }),

  slug: Joi.string()
    .trim()
    .lowercase()
    .optional()
    .messages({
      'string.empty': 'Slug cannot be empty'
    }),

  order: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.integer': 'Order must be a whole number'
    })
});
