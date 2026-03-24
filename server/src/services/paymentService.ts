import { prisma } from "../lib/prisma";
import { refreshLoanStatus } from "./loanService";

function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

export async function createPayment(input: { loanId: string; amount: number; notes?: string }) {
  if (input.amount <= 0) throw new Error("Amount must be positive");

  const loan = await prisma.loan.findUnique({ where: { id: input.loanId } });
  if (!loan) throw new Error("Loan not found");
  if (loan.status === "COMPLETED") throw new Error("Loan already completed");

  const monthly = Number(loan.monthlyPayment);
  const outstandingBefore = Number(loan.outstandingBalance);
  const pay = Math.min(input.amount, outstandingBefore);
  let newOutstanding = outstandingBefore - pay;

  const additional = Math.floor(pay / monthly);
  let newInstallments = loan.installmentsPaid + additional;
  if (newInstallments > loan.tenorMonths) newInstallments = loan.tenorMonths;

  let nextDue: Date | null = loan.nextDueDate;
  if (newOutstanding <= 0) {
    newOutstanding = 0;
    nextDue = null;
  } else {
    nextDue = addMonths(loan.disbursedAt, newInstallments + 1);
  }

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        loanId: input.loanId,
        amount: pay,
        notes: input.notes,
      },
    }),
    prisma.loan.update({
      where: { id: input.loanId },
      data: {
        outstandingBalance: newOutstanding,
        installmentsPaid: newInstallments,
        nextDueDate: nextDue,
        status: newOutstanding <= 0 ? "COMPLETED" : loan.status,
      },
    }),
  ]);

  await refreshLoanStatus(input.loanId);
  return payment;
}

export async function listPaymentsForLoan(loanId: string) {
  return prisma.payment.findMany({
    where: { loanId },
    orderBy: { paidAt: "desc" },
  });
}
