import type { Request, Response, NextFunction } from 'express';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { message: 'Route not found' } });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status = (err as { status?: number })?.status ?? 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ error: { message } });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}