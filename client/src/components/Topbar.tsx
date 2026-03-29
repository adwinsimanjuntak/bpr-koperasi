import { useAuth } from "@/context/AuthContext";
import { useSignOut } from "@/hooks/useSignOut";
import { userInitials } from "@/lib/userInitials";

type Props = { title?: string; breadcrumb?: string };

function formatRole(role: string) {
  return role ? role.charAt(0) + role.slice(1).toLowerCase() : "";
}

export function Topbar({ title, breadcrumb }: Props) {
  const { user } = useAuth();
  const signOut = useSignOut();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="flex items-center gap-4 px-8 py-4">
        {breadcrumb && (
          <div className="hidden shrink-0 text-xs font-medium text-ink-muted md:block">{breadcrumb}</div>
        )}
        <div className="relative mx-auto max-w-2xl flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">⌕</span>
          <input
            type="search"
            placeholder="Search loans, customers, or transactions..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted/80 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-ink-muted hover:bg-slate-50"
            aria-label="Notifications"
          >
            🔔
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-ink-muted hover:bg-slate-50"
            aria-label="Help"
          >
            ?
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
              <div className="max-w-[140px] text-right">
                <div className="truncate text-xs font-semibold text-ink">{user?.name ?? "—"}</div>
                <div className="truncate text-[11px] text-ink-muted">{user ? formatRole(user.role) : ""}</div>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-ink">
                {userInitials(user)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ink-muted hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      {title && (
        <div className="border-t border-slate-100 px-8 pb-4 pt-2">
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
        </div>
      )}
    </header>
  );
}
