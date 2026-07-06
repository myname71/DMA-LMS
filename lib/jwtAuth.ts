import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRY = '7d'; // 7 days

/**
 * Sign a JWT token
 */
export function signToken(payload: Record<string, any>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode a JWT token
 * Throws if invalid or expired
 */
export function verifyToken(token: string): Record<string, any> {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, any>;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate auth tokens
 */
export interface AuthTokens {
  token: string;
  expiresIn: string;
}

export function generateAuthTokens(userId: number, email: string, role: string): AuthTokens {
  const token = signToken({
    userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
  });

  return {
    token,
    expiresIn: JWT_EXPIRY,
  };
}
