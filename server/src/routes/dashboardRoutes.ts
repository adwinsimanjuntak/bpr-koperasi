import { Router } from "express";
import * as dashboardController from "../controllers/dashboardController";
import { authMiddleware } from "../middleware/auth";

export const dashboardRouter = Router();
dashboardRouter.use(authMiddleware);
dashboardRouter.get("/", dashboardController.get);
