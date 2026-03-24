import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRoutes";
import { customerRouter } from "./routes/customerRoutes";
import { loanRouter } from "./routes/loanRoutes";
import { paymentRouter } from "./routes/paymentRoutes";
import { dashboardRouter } from "./routes/dashboardRoutes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/customers", customerRouter);
app.use("/loans", loanRouter);
app.use("/payments", paymentRouter);
app.use("/dashboard", dashboardRouter);

app.use(errorHandler);
