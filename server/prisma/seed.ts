import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeMonthlyPayment, computeTotalRepayment } from "../src/utils/money";

const prisma = new PrismaClient();

function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

async function main() {
  await prisma.payment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("admin", 10);
  await prisma.user.create({
    data: {
      email: "admin",
      passwordHash,
      name: "Administrator",
      role: "ADMIN",
    },
  });

  const c1 = await prisma.customer.create({
    data: {
      customerCode: "CU-9042",
      name: "Aditya Saputra",
      ktp: "3174010203910001",
      phone: "+62 812-8899-2211",
      address: "Jl. Sudirman No. 45, Jakarta Selatan",
      segment: "Individual / SME",
      status: "ACTIVE",
      joinedAt: new Date("2021-10-01"),
    },
  });

  const c2 = await prisma.customer.create({
    data: {
      customerCode: "CU-7712",
      name: "Budi Santoso",
      ktp: "3174021504880002",
      phone: "+62 811-2233-4455",
      address: "Jl. Thamrin Kav. 10, Jakarta Pusat",
      segment: "Micro Enterprise",
      status: "ACTIVE",
    },
  });

  const c3 = await prisma.customer.create({
    data: {
      customerCode: "CU-6610",
      name: "Siti Aminah",
      ktp: "3276010105900003",
      phone: "+62 813-5566-7788",
      address: "Jl. Merdeka No. 2, Bandung",
      segment: "Individual",
      status: "ACTIVE",
    },
  });

  const principal = 15_000_000;
  const rate = 18;
  const tenor = 12;
  const total = computeTotalRepayment(principal, rate, tenor);
  const monthly = computeMonthlyPayment(total, tenor);
  const disbursed = new Date();
  disbursed.setMonth(disbursed.getMonth() - 2);

  await prisma.loan.create({
    data: {
      loanCode: "L-99210",
      customerId: c1.id,
      principalAmount: principal,
      annualInterestPercent: rate,
      tenorMonths: tenor,
      monthlyPayment: monthly,
      totalRepayment: total,
      outstandingBalance: monthly * 8,
      installmentsPaid: 4,
      nextDueDate: addMonths(disbursed, 5),
      disbursedAt: disbursed,
      status: "ACTIVE",
    },
  });

  const p2 = 10_000_000;
  const t2 = computeTotalRepayment(p2, 14, 6);
  const m2 = computeMonthlyPayment(t2, 6);
  await prisma.loan.create({
    data: {
      loanCode: "L-88241",
      customerId: c1.id,
      principalAmount: p2,
      annualInterestPercent: 14,
      tenorMonths: 6,
      monthlyPayment: m2,
      totalRepayment: t2,
      outstandingBalance: 0,
      installmentsPaid: 6,
      nextDueDate: null,
      disbursedAt: new Date("2023-05-12"),
      status: "COMPLETED",
    },
  });

  const overdueDue = new Date();
  overdueDue.setDate(overdueDue.getDate() - 42);
  await prisma.loan.create({
    data: {
      loanCode: "L-77192",
      customerId: c2.id,
      principalAmount: 20_000_000,
      annualInterestPercent: 16,
      tenorMonths: 24,
      monthlyPayment: computeMonthlyPayment(computeTotalRepayment(20_000_000, 16, 24), 24),
      totalRepayment: computeTotalRepayment(20_000_000, 16, 24),
      outstandingBalance: 7_900_000,
      installmentsPaid: 3,
      nextDueDate: overdueDue,
      disbursedAt: addMonths(overdueDue, -4),
      status: "ACTIVE",
    },
  });

  await prisma.loan.create({
    data: {
      loanCode: "L-66100",
      customerId: c3.id,
      principalAmount: 8_000_000,
      annualInterestPercent: 20,
      tenorMonths: 12,
      monthlyPayment: computeMonthlyPayment(computeTotalRepayment(8_000_000, 20, 12), 12),
      totalRepayment: computeTotalRepayment(8_000_000, 20, 12),
      outstandingBalance: 5_200_000,
      installmentsPaid: 2,
      nextDueDate: new Date(Date.now() - 20 * 86400 * 1000),
      disbursedAt: new Date(Date.now() - 120 * 86400 * 1000),
      status: "DEFAULTED",
    },
  });

  console.log("Seed OK — login: admin / admin");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
