import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  clinicId: string;
  role: string;
  email: string;
}

export interface TokenUserData {
  id: string;
  clinicId: string;
  role: string;
  email: string;
}

export function generateToken(user: TokenUserData): string {
  const payload: JWTPayload = {
    userId: user.id,
    clinicId: user.clinicId,
    role: user.role,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '24h',
  });
}

export function generateRefreshToken(user: TokenUserData): string {
  const payload: JWTPayload = {
    userId: user.id,
    clinicId: user.clinicId,
    role: user.role,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d', // Refresh token válido por 7 días
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
