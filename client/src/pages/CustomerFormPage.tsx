import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/client";
import { AppLayout } from "@/components/AppLayout";

export function CustomerFormPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [ktp, setKtp] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [segment, setSegment] = useState("Individual / SME");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post<{ id: string }>("/customers", {
        name,
        ktp,
        phone,
        address,
        segment,
        status: "ACTIVE",
      });
      nav(`/customers/${data.id}`);
    } catch {
      setErr("Could not create customer");
    }
  }

  return (
    <AppLayout breadcrumb="Admin / New Customer">
      <div className="mx-auto max-w-xl rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-ink">Add New Customer</h1>
        <p className="mt-1 text-sm text-ink-muted">Capture borrower identity for registry.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-ink-muted">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-ink-muted">KTP</label>
            <input
              required
              value={ktp}
              onChange={(e) => setKtp(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-ink-muted">Phone</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-ink-muted">Address</label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-ink-muted">Segment</label>
            <input
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {err && <p className="text-sm text-danger">{err}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo py-3 text-sm font-semibold text-white shadow-sm"
          >
            Save Customer
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
