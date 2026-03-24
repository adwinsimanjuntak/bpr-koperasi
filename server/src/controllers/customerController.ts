import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth";
import * as customerService from "../services/customerService";

export async function list(req: AuthedRequest, res: Response) {
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const sort = req.query.sort === "oldest" ? "oldest" : "newest";
  const data = await customerService.listCustomers({ page, pageSize, search, sort });
  res.json(data);
}

export async function getOne(req: AuthedRequest, res: Response) {
  const c = await customerService.getCustomerById(req.params.id);
  if (!c) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(c);
}

export async function create(req: AuthedRequest, res: Response) {
  try {
    const { name, ktp, phone, address, segment, status } = req.body as Record<string, string>;
    if (!name || !ktp || !phone || !address) {
      res.status(400).json({ error: "name, ktp, phone, address required" });
      return;
    }
    const c = await customerService.createCustomer({
      name,
      ktp,
      phone,
      address,
      segment,
      status: status as "ACTIVE" | "PENDING" | "OVERDUE" | undefined,
    });
    res.status(201).json(c);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Error" });
  }
}
