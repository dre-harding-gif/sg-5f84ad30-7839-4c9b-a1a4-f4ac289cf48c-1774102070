import { ReactNode, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { OfflineIndicator } from "@/components/OfflineIndicator";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation 
        mobileOpen={mobileNavOpen} 
        onMobileClose={() => setMobileNavOpen(false)} 
      />
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <OfflineIndicator />
    </div>
  );
}