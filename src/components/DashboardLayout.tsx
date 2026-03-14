import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}