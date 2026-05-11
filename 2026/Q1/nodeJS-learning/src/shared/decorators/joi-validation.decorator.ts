import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { ValidationError } from '../exception/error_handler';

/**
 * Joi Validation Decorator
 * Usage: @joiValidation(schema)
 */
export function joiValidation(schema: Joi.ObjectSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        // Validate the request body
        const { error, value } = schema.validate(req.body, {
          abortEarly: false, // Get all validation errors
          allowUnknown: false, // Don't allow unknown fields
          stripUnknown: true // Remove unknown fields
        });

        if (error) {
          const validationErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }));

          throw new ValidationError('Validation failed', {
            errors: validationErrors,
            invalidFields: validationErrors.map(err => err.field)
          });
        }

        // Replace req.body with validated and sanitized data
        req.body = value;

        // Call the original method
        return await originalMethod.call(this, req, res, next);
      } catch (error) {
        next(error);
      }
    };

    return descriptor;
  };
}

/**
 * Joi Query Validation Decorator
 * Usage: @joiQueryValidation(schema)
 */
export function joiQueryValidation(schema: Joi.ObjectSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const { error, value } = schema.validate(req.query, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true
        });

        if (error) {
          const validationErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }));

          throw new ValidationError('Query validation failed', {
            errors: validationErrors,
            invalidFields: validationErrors.map(err => err.field)
          });
        }

        req.query = value;
        return await originalMethod.call(this, req, res, next);
      } catch (error) {
        next(error);
      }
    };

    return descriptor;
  };
}

/**
 * Joi Params Validation Decorator
 * Usage: @joiParamsValidation(schema)
 */
export function joiParamsValidation(schema: Joi.ObjectSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const { error, value } = schema.validate(req.params, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true
        });

        if (error) {
          const validationErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }));

          throw new ValidationError('Params validation failed', {
            errors: validationErrors,
            invalidFields: validationErrors.map(err => err.field)
          });
        }

        req.params = value;
        return await originalMethod.call(this, req, res, next);
      } catch (error) {
        next(error);
      }
    };

    return descriptor;
  };
}

/**
 * Joi Full Request Validation Decorator
 * Validates body, query, and params
 * Usage: @joiFullValidation({ body: bodySchema, query: querySchema, params: paramsSchema })
 */
export function joiFullValidation(schemas: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const errors: any[] = [];

        // Validate body
        if (schemas.body) {
          const { error, value } = schemas.body.validate(req.body, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
          });

          if (error) {
            errors.push(...error.details.map(detail => ({
              field: `body.${detail.path.join('.')}`,
              message: detail.message,
              value: detail.context?.value
            })));
          } else {
            req.body = value;
          }
        }

        // Validate query
        if (schemas.query) {
          const { error, value } = schemas.query.validate(req.query, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
          });

          if (error) {
            errors.push(...error.details.map(detail => ({
              field: `query.${detail.path.join('.')}`,
              message: detail.message,
              value: detail.context?.value
            })));
          } else {
            req.query = value;
          }
        }

        // Validate params
        if (schemas.params) {
          const { error, value } = schemas.params.validate(req.params, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
          });

          if (error) {
            errors.push(...error.details.map(detail => ({
              field: `params.${detail.path.join('.')}`,
              message: detail.message,
              value: detail.context?.value
            })));
          } else {
            req.params = value;
          }
        }

        if (errors.length > 0) {
          throw new ValidationError('Request validation failed', {
            errors,
            invalidFields: errors.map(err => err.field)
          });
        }

        return await originalMethod.call(this, req, res, next);
      } catch (error) {
        next(error);
      }
    };

    return descriptor;
  };
}

export default joiValidation;
