import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Product name must be at least 2 characters long',
      'string.max': 'Product name cannot exceed 100 characters',
      'any.required': 'Product name is required',
      'string.empty': 'Product name cannot be empty'
    }),

  description: Joi.string()
    .min(10)
    .max(1000)
    .trim()
    .required()
    .messages({
      'string.min': 'Product description must be at least 10 characters long',
      'string.max': 'Product description cannot exceed 1000 characters',
      'any.required': 'Product description is required',
      'string.empty': 'Product description cannot be empty'
    }),

  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Product price must be a positive number',
      'any.required': 'Product price is required'
    }),

  category: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'Category must be at least 2 characters long',
      'string.max': 'Category cannot exceed 50 characters',
      'any.required': 'Product category is required',
      'string.empty': 'Product category cannot be empty'
    }),

  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.integer': 'Quantity must be a whole number',
      'number.min': 'Quantity cannot be negative',
      'any.required': 'Product quantity is required'
    }),

  countInStock: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(1)
    .messages({
      'number.integer': 'Count in stock must be a whole number',
      'number.min': 'Count in stock cannot be negative'
    })
});

export const updateProductSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Product name must be at least 2 characters long',
      'string.max': 'Product name cannot exceed 100 characters'
    }),

  description: Joi.string()
    .min(10)
    .max(1000)
    .trim()
    .optional()
    .messages({
      'string.min': 'Product description must be at least 10 characters long',
      'string.max': 'Product description cannot exceed 1000 characters'
    }),

  price: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.positive': 'Product price must be a positive number'
    }),

  category: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'Category must be at least 2 characters long',
      'string.max': 'Category cannot exceed 50 characters'
    }),

  quantity: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'Quantity must be a whole number',
      'number.min': 'Quantity cannot be negative'
    }),

  countInStock: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'Count in stock must be a whole number',
      'number.min': 'Count in stock cannot be negative'
    })
});

export const addReviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.integer': 'Rating must be a whole number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),

  comment: Joi.string()
    .min(5)
    .max(500)
    .trim()
    .required()
    .messages({
      'string.min': 'Comment must be at least 5 characters long',
      'string.max': 'Comment cannot exceed 500 characters',
      'any.required': 'Comment is required',
      'string.empty': 'Comment cannot be empty'
    })
});

export const productQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.integer': 'Page must be a whole number',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.integer': 'Limit must be a whole number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),

  category: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.empty': 'Category cannot be empty'
    }),

  minPrice: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.positive': 'Minimum price must be positive'
    }),

  maxPrice: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.positive': 'Maximum price must be positive'
    }),

  search: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.empty': 'Search term cannot be empty'
    }),

  sortBy: Joi.string()
    .valid('name', 'price', 'rating', 'createdAt')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: name, price, rating, createdAt'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

export const productIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid product ID format',
      'any.required': 'Product ID is required'
    })
});
