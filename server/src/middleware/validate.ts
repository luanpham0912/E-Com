import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({
        error: {
          message: 'Validation failed',
          details: result.error.flatten(),
        },
      });
      return;
    }
    // Replace with parsed data so downstream handlers get coerced values
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
}