import Joi from 'joi';

export const createOrderSchema = Joi.object({
  orderItems: Joi.array()
    .items(
      Joi.object({
        product: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Invalid product ID format',
            'any.required': 'Product ID is required'
          }),
        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            'number.integer': 'Quantity must be a whole number',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required'
          }),
        price: Joi.number()
          .positive()
          .precision(2)
          .required()
          .messages({
            'number.positive': 'Price must be positive',
            'any.required': 'Price is required'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one order item is required',
      'any.required': 'Order items are required'
    }),

  shippingAddress: Joi.string()
    .min(10)
    .max(500)
    .trim()
    .required()
    .messages({
      'string.min': 'Shipping address must be at least 10 characters long',
      'string.max': 'Shipping address cannot exceed 500 characters',
      'any.required': 'Shipping address is required',
      'string.empty': 'Shipping address cannot be empty'
    }),

  paymentMethod: Joi.string()
    .valid('credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery')
    .required()
    .messages({
      'any.only': 'Payment method must be one of: credit_card, debit_card, paypal, stripe, cash_on_delivery',
      'any.required': 'Payment method is required'
    }),

  totalTax: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.min': 'Total tax cannot be negative',
      'any.required': 'Total tax is required'
    }),

  totalPrice: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Total price must be positive',
      'any.required': 'Total price is required'
    }),

  shippingPrice: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.min': 'Shipping price cannot be negative',
      'any.required': 'Shipping price is required'
    })
});

export const updateOrderSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, processing, shipped, delivered, cancelled'
    }),

  shippingAddress: Joi.string()
    .min(10)
    .max(500)
    .trim()
    .optional()
    .messages({
      'string.min': 'Shipping address must be at least 10 characters long',
      'string.max': 'Shipping address cannot exceed 500 characters'
    }),

  paymentMethod: Joi.string()
    .valid('credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery')
    .optional()
    .messages({
      'any.only': 'Payment method must be one of: credit_card, debit_card, paypal, stripe, cash_on_delivery'
    })
});

export const orderQuerySchema = Joi.object({
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

  status: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, processing, shipped, delivered, cancelled'
    }),

  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid user ID format'
    }),

  startDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Start date must be in ISO format'
    }),

  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.format': 'End date must be in ISO format',
      'date.min': 'End date must be after start date'
    }),

  sortBy: Joi.string()
    .valid('createdAt', 'totalPrice', 'status')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: createdAt, totalPrice, status'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

export const orderIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid order ID format',
      'any.required': 'Order ID is required'
    })
});
