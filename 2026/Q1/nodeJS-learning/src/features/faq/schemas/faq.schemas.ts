import Joi from 'joi';

export const createFaqSchema = Joi.object({
  question: Joi.string()
    .min(5)
    .max(300)
    .trim()
    .required()
    .messages({
      'string.min': 'Question must be at least 5 characters long',
      'string.max': 'Question cannot exceed 300 characters',
      'any.required': 'Question is required',
      'string.empty': 'Question cannot be empty'
    }),

  answer: Joi.string()
    .min(2)
    .max(5000)
    .trim()
    .required()
    .messages({
      'string.min': 'Answer must be at least 2 characters long',
      'string.max': 'Answer cannot exceed 5000 characters',
      'any.required': 'Answer is required',
      'string.empty': 'Answer cannot be empty'
    }),

  category: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .optional(),

  order: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.integer': 'Order must be a whole number'
    }),

  isPublished: Joi.boolean().optional().default(true)
});

export const updateFaqSchema = Joi.object({
  question: Joi.string().min(5).max(300).trim().optional(),
  answer: Joi.string().min(2).max(5000).trim().optional(),
  category: Joi.string().max(50).trim().allow('').optional(),
  order: Joi.number().integer().min(0).optional(),
  isPublished: Joi.boolean().optional()
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided to update'
  });
