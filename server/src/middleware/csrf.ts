import type { Request, Response, NextFunction } from 'express';

const PUBLIC_AUTH_PATHS = ['/login', '/register'];

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  if (PUBLIC_AUTH_PATHS.includes(req.path)) return next();

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: { message: 'Invalid CSRF token' } });
    return;
  }

  next();
}
