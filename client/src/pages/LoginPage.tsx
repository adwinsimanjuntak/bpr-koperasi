import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/client";

function formatLoginError(err: unknown, mode: "login" | "register"): string {
  if (axios.isAxiosError(err) && err.response) {
    const data = err.response.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    if (err.response.status === 401 && mode === "login") {
      return "Invalid email or password. If you never ran the database seed, open a terminal in the server folder and run: npx prisma db seed";
    }
  }
  if (axios.isAxiosError(err) && !err.response) {
    return "Cannot reach the API. Start the backend on port 4001 (server: npm run dev) and check DATABASE_URL in server/.env.";
  }
  return mode === "login" ? "Login failed" : "Registration failed";
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const emailTrim = email.trim();
      if (mode === "login") {
        await login(emailTrim, password);
      } else {
        await api.post("/auth/register", { email: emailTrim, password, name, role });
        await login(emailTrim, password);
      }
      navigate(from, { replace: true });
    } catch (e) {
      setErr(formatLoginError(e, mode));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-surface">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-md md:grid-cols-2">
          <div className="relative hidden flex-col justify-between bg-gradient-to-br from-blue-50 via-white to-slate-50 p-10 md:flex">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gradientFrom to-brand-gradientTo text-lg text-white shadow-sm">
                  ⌂
                </div>
                <span className="text-lg font-bold text-ink">BPR Ledger</span>
              </div>
              <h1 className="mt-10 text-3xl font-bold leading-tight text-ink">Micro-Lending Reimagined.</h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
                Institutional-grade financial operating system for emerging markets. Secure, transparent, and built for
                scale.
              </p>
            </div>
            <div className="mt-12 flex justify-end opacity-40">
              <div className="h-40 w-56 rounded-2xl bg-gradient-to-br from-blue-100 to-slate-200 shadow-inner" />
            </div>
            <div className="mt-8 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs font-medium text-brand">
              <span className="text-success">✓</span>
              PCI DSS Level 1 Compliant Encryption
            </div>
          </div>

          <div className="relative p-8 sm:p-10">
            <div className="absolute right-8 top-8 flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-full px-4 py-1.5 ${mode === "login" ? "bg-white text-brand shadow-sm" : "text-ink-muted"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-full px-4 py-1.5 ${mode === "register" ? "bg-white text-brand shadow-sm" : "text-ink-muted"}`}
              >
                Register
              </button>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold text-ink">Welcome Back</h2>
              <p className="mt-2 text-sm text-ink-muted">Please enter your credentials to access the ledger.</p>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("STAFF")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${
                    role === "STAFF" ? "border-brand text-brand" : "border-slate-200 text-ink-muted"
                  }`}
                >
                  💼 Staff
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${
                    role === "ADMIN" ? "border-brand text-brand" : "border-slate-200 text-ink-muted"
                  }`}
                >
                  🛡 Admin
                </button>
              </div>

              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Full name
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">👤</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100"
                      placeholder="Your name"
                      required={mode === "register"}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Institutional ID / Email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">👤</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. STF-8829-JKT or email"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Security Passkey</label>
                  <button type="button" className="text-[11px] font-bold uppercase text-brand hover:underline">
                    Recover access?
                  </button>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">🔒</span>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-12 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    aria-label="Toggle password"
                  >
                    👁
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-ink-muted">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand" defaultChecked />
                Maintain session for 24 hours
              </label>

              {err && <p className="text-sm text-danger">{err}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo py-3.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "…" : "Authorize Access →"}
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
              <span>System Version 4.2.0-Stable</span>
              <div className="flex gap-4">
                <button type="button" className="hover:text-ink">
                  Terms of Service
                </button>
                <button type="button" className="hover:text-ink">
                  System Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-ink shadow-md">
        <span className="h-2 w-2 rounded-full bg-success" />
        Core Engine Online: Jakarta Cluster
      </div>
    </div>
  );
}
