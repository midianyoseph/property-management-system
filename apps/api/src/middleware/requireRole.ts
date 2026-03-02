import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@property-management/types';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !user.role) {
      res.status(403).json({ error: 'Forbidden', status: 403 });
      return;
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      res.status(403).json({ error: 'Forbidden', status: 403 });
      return;
    }

    next();
  };
}

// Example usage:
// router.get('/admin-only', authMiddleware, requireRole(UserRole.ADMIN), handler);
