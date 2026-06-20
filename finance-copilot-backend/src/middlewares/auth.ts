import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { CustomError } from './error';
import { Role } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}

export const requireAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new CustomError('Authentication credentials were not provided', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      role: payload.role as Role,
    };
    next();
  } catch (error: any) {
    return next(new CustomError('Authentication token is invalid or expired', 401));
  }
};

export const requireRoles = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new CustomError('Unauthorized access', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new CustomError('Forbidden: Insufficient privileges', 403));
    }

    next();
  };
};
