import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { db, User } from "./db";

const JWT_SECRET = "CLZERO_ENTERPRISE_SOC_SUPER_SECRET_TOKEN_SIGNING_KEY_2026";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Creates a simple secure JWT-like token using HMAC SHA256.
 * Completely self-contained, high-performance, and has zero external dependencies!
 */
export function generateToken(payload: { userId: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 * 7 })).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${claims}`)
    .digest("base64url");
    
  return `${header}.${claims}.${signature}`;
}

/**
 * Verifies the self-contained secure token.
 */
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [header, claims, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${claims}`)
      .digest("base64url");
      
    if (signature !== expectedSignature) return null;
    
    const decodedClaims = JSON.parse(Buffer.from(claims, "base64url").toString("utf-8"));
    if (decodedClaims.exp && decodedClaims.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    
    return { userId: decodedClaims.userId, email: decodedClaims.email };
  } catch (err) {
    return null;
  }
}

/**
 * Authentication Middleware for Express api endpoints.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No authorization token provided." });
  }
  
  const token = authHeader.split(" ")[1];
  const claims = verifyToken(token);
  if (!claims) {
    return res.status(401).json({ error: "Invalid or expired authorization token." });
  }
  
  const user = db.getUserById(claims.userId);
  if (!user) {
    return res.status(401).json({ error: "User profile no longer exists in system registry." });
  }
  
  req.user = user;
  next();
}
