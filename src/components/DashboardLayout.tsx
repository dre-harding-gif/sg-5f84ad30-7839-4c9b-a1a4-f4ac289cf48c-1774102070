import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { OfflineIndicator } from "@/components/OfflineIndicator";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <OfflineIndicator />
    </div>
  );
}