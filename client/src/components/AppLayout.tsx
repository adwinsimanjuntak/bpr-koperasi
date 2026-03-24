import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout({
  children,
  breadcrumb,
  title,
}: {
  children: ReactNode;
  breadcrumb?: string;
  title?: string;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="pl-64">
        <Topbar breadcrumb={breadcrumb} title={title} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
