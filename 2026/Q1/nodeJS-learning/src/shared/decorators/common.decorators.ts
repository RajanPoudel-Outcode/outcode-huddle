import { NextFunction, Request, Response } from 'express';

/**
 * Async wrapper to catch errors in async route handlers
 */
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Method binding decorator to preserve 'this' context
 */
export function bindMethods(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    return originalMethod.apply(this, args);
  };
  
  return descriptor;
}

/**
 * Rate limiting decorator
 */
export function rateLimit(windowMs: number, maxRequests: number) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      const clientId = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      
      const clientData = requests.get(clientId);
      
      if (!clientData || now > clientData.resetTime) {
        requests.set(clientId, {
          count: 1,
          resetTime: now + windowMs
        });
      } else {
        clientData.count++;
        
        if (clientData.count > maxRequests) {
          return res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later',
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
            timestamp: new Date().toISOString()
          });
        }
      }
      
      return await originalMethod.call(this, req, res, next);
    };
    
    return descriptor;
  };
}

/**
 * Cache decorator for GET requests
 */
export function cache(durationMs: number) {
  const cache = new Map<string, { data: any; expiry: number }>();
  
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      if (req.method !== 'GET') {
        return await originalMethod.call(this, req, res, next);
      }
      
      const cacheKey = `${req.originalUrl || req.url}`;
      const now = Date.now();
      const cached = cache.get(cacheKey);
      
      if (cached && now < cached.expiry) {
        return res.status(200).json(cached.data);
      }
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = function(data: any) {
        if (res.statusCode === 200) {
          cache.set(cacheKey, {
            data,
            expiry: now + durationMs
          });
        }
        return originalJson(data);
      };
      
      return await originalMethod.call(this, req, res, next);
    };
    
    return descriptor;
  };
}

/**
 * Logging decorator
 */
export function logExecution(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const method = req.method;
    const url = req.originalUrl || req.url;
    
    console.log(`🔵 [${new Date().toISOString()}] ${method} ${url} - Started`);
    
    try {
      const result = await originalMethod.call(this, req, res, next);
      const duration = Date.now() - start;
      console.log(`🟢 [${new Date().toISOString()}] ${method} ${url} - Completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`🔴 [${new Date().toISOString()}] ${method} ${url} - Failed in ${duration}ms`);
      throw error;
    }
  };
  
  return descriptor;
}
