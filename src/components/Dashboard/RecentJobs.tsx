import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Job } from "@/types";

interface RecentJobsProps {
  jobs: Job[];
}

const statusColors = {
  lead: "bg-yellow-100 text-yellow-800",
  quoted: "bg-blue-100 text-blue-800",
  scheduled: "bg-purple-100 text-purple-800",
  "in-progress": "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  "on-hold": "bg-gray-100 text-gray-800",
};

export function RecentJobs({ jobs }: RecentJobsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-heading">Recent Jobs</CardTitle>
        <Link href="/jobs">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-sm">{job.title}</h4>
                  <Badge className={statusColors[job.status]} variant="secondary">
                    {job.status.replace("-", " ")}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="mr-4">{job.address}</span>
                  <span className="text-xs">#{job.jobNumber}</span>
                </div>
              </div>
              <Link href={`/jobs/${job.id}`}>
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}