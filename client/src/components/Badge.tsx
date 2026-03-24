const variants: Record<string, string> = {
  ACTIVE: "bg-blue-50 text-brand border border-blue-100",
  COMPLETED: "bg-slate-100 text-ink-muted border border-slate-200",
  PENDING: "bg-slate-100 text-ink-muted border border-slate-200",
  OVERDUE: "bg-red-50 text-danger border border-red-100",
  DEFAULTED: "bg-orange-50 text-orange-700 border border-orange-100",
  HIGH: "bg-red-50 text-danger border border-red-100",
  MEDIUM: "bg-amber-50 text-warning border border-amber-100",
  LOW: "bg-blue-50 text-info border border-blue-100",
};

export function Badge({ children, kind }: { children: React.ReactNode; kind: keyof typeof variants | string }) {
  const cls = variants[kind] ?? "bg-slate-100 text-ink-muted border border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${cls}`}>
      {children}
    </span>
  );
}
