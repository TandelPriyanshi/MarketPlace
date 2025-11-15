import { UserRole } from './roles.enum';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        name?: string;
        phone?: string;
      };
    }
  }
}

export {};

