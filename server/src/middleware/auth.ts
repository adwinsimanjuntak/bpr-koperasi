import type { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { verifyToken } from "../utils/jwt";

export type AuthedRequest = Request & {
  user?: { id: string; email: string; role: string };
};

const BYPASS_USER = { id: "dev-bypass", email: "dev@local", role: "ADMIN" as const };

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  if (config.authBypass) {
    req.user = { ...BYPASS_USER };
    next();
    return;
  }

  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
