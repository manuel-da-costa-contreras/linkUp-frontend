"use client";

import { ReactNode, useState } from "react";
import { DashboardFooter } from "@components/ui/dashboard/DashboardFooter";
import { Sidebar } from "@components/ui/dashboard/Sidebar";
import { TopBar } from "@components/ui/dashboard/TopBar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-neutral-100">
      <TopBar onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
      <div className="flex min-h-0 flex-1 w-full">
        <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}


