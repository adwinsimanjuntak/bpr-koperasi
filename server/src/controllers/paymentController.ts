import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth";
import * as paymentService from "../services/paymentService";

export async function create(req: AuthedRequest, res: Response) {
  try {
    const { loanId, amount, notes } = req.body as { loanId?: string; amount?: number; notes?: string };
    if (!loanId || amount == null) {
      res.status(400).json({ error: "loanId and amount required" });
      return;
    }
    const p = await paymentService.createPayment({ loanId, amount: Number(amount), notes });
    res.status(201).json(p);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Error" });
  }
}

export async function listByLoan(req: AuthedRequest, res: Response) {
  const items = await paymentService.listPaymentsForLoan(req.params.loanId);
  res.json(items);
}
