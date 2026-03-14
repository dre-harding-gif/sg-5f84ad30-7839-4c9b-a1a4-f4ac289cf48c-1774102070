import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { UpcomingJobs } from "@/components/dashboard/UpcomingJobs";

export default function HomePage() {
  return (
    <>
      <SEO 
        title="Dashboard - Harding Homes Job Management"
        description="Manage your building projects, team schedules, and customer communications"
      />
      
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back to Harding Homes</p>
          </div>

          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentJobs />
            <UpcomingJobs />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}