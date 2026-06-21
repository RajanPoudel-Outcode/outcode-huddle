import { NextFunction, Request, Response } from 'express';

/**
 * Parse JSON-encoded fields from a multipart/form-data body.
 *
 * multipart sends everything as strings, so array/object fields (e.g. colors,
 * storageOptions, specifications) arrive as JSON text. This middleware parses the
 * named fields back into real arrays/objects before validation runs.
 */
export const parseJsonFields = (fields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === 'string' && value.trim() !== '') {
        try {
          req.body[field] = JSON.parse(value);
        } catch {
          // leave the original value; validation will surface a clear error
        }
      }
    }
    next();
  };
};

export default parseJsonFields;
