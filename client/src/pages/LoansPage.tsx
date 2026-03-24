import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/api/client";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/Badge";
import { computeLoanPreview, formatRpFull } from "@/lib/format";

type CustomerOpt = { id: string; name: string; customerCode: string };
type Loan = {
  id: string;
  loanCode: string;
  principalAmount: string | number;
  outstandingBalance: string | number;
  monthlyPayment: string | number;
  nextDueDate: string | null;
  status: string;
  customer: CustomerOpt;
};

export function LoansPage() {
  const [params] = useSearchParams();
  const preCustomer = params.get("customerId") || "";

  const [customers, setCustomers] = useState<CustomerOpt[]>([]);
  const [customerId, setCustomerId] = useState(preCustomer);
  const [principal, setPrincipal] = useState(10_000_000);
  const [rate, setRate] = useState(18);
  const [tenor, setTenor] = useState(12);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [msg, setMsg] = useState("");

  const preview = useMemo(() => computeLoanPreview(principal, rate, tenor), [principal, rate, tenor]);

  useEffect(() => {
    api.get<{ items: CustomerOpt[] }>("/customers", { params: { pageSize: 200 } }).then((r) => {
      setCustomers(r.data.items);
      if (preCustomer) setCustomerId(preCustomer);
    });
  }, [preCustomer]);

  useEffect(() => {
    api.get<Loan[]>("/loans").then((r) => setLoans(r.data));
  }, []);

  async function disburse(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/loans", {
        customerId,
        principalAmount: principal,
        annualInterestPercent: rate,
        tenorMonths: tenor,
      });
      setMsg("Loan created and disbursed.");
      const r = await api.get<Loan[]>("/loans");
      setLoans(r.data);
    } catch {
      setMsg("Failed to create loan");
    }
  }

  const months = ["OCT", "NOV", "DEC", "JAN", "FEB", "MAR"];
  const barHeights = [45, 52, 48, 55, 50, 58];

  return (
    <AppLayout breadcrumb="Admin / Loans">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Loans Management</h1>
          <p className="mt-1 text-sm text-ink-muted">Originate, track, and monitor active portfolio.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-gradientFrom to-brand-gradientTo p-6 text-white shadow-md lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Total Outstanding Portfolio</p>
            <p className="mt-3 text-3xl font-bold">
              {formatRpFull(loans.reduce((s, l) => s + Number(l.outstandingBalance), 0))}
            </p>
            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <span>
                Active loans: <strong>{loans.filter((l) => l.status === "ACTIVE").length}</strong>
              </span>
              <span>Avg yield: 12.4%</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">+4.2% from last month</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-ink">Repayment Health</p>
            <p className="mt-4 text-xs text-ink-muted">On-Time Repayments</p>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div className="h-2 w-[94%] rounded-full bg-brand" />
            </div>
            <p className="mt-4 text-xs text-ink-muted">Portfolio at Risk (PAR 30)</p>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div className="h-2 w-[3%] rounded-full bg-danger" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-brand">+ New Loan Application</h2>
            <form onSubmit={disburse} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-ink-muted">Customer selection</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select existing customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.customerCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-ink-muted">Principal amount (IDR)</label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-muted">Interest rate (% annual)</label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-muted">Tenor (months)</label>
                  <input
                    type="number"
                    value={tenor}
                    onChange={(e) => setTenor(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </div>
              </div>
              <div className="rounded-xl bg-blue-50/80 p-4 text-sm">
                <p>
                  Estimated monthly: <strong>{formatRpFull(Math.round(preview.monthly))}</strong>
                </p>
                <p className="mt-2 text-xs text-ink-muted">
                  Total interest: {formatRpFull(Math.round(preview.totalInterest))} · Effective APR: {preview.apr.toFixed(1)}%
                </p>
              </div>
              {msg && <p className="text-sm text-brand">{msg}</p>}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo py-3 text-sm font-semibold text-white shadow-sm"
              >
                Generate &amp; Disburse Loan
              </button>
            </form>
            <div className="mt-4 flex gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-ink-muted">
              <span>ⓘ</span>
              <span>Disbursements above Rp 50.000.000 require secondary verification.</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-ink">Active Loan Portfolio</h2>
              <p className="text-xs text-ink-muted">Real-time status tracking for current disbursements.</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-ink-muted">
                      <th className="pb-2">Customer</th>
                      <th className="pb-2">Disbursed</th>
                      <th className="pb-2">Balance</th>
                      <th className="pb-2">Next due</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.slice(0, 8).map((l) => (
                      <tr key={l.id} className="border-b border-slate-50">
                        <td className="py-2">
                          <span className="font-medium text-ink">{l.customer.name}</span>
                        </td>
                        <td className="py-2">{formatRpFull(Number(l.principalAmount))}</td>
                        <td className="py-2 font-semibold text-brand">{formatRpFull(Number(l.outstandingBalance))}</td>
                        <td className="py-2 text-xs text-ink-muted">
                          {l.nextDueDate ? new Date(l.nextDueDate).toLocaleDateString("id-ID") : "—"}
                        </td>
                        <td className="py-2">
                          <Badge kind={l.status}>{l.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-ink">Schedule Preview (next 6 months)</h3>
              <div className="mt-6 flex h-40 items-end justify-between gap-2">
                {months.map((m, i) => (
                  <div key={m} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full max-w-[48px] flex-col justify-end overflow-hidden rounded-md border border-slate-100 bg-slate-50">
                      <div
                        className="bg-brand"
                        style={{ height: `${barHeights[i] ?? 40}%` }}
                        title="Principal"
                      />
                      <div className="bg-slate-400" style={{ height: `${100 - (barHeights[i] ?? 40)}%` }} title="Interest" />
                    </div>
                    <span className={`text-[10px] font-medium ${i === 5 ? "text-brand" : "text-ink-muted"}`}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Collected Today", value: "Rp 42.500.000" },
            { label: "Pending Approvals", value: "8 Applications" },
            { label: "Average Interest", value: "14.8%" },
            { label: "Non-Performing Loans", value: "1.2%", danger: true },
          ].map((x) => (
            <div key={x.label} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{x.label}</p>
              <p className={`mt-3 text-xl font-bold ${x.danger ? "text-danger" : "text-ink"}`}>{x.value}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
