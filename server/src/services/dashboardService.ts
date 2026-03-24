import { prisma } from "../lib/prisma";
import { refreshLoanStatus } from "./loanService";

async function ensureStatuses() {
  const active = await prisma.loan.findMany({ where: { status: "ACTIVE" }, select: { id: true } });
  await Promise.all(active.map((l) => refreshLoanStatus(l.id)));
}

export async function getDashboard() {
  await ensureStatuses();

  const loans = await prisma.loan.findMany({ include: { customer: true } });
  const payments = await prisma.payment.findMany({ orderBy: { paidAt: "desc" }, take: 20 });
  const customers = await prisma.customer.count();

  const totalPrincipalIssued = loans.reduce((s, l) => s + Number(l.principalAmount), 0);
  const activeLoans = loans.filter((l) => l.status === "ACTIVE").length;
  const defaulted = loans.filter((l) => l.status === "DEFAULTED").length;
  const defaultRate = loans.length ? (defaulted / loans.length) * 100 : 0;

  const outstanding = loans.reduce((s, l) => s + Number(l.outstandingBalance), 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const mtdCollected = payments
    .filter((p) => p.paidAt >= startOfMonth)
    .reduce((s, p) => s + Number(p.amount), 0);

  const dueSoonDate = new Date();
  dueSoonDate.setDate(dueSoonDate.getDate() + 7);
  const dueSoonLoans = loans.filter(
    (l) =>
      l.status === "ACTIVE" &&
      l.nextDueDate &&
      l.nextDueDate <= dueSoonDate &&
      l.nextDueDate >= new Date()
  );

  const overdueLoans = loans.filter((l) => {
    if (l.status !== "ACTIVE" || !l.nextDueDate) return false;
    return l.nextDueDate < new Date() && Number(l.outstandingBalance) > 0;
  });

  const overdueRows = overdueLoans.map((l) => {
    const days = Math.max(
      0,
      Math.floor((Date.now() - (l.nextDueDate as Date).getTime()) / (86400 * 1000))
    );
    let risk: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    if (days > 30) risk = "HIGH";
    else if (days > 14) risk = "MEDIUM";
    return {
      customerId: l.customerId,
      customerName: l.customer.name,
      loanId: l.loanCode,
      daysOverdue: days,
      outstanding: Number(l.outstandingBalance),
      riskLevel: risk,
    };
  });

  const recentActivity: Array<{
    type: string;
    title: string;
    detail: string;
    at: string;
  }> = [];

  const recentLoans = await prisma.loan.findMany({
    orderBy: { disbursedAt: "desc" },
    take: 5,
    include: { customer: true },
  });
  for (const l of recentLoans) {
    recentActivity.push({
      type: "disbursement",
      title: "New Loan Disbursement",
      detail: `Rp ${Number(l.principalAmount).toLocaleString("id-ID")} to ${l.customer.name}`,
      at: l.disbursedAt.toISOString(),
    });
  }

  for (const p of payments.slice(0, 5)) {
    const loan = loans.find((x) => x.id === p.loanId);
    if (!loan) continue;
    recentActivity.push({
      type: "repayment",
      title: "Repayment Received",
      detail: `Loan ${loan.loanCode} — Rp ${Number(p.amount).toLocaleString("id-ID")}`,
      at: p.paidAt.toISOString(),
    });
  }

  recentActivity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const uniqueActivity = recentActivity.slice(0, 8);

  const good = loans.filter((l) => l.status === "ACTIVE" && Number(l.outstandingBalance) > 0).length;
  const warn = loans.filter((l) => l.status === "ACTIVE" && l.nextDueDate && l.nextDueDate < new Date()).length;
  const bad = loans.filter((l) => l.status === "DEFAULTED").length;
  const denom = good + warn + bad || 1;

  return {
    metrics: {
      totalLoansIssued: totalPrincipalIssued,
      activeLoans,
      defaultRate,
      outstanding,
      collectedMtd: mtdCollected,
      dueIn7DaysCount: dueSoonLoans.length,
      dueIn7DaysAmount: dueSoonLoans.reduce((s, l) => s + Number(l.monthlyPayment), 0),
      totalCustomers: customers,
    },
    overdue: overdueRows,
    recentActivity: uniqueActivity,
    riskBar: {
      goodPct: Math.round((good / denom) * 100),
      warningPct: Math.round((warn / denom) * 100),
      defaultPct: Math.round((bad / denom) * 100),
    },
  };
}
