import { Router } from "express";
import * as loanController from "../controllers/loanController";
import { authMiddleware } from "../middleware/auth";

export const loanRouter = Router();
loanRouter.use(authMiddleware);
loanRouter.get("/", loanController.list);
loanRouter.post("/", loanController.create);
loanRouter.get("/:id", loanController.getOne);
