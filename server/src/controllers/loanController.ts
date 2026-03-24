import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth";
import * as loanService from "../services/loanService";

export async function list(req: AuthedRequest, res: Response) {
  const loans = await loanService.listLoans();
  res.json(loans);
}

export async function getOne(req: AuthedRequest, res: Response) {
  const loan = await loanService.getLoanById(req.params.id);
  if (!loan) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(loan);
}

export async function create(req: AuthedRequest, res: Response) {
  try {
    const { customerId, principalAmount, annualInterestPercent, tenorMonths } = req.body as Record<
      string,
      unknown
    >;
    if (!customerId || principalAmount == null || annualInterestPercent == null || tenorMonths == null) {
      res.status(400).json({ error: "customerId, principalAmount, annualInterestPercent, tenorMonths required" });
      return;
    }
    const loan = await loanService.createLoan({
      customerId: String(customerId),
      principalAmount: Number(principalAmount),
      annualInterestPercent: Number(annualInterestPercent),
      tenorMonths: Number(tenorMonths),
    });
    res.status(201).json(loan);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Error" });
  }
}
