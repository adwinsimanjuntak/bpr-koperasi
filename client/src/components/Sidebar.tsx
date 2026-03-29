import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSignOut } from "@/hooks/useSignOut";
import { userInitials } from "@/lib/userInitials";

const items = [
  { to: "/", label: "Dashboard", icon: "◉" },
  { to: "/customers", label: "Customers", icon: "◎" },
  { to: "/loans", label: "Loans", icon: "◇" },
  { to: "/payments", label: "Payments", icon: "▣" },
  { to: "/reports", label: "Reports", icon: "▤" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

function formatRole(role: string) {
  return role ? role.charAt(0) + role.slice(1).toLowerCase() : "";
}

export function Sidebar() {
  const { user } = useAuth();
  const signOut = useSignOut();
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gradientFrom to-brand-gradientTo text-lg text-white shadow-sm">
            ⌂
          </div>
          <div>
            <div className="text-sm font-bold text-ink">BPR Ledger</div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">Micro-Lending OS</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-brand"
                  : "text-ink-muted hover:bg-slate-50 hover:text-ink"
              }`
            }
          >
            <span className="text-base opacity-80">{it.icon}</span>
            {it.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={() => signOut()}
          className="mb-3 w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-ink-muted hover:bg-slate-50"
        >
          Sign out
        </button>
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-gradientFrom to-brand-gradientTo text-sm font-bold text-white">
            {userInitials(user)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">{user?.name ?? "—"}</div>
            <div className="truncate text-xs text-ink-muted">{user ? formatRole(user.role) : ""}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
