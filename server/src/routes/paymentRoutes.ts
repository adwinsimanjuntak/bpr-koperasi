import { Router } from "express";
import * as paymentController from "../controllers/paymentController";
import { authMiddleware } from "../middleware/auth";

export const paymentRouter = Router();
paymentRouter.use(authMiddleware);
paymentRouter.post("/", paymentController.create);
paymentRouter.get("/:loanId", paymentController.listByLoan);
