import { Router } from "express";
import * as customerController from "../controllers/customerController";
import { authMiddleware } from "../middleware/auth";

export const customerRouter = Router();
customerRouter.use(authMiddleware);
customerRouter.get("/", customerController.list);
customerRouter.post("/", customerController.create);
customerRouter.get("/:id", customerController.getOne);
