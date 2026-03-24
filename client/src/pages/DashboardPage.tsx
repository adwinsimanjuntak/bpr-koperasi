import { useEffect, useState } from "react";
import api from "@/api/client";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/Badge";
import { formatRp, formatRpFull } from "@/lib/format";

type DashboardData = {
  metrics: {
    totalLoansIssued: number;
    activeLoans: number;
    defaultRate: number;
    outstanding: number;
    collectedMtd: number;
    dueIn7DaysCount: number;
    dueIn7DaysAmount: number;
  };
  overdue: Array<{
    customerName: string;
    loanId: string;
    daysOverdue: number;
    outstanding: number;
    riskLevel: string;
  }>;
  recentActivity: Array<{ type: string; title: string; detail: string; at: string }>;
  riskBar: { goodPct: number; warningPct: number; defaultPct: number };
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .get<DashboardData>("/dashboard")
      .then((r) => setData(r.data))
      .catch(() => setErr("Failed to load dashboard"));
  }, []);

  return (
    <AppLayout breadcrumb="Admin / Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Portfolio Overview</h1>
            <p className="mt-1 text-sm text-ink-muted">Real-time performance metrics for the active lending cycle.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-slate-50"
            >
              Download Report
            </button>
            <a
              href="/loans"
              className="rounded-xl bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            >
              + New Loan Issue
            </a>
          </div>
        </div>

        {err && <p className="text-sm text-danger">{err}</p>}

        {data && (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl bg-gradient-to-br from-brand-gradientFrom to-brand-gradientTo p-6 text-white shadow-md lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Total Loans Issued</p>
                <p className="mt-3 text-3xl font-bold">{formatRp(data.metrics.totalLoansIssued, true)}</p>
                <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium">
                  ↗ 12.5% vs previous month
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Active Loans</p>
                  <span className="text-brand">◎</span>
                </div>
                <p className="mt-3 text-3xl font-bold text-ink">{data.metrics.activeLoans.toLocaleString("id-ID")}</p>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-3/4 rounded-full bg-brand" />
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Default Rate</p>
                  <span className="text-danger">⚠</span>
                </div>
                <p className="mt-3 text-3xl font-bold text-ink">{data.metrics.defaultRate.toFixed(2)}%</p>
                <p className="mt-1 text-xs text-ink-muted">PAR &gt; 30</p>
                <p className="mt-2 text-xs font-semibold text-success">−0.2% improvement</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Outstanding Amount</p>
                <p className="mt-3 text-2xl font-bold text-ink">{formatRpFull(data.metrics.outstanding)}</p>
                <p className="mt-2 text-xs text-ink-muted">Risk categorization applied to active portfolio.</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Amount Collected (MTD)</p>
                <p className="mt-3 text-2xl font-bold text-ink">{formatRpFull(data.metrics.collectedMtd)}</p>
                <p className="mt-2 text-sm font-semibold text-brand">94.2% Collection Rate</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Due in 7 Days</p>
                <p className="mt-3 text-2xl font-bold text-ink">{data.metrics.dueIn7DaysCount} Payments</p>
                <p className="mt-1 text-xs text-ink-muted">{formatRpFull(data.metrics.dueIn7DaysAmount)} projected</p>
                <button type="button" className="mt-3 text-sm font-semibold text-brand hover:underline">
                  View Schedule →
                </button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-ink">Urgent Alerts: Overdue Loans</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-ink-muted">
                        <th className="pb-3 font-medium">Customer</th>
                        <th className="pb-3 font-medium">Loan ID</th>
                        <th className="pb-3 font-medium">Days</th>
                        <th className="pb-3 font-medium">Outstanding</th>
                        <th className="pb-3 font-medium">Risk</th>
                        <th className="pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.overdue.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-ink-muted">
                            No overdue loans
                          </td>
                        </tr>
                      ) : (
                        data.overdue.map((row) => (
                          <tr key={row.loanId} className="border-b border-slate-50">
                            <td className="py-3 font-medium text-ink">{row.customerName}</td>
                            <td className="py-3 text-ink-muted">{row.loanId}</td>
                            <td className={`py-3 font-semibold ${row.daysOverdue > 30 ? "text-danger" : "text-ink"}`}>
                              {row.daysOverdue} Days
                            </td>
                            <td className="py-3">{formatRpFull(row.outstanding)}</td>
                            <td className="py-3">
                              <Badge kind={row.riskLevel}>{row.riskLevel} Risk</Badge>
                            </td>
                            <td className="py-3 text-brand">📞</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-ink">Recent Activity</h3>
                  <ul className="mt-4 space-y-4">
                    {data.recentActivity.slice(0, 6).map((a, i) => (
                      <li key={i} className="border-l-2 border-brand pl-4">
                        <p className="text-sm font-semibold text-ink">{a.title}</p>
                        <p className="text-xs text-ink-muted">{a.detail}</p>
                        <p className="mt-1 text-[11px] text-ink-muted/70">
                          {new Date(a.at).toLocaleString("id-ID")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-ink">Portfolio Risk Index</h3>
                  <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-slate-100">
                    <div className="bg-brand" style={{ width: `${data.riskBar.goodPct}%` }} title="Good" />
                    <div className="bg-warning" style={{ width: `${data.riskBar.warningPct}%` }} title="Warning" />
                    <div className="bg-danger" style={{ width: `${data.riskBar.defaultPct}%` }} title="Default" />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-ink-muted">
                    <span>Good {data.riskBar.goodPct}%</span>
                    <span>Warning {data.riskBar.warningPct}%</span>
                    <span>Default {data.riskBar.defaultPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
