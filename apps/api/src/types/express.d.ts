import type { UserRole } from '@property-management/types';

export interface AuthUser {
  id: string;
  email: string | null | undefined;
  role?: UserRole | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
