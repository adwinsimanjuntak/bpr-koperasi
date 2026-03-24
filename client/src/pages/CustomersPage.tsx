import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/client";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/Badge";

type Customer = {
  id: string;
  customerCode: string;
  name: string;
  ktp: string;
  phone: string;
  address: string;
  segment: string | null;
  joinedAt: string;
  status: string;
};

export function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    api
      .get<{ items: Customer[]; total: number; page: number }>("/customers", {
        params: { page, pageSize, search: search || undefined, sort },
      })
      .then((r) => {
        setItems(r.data.items);
        setTotal(r.data.total);
      })
      .catch(() => {});
  }, [page, search, sort]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <AppLayout breadcrumb="Admin / Customer Management">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Borrowers Registry</h1>
            <p className="mt-1 text-sm text-ink-muted">Manage borrower accounts and verification status.</p>
          </div>
          <Link
            to="/customers/new"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            + Add New Customer
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Total Active Borrowers</p>
            <p className="mt-3 text-3xl font-bold text-ink">{total.toLocaleString("id-ID")}</p>
            <p className="mt-2 text-xs font-semibold text-success">+12% vs last month</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Pending Verification</p>
            <p className="mt-3 text-3xl font-bold text-ink">148</p>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 w-2/3 rounded-full bg-brand" />
            </div>
            <p className="mt-2 text-xs text-ink-muted">67% of weekly target reached</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Risk Assessment</p>
            <p className="mt-3 text-3xl font-bold text-ink">Low</p>
            <p className="mt-2 text-xs text-ink-muted">Portfolio stability within 0.4% deviation.</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative mx-auto w-full max-w-md flex-1 sm:mx-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">⌕</span>
                <input
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search borrowers by name, KTP or ID..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm"
              >
                Filter
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="oldest">Sort by: Oldest</option>
              </select>
            </div>
            <p className="text-xs text-ink-muted">
              Showing {start}-{end} of {total} customers
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-ink-muted">
                  <th className="pb-3 font-medium">Customer ID</th>
                  <th className="pb-3 font-medium">Borrower Name</th>
                  <th className="pb-3 font-medium">KTP / ID</th>
                  <th className="pb-3 font-medium">Phone &amp; Address</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="py-3 font-mono text-xs text-ink-muted">{c.customerCode}</td>
                    <td className="py-3">
                      <Link to={`/customers/${c.id}`} className="flex items-center gap-3 group">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-brand">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        <span>
                          <span className="font-semibold text-ink group-hover:text-brand">{c.name}</span>
                          <span className="block text-xs text-ink-muted">{c.segment || "Individual"}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 font-mono text-xs">{c.ktp}</td>
                    <td className="py-3 text-xs text-ink-muted">
                      {c.phone}
                      <span className="mt-1 line-clamp-2 block">{c.address}</span>
                    </td>
                    <td className="py-3 text-xs text-ink-muted">
                      {new Date(c.joinedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3">
                      <Badge kind={c.status}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium ${
                    page === n ? "bg-brand text-white" : "border border-slate-200 bg-white text-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
              {totalPages > 5 && <span className="px-2 py-1 text-ink-muted">… {totalPages}</span>}
            </div>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm text-ink-muted">
                  Ensure KTP verification is completed before disbursement. Use the verification checklist for
                  consistency.
                </p>
                <button type="button" className="mt-3 text-sm font-semibold text-brand hover:underline">
                  View Verification Guidelines →
                </button>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-ink">Risk Distribution</p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-ink-muted">
                  <span>Low Risk (A–B)</span>
                  <span>72%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[72%] rounded-full bg-brand" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-ink-muted">
                  <span>Moderate (C)</span>
                  <span>18%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[18%] rounded-full bg-blue-200" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-ink-muted">
                  <span>High (D–E)</span>
                  <span>10%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div className="h-2 w-[10%] rounded-full bg-red-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
