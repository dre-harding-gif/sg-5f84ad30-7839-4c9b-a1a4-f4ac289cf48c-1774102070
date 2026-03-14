import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

const recentJobs = [
  {
    id: "JOB-2401",
    customer: "Sarah Mitchell",
    address: "45 Oak Avenue, Manchester",
    type: "Kitchen Renovation",
    status: "in-progress",
    progress: 65,
  },
  {
    id: "JOB-2402",
    customer: "John Davis",
    address: "12 High Street, Liverpool",
    type: "Bathroom Refit",
    status: "scheduled",
    startDate: "2026-03-18",
  },
  {
    id: "JOB-2403",
    customer: "Emma Thompson",
    address: "88 Park Lane, Leeds",
    type: "Extension",
    status: "in-progress",
    progress: 35,
  },
];

export function RecentJobs() {
  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Recent Jobs</h2>
        <Link href="/jobs">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {recentJobs.map((job) => (
          <div key={job.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{job.id}</span>
                  <Badge variant={job.status === "in-progress" ? "default" : "secondary"}>
                    {job.status === "in-progress" ? "In Progress" : "Scheduled"}
                  </Badge>
                </div>
                <p className="font-medium">{job.customer}</p>
                <p className="text-sm text-muted-foreground">{job.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4" />
              <span>{job.address}</span>
            </div>

            {job.status === "in-progress" && job.progress && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{job.progress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}

            {job.status === "scheduled" && job.startDate && (
              <p className="text-sm text-muted-foreground mt-2">
                Starts: {new Date(job.startDate).toLocaleDateString("en-GB")}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}