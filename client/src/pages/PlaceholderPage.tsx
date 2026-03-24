import { AppLayout } from "@/components/AppLayout";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <AppLayout breadcrumb={`Admin / ${title}`}>
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">This section is reserved for future modules.</p>
      </div>
    </AppLayout>
  );
}
