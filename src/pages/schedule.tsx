import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 14)); // March 14, 2026

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  // Mock scheduled jobs
  const scheduledJobs = [
    {
      date: 14,
      jobs: [
        { id: "1", title: "Kitchen Extension - Mitchell", team: "Team A", time: "08:00" },
        { id: "2", title: "Bathroom Refit - Davis", team: "Team B", time: "09:00" },
      ],
    },
    {
      date: 15,
      jobs: [
        { id: "3", title: "Loft Conversion - Brown", team: "Team A", time: "09:00" },
      ],
    },
    {
      date: 18,
      jobs: [
        { id: "4", title: "Extension - Thompson", team: "Team B", time: "08:30" },
        { id: "5", title: "Roof Repair - Wilson", team: "Team A", time: "10:00" },
      ],
    },
  ];

  const getJobsForDay = (day: number) => {
    const dayJobs = scheduledJobs.find(s => s.date === day);
    return dayJobs ? dayJobs.jobs : [];
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground mt-1">View and manage job assignments</p>
          </div>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Add to Schedule
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="min-h-24 p-2 bg-gray-50 rounded"></div>
              ))}

              {/* Calendar days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const jobs = getJobsForDay(day);
                const isToday = day === 14; // Mock today as 14th

                return (
                  <div
                    key={day}
                    className={`min-h-24 p-2 border rounded-lg ${
                      isToday ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isToday ? "text-primary" : ""}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {jobs.slice(0, 2).map((job) => (
                        <div
                          key={job.id}
                          className="text-xs p-1 bg-orange-100 text-orange-800 rounded truncate"
                        >
                          <p className="font-medium truncate">{job.time}</p>
                          <p className="truncate">{job.title}</p>
                        </div>
                      ))}
                      {jobs.length > 2 && (
                        <p className="text-xs text-muted-foreground">+{jobs.length - 2} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming jobs list */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upcoming Jobs This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledJobs.flatMap(s => s.jobs.map(job => ({ ...job, date: s.date }))).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{job.title}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {monthNames[currentDate.getMonth()]} {job.date} • {job.time}
                      </p>
                      <Badge variant="secondary">{job.team}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Job</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}