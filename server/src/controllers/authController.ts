import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth";
import * as authService from "../services/authService";

export async function register(req: AuthedRequest, res: Response) {
  try {
    const { email, password, name, role } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      role?: "ADMIN" | "STAFF";
    };
    if (!email || !password || !name) {
      res.status(400).json({ error: "email, password, name required" });
      return;
    }
    const result = await authService.register({ email, password, name, role });
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Error" });
  }
}

export async function login(req: AuthedRequest, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: "email and password required" });
      return;
    }
    const result = await authService.login({ email, password });
    res.json(result);
  } catch {
    res.status(401).json({ error: "Invalid credentials" });
  }
}
