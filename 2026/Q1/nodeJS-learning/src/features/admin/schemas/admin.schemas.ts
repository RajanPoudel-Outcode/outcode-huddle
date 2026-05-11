import Joi from 'joi';

// Dashboard query validation
export const dashboardQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).default(30),
  timezone: Joi.string().default('UTC')
});

// User management query validation
export const userManagementQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
  type: Joi.string().valid('User', 'Admin'),
  sortBy: Joi.string().valid('name', 'email', 'createdAt', 'type').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Order management query validation
export const orderManagementQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
  search: Joi.string().trim().allow(''),
  sortBy: Joi.string().valid('createdAt', 'totalPrice', 'status').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso().greater(Joi.ref('dateFrom'))
});

// Product management query validation (Admin)
export const adminProductQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
  category: Joi.string().trim(),
  stockStatus: Joi.string().valid('in-stock', 'low-stock', 'out-of-stock'),
  sortBy: Joi.string().valid('name', 'price', 'createdAt', 'countInStock').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// User update validation (Admin)
export const adminUserUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  email: Joi.string().email().trim().lowercase(),
  address: Joi.string().trim().max(200).allow(''),
  type: Joi.string().valid('User', 'Admin'),
  isActive: Joi.boolean()
}).min(1); // At least one field required

// User ID parameter validation
export const userIdParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.pattern.base': 'Invalid user ID format'
    })
});

// Product ID parameter validation
export const productIdParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.pattern.base': 'Invalid product ID format'
    })
});

// Order ID parameter validation
export const orderIdParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.pattern.base': 'Invalid order ID format'
    })
});

// Analytics query validation
export const analyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  granularity: Joi.string().valid('day', 'week', 'month').default('day')
});

// Bulk action validation
export const bulkActionSchema = Joi.object({
  action: Joi.string().valid('delete', 'activate', 'deactivate', 'promote', 'demote').required(),
  userIds: Joi.array().items(
    Joi.string().regex(/^[0-9a-fA-F]{24}$/)
  ).min(1).max(100).required()
    .messages({
      'array.min': 'At least one user ID is required',
      'array.max': 'Maximum 100 users can be processed at once'
    })
});
