import { prisma } from "../lib/prisma";
import type { CustomerStatus } from "@prisma/client";

function randomCode(prefix: string): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${n}`;
}

export async function listCustomers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "newest" | "oldest";
}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
  const where = params.search
    ? {
        OR: [
          { name: { contains: params.search } },
          { customerCode: { contains: params.search } },
          { ktp: { contains: params.search } },
        ],
      }
    : {};
  const orderBy = params.sort === "oldest" ? { joinedAt: "asc" as const } : { joinedAt: "desc" as const };
  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      loans: {
        orderBy: { disbursedAt: "desc" },
        include: { payments: { orderBy: { paidAt: "desc" }, take: 5 } },
      },
    },
  });
  return customer;
}

export async function createCustomer(input: {
  name: string;
  ktp: string;
  phone: string;
  address: string;
  segment?: string;
  status?: CustomerStatus;
}) {
  let code = randomCode("CU");
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.customer.findUnique({ where: { customerCode: code } });
    if (!clash) break;
    code = randomCode("CU");
  }
  return prisma.customer.create({
    data: {
      customerCode: code,
      name: input.name,
      ktp: input.ktp,
      phone: input.phone,
      address: input.address,
      segment: input.segment ?? "Individual",
      status: input.status ?? "PENDING",
    },
  });
}
