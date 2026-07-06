import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwtAuth';

/**
 * Extended Request with authenticated user info
 */
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Middleware: Extract and verify JWT from cookie or Authorization header
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    // Get token from HTTP-only cookie (preferred)
    let token = req.cookies.token || req.cookies.dma_token;

    // Fallback: Get from Authorization header (Bearer token)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware: Verify user has a specific role (or higher)
 * Role hierarchy: student < instructor < admin < super_admin
 */
const ROLE_HIERARCHY: Record<string, number> = {
  student: 1,
  instructor: 2,
  admin: 3,
  super_admin: 4,
};

export function roleMiddleware(requiredRole: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Middleware: Require super_admin role
 */
export function superAdminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  roleMiddleware('super_admin')(req, res, next);
}

/**
 * Middleware: Require admin role or higher
 */
export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  roleMiddleware('admin')(req, res, next);
}

/**
 * Middleware: Require instructor role or higher
 */
export function instructorMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  roleMiddleware('instructor')(req, res, next);
}
