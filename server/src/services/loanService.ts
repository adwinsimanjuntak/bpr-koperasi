import { prisma } from "../lib/prisma";
import { computeMonthlyPayment, computeTotalRepayment } from "../utils/money";
function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

function loanCode(): string {
  return `L-${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function createLoan(input: {
  customerId: string;
  principalAmount: number;
  annualInterestPercent: number;
  tenorMonths: number;
}) {
  if (input.principalAmount <= 0 || input.tenorMonths <= 0) throw new Error("Invalid loan parameters");
  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer) throw new Error("Customer not found");

  const totalRepayment = computeTotalRepayment(
    input.principalAmount,
    input.annualInterestPercent,
    input.tenorMonths
  );
  const monthlyPayment = computeMonthlyPayment(totalRepayment, input.tenorMonths);
  const disbursedAt = new Date();
  const nextDueDate = addMonths(disbursedAt, 1);

  let code = loanCode();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.loan.findUnique({ where: { loanCode: code } });
    if (!clash) break;
    code = loanCode();
  }

  const loan = await prisma.loan.create({
    data: {
      loanCode: code,
      customerId: input.customerId,
      principalAmount: input.principalAmount,
      annualInterestPercent: input.annualInterestPercent,
      tenorMonths: input.tenorMonths,
      monthlyPayment,
      totalRepayment,
      outstandingBalance: totalRepayment,
      nextDueDate,
      disbursedAt,
      status: "ACTIVE",
    },
    include: { customer: true },
  });

  if (customer.status === "PENDING") {
    await prisma.customer.update({ where: { id: customer.id }, data: { status: "ACTIVE" } });
  }

  return loan;
}

export async function listLoans() {
  return prisma.loan.findMany({
    orderBy: { disbursedAt: "desc" },
    include: { customer: true, payments: { orderBy: { paidAt: "desc" }, take: 1 } },
  });
}

export async function getLoanById(id: string) {
  return prisma.loan.findUnique({
    where: { id },
    include: { customer: true, payments: { orderBy: { paidAt: "desc" } } },
  });
}

export async function refreshLoanStatus(loanId: string) {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan || loan.status === "COMPLETED") return loan;

  const outstanding = Number(loan.outstandingBalance);
  if (outstanding <= 0) {
    return prisma.loan.update({ where: { id: loanId }, data: { status: "COMPLETED", outstandingBalance: 0 } });
  }

  const due = loan.nextDueDate;
  if (due && loan.status === "ACTIVE") {
    const daysLate = Math.floor((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLate > 30) {
      return prisma.loan.update({ where: { id: loanId }, data: { status: "DEFAULTED" } });
    }
  }
  return loan;
}
