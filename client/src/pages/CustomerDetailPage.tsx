import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/api/client";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/Badge";
import { formatRpFull } from "@/lib/format";

type LoanRow = {
  id: string;
  loanCode: string;
  principalAmount: string | number;
  tenorMonths: number;
  status: string;
  outstandingBalance: string | number;
};

type CustomerDetail = {
  id: string;
  customerCode: string;
  name: string;
  ktp: string;
  phone: string;
  address: string;
  status: string;
  joinedAt: string;
  loans: LoanRow[];
};

export function CustomerDetailPage() {
  const { id } = useParams();
  const [c, setC] = useState<CustomerDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<CustomerDetail>(`/customers/${id}`).then((r) => setC(r.data));
  }, [id]);

  if (!c) {
    return (
      <AppLayout breadcrumb="Customers">
        <p className="text-ink-muted">Loading…</p>
      </AppLayout>
    );
  }

  const totalBorrowed = c.loans.reduce((s, l) => s + Number(l.principalAmount), 0);
  const remaining = c.loans.reduce((s, l) => s + Number(l.outstandingBalance), 0);
  const activeCount = c.loans.filter((l) => l.status === "ACTIVE").length;

  return (
    <AppLayout breadcrumb={`Customers › ${c.name}`}>
      <div className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-gradientFrom to-brand-gradientTo text-2xl font-bold text-white shadow-md">
              {c.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-ink">{c.name}</h1>
                <Badge kind={c.status}>{c.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                ID: {c.customerCode} · Joined{" "}
                {new Date(c.joinedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-slate-50"
            >
              Edit Profile
            </button>
            <Link
              to={`/loans?customerId=${c.id}`}
              className="rounded-xl bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              Create New Loan
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Customer Identity</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-ink-muted">National ID (KTP)</dt>
                <dd className="font-mono text-ink">{c.ktp}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Phone</dt>
                <dd className="text-ink">{c.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Address</dt>
                <dd className="text-ink-muted">{c.address}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Total Borrowed</p>
            <p className="mt-3 text-2xl font-bold text-ink">{formatRpFull(totalBorrowed)}</p>
            <p className="mt-1 text-xs text-ink-muted">Across {activeCount} active accounts</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Remaining Balance</p>
            <p className="mt-3 text-2xl font-bold text-ink">{formatRpFull(remaining)}</p>
            <p className="mt-1 text-xs text-ink-muted">Due over remaining tenor</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-brand-gradientFrom to-brand-gradientTo p-6 text-white shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">On-Time Rate</p>
            <p className="mt-3 text-3xl font-bold">98.4%</p>
            <p className="mt-1 text-sm text-white/90">A+ Credit Risk Grade</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Loan Portfolio History</h2>
            <div className="flex gap-2 text-ink-muted">⛭ ⬇</div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-ink-muted">
                  <th className="pb-3 font-medium">Loan ID</th>
                  <th className="pb-3 font-medium">Principal</th>
                  <th className="pb-3 font-medium">Tenor</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {c.loans.map((l) => (
                  <tr key={l.id} className="border-b border-slate-50">
                    <td className="py-3 font-mono text-brand">#{l.loanCode}</td>
                    <td className="py-3">{formatRpFull(Number(l.principalAmount))}</td>
                    <td className="py-3">{l.tenorMonths} Months</td>
                    <td className="py-3">
                      <Badge kind={l.status}>{l.status}</Badge>
                    </td>
                    <td className="py-3 font-semibold text-brand">{formatRpFull(Number(l.outstandingBalance))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <button type="button" className="text-sm font-semibold text-brand hover:underline">
              VIEW FULL TRANSACTION HISTORY
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="text-xl text-brand">🛡</span>
            <p className="text-sm text-ink">
              System Recommendation: Customer eligible for credit limit increase up to <strong>Rp 25.0M</strong>
            </p>
          </div>
          <div className="h-2 w-full max-w-xs rounded-full bg-white sm:ml-auto">
            <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
