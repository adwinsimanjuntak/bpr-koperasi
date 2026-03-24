import { useEffect, useState } from "react";
import api from "@/api/client";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/Badge";
import { formatRpFull } from "@/lib/format";

type Loan = {
  id: string;
  loanCode: string;
  outstandingBalance: string | number;
  monthlyPayment: string | number;
  nextDueDate: string | null;
  status: string;
  customer: { name: string; customerCode: string };
};

type Payment = { id: string; amount: string | number; paidAt: string; notes: string | null };

export function PaymentsPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get<Loan[]>("/loans").then((r) => {
      setLoans(r.data);
      if (r.data[0]) setLoanId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!loanId) return;
    api.get<Payment[]>(`/payments/${loanId}`).then((r) => setPayments(r.data));
  }, [loanId]);

  const selected = loans.find((l) => l.id === loanId);
  const overdue =
    selected?.nextDueDate &&
    new Date(selected.nextDueDate) < new Date() &&
    Number(selected.outstandingBalance) > 0;

  async function record(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/payments", { loanId, amount, notes: note || undefined });
      setMsg("Payment recorded.");
      const p = await api.get<Payment[]>(`/payments/${loanId}`);
      setPayments(p.data);
      const r = await api.get<Loan[]>("/loans");
      setLoans(r.data);
    } catch {
      setMsg("Failed to record payment");
    }
  }

  return (
    <AppLayout breadcrumb="Admin / Payments">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Payments</h1>
          <p className="mt-1 text-sm text-ink-muted">Record repayments and monitor loan health.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-ink">Record payment</h2>
            <form onSubmit={record} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-ink-muted">Loan</label>
                <select
                  value={loanId}
                  onChange={(e) => setLoanId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.loanCode} — {l.customer.name}
                    </option>
                  ))}
                </select>
              </div>
              {selected && (
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Outstanding</span>
                    <span className="font-bold text-ink">{formatRpFull(Number(selected.outstandingBalance))}</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-ink-muted">Monthly due</span>
                    <span className="font-semibold">{formatRpFull(Number(selected.monthlyPayment))}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-ink-muted">Status</span>
                    {overdue ? <Badge kind="OVERDUE">Overdue</Badge> : <Badge kind={selected.status}>{selected.status}</Badge>}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold uppercase text-ink-muted">Amount (IDR)</label>
                <input
                  type="number"
                  required
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-ink-muted">Notes (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>
              {msg && <p className="text-sm text-brand">{msg}</p>}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo py-3 text-sm font-semibold text-white"
              >
                Post Payment
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-ink">Payment history</h2>
            <p className="text-xs text-ink-muted">Latest postings for selected loan.</p>
            <ul className="mt-4 divide-y divide-slate-100">
              {payments.length === 0 ? (
                <li className="py-6 text-center text-sm text-ink-muted">No payments yet</li>
              ) : (
                payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-semibold text-ink">{formatRpFull(Number(p.amount))}</p>
                      <p className="text-xs text-ink-muted">{new Date(p.paidAt).toLocaleString("id-ID")}</p>
                    </div>
                    {p.notes && <span className="text-xs text-ink-muted">{p.notes}</span>}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
