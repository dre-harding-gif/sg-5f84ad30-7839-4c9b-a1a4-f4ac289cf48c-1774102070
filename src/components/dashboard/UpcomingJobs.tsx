import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import Link from "next/link";

const upcomingJobs = [
  {
    id: "JOB-2404",
    customer: "Michael Brown",
    type: "Loft Conversion",
    date: "2026-03-16",
    time: "09:00",
    assignedTo: "Team A",
  },
  {
    id: "JOB-2405",
    customer: "Lisa Anderson",
    type: "New Build",
    date: "2026-03-17",
    time: "08:30",
    assignedTo: "Team B",
  },
  {
    id: "JOB-2406",
    customer: "David Wilson",
    type: "Roof Repair",
    date: "2026-03-18",
    time: "10:00",
    assignedTo: "Team A",
  },
];

export function UpcomingJobs() {
  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Upcoming Schedule</h2>
        <Link href="/schedule">
          <Button variant="ghost" size="sm">
            View Calendar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {upcomingJobs.map((job) => {
          const jobDate = new Date(job.date);
          const formattedDate = `${jobDate.toLocaleDateString("en-GB", { weekday: "short" })}, ${jobDate.getDate()} ${jobDate.toLocaleDateString("en-GB", { month: "short" })}`;
          
          return (
            <div key={job.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-semibold text-sm text-primary">{job.id}</span>
                  <p className="font-medium mt-1">{job.customer}</p>
                  <p className="text-sm text-muted-foreground">{job.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formattedDate}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{job.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm mt-3 pt-3 border-t border-border">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Assigned to:</span>
                <span className="font-medium">{job.assignedTo}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}