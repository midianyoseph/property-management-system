import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import type { AuthUser } from '../types/express';
import { UserRole } from '@property-management/types';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized', status: 401 });
    return;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized', status: 401 });
      return;
    }

    const roleValue =
      (user.app_metadata?.role as UserRole | undefined) ??
      (user.user_metadata?.role as UserRole | undefined) ??
      null;

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: roleValue,
    };

    req.user = authUser;
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    res.status(401).json({ error: 'Unauthorized', status: 401 });
  }
}
