import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth";
import * as dashboardService from "../services/dashboardService";

export async function get(req: AuthedRequest, res: Response) {
  const data = await dashboardService.getDashboard();
  res.json(data);
}
