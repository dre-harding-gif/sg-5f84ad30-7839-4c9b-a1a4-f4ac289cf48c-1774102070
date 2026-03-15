import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const mockSchedule = [
  { id: "1", title: "Kitchen Extension", customer: "Sarah Mitchell", date: "2026-03-17", team: "Mike, Tom", status: "in_progress" },
  { id: "2", title: "Bathroom Refit", customer: "John Davis", date: "2026-03-18", team: "Steve", status: "scheduled" },
  { id: "3", title: "Loft Conversion", customer: "Emma Wilson", date: "2026-03-19", team: "Mike, Pete", status: "scheduled" },
  { id: "4", title: "Garden Wall", customer: "David Brown", date: "2026-03-20", team: "Tom", status: "scheduled" },
];

export default function SchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mockSchedule.filter(job => job.date === dateStr);
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  return (
    <PermissionGate require="view_schedule">
      <DashboardLayout>
        <SEO title="Schedule - Harding Homes" />
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Work Schedule</h1>
              <p className="text-muted-foreground mt-1">Plan and manage team assignments</p>
            </div>
            <Link href="/jobs/new">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Job
              </Button>
            </Link>
          </div>

          {/* Week Navigator */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={previousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h2 className="text-xl font-bold">
                    {weekDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} - {weekDates[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Week {Math.ceil((weekDates[0].getDate()) / 7)}</p>
                </div>
                <Button variant="outline" size="icon" onClick={nextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const jobs = getJobsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <Card key={index} className={isToday ? "border-2 border-orange-500" : ""}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="text-muted-foreground">{daysOfWeek[index]}</span>
                      <span className={`text-lg font-bold ${isToday ? 'text-orange-500' : ''}`}>
                        {date.getDate()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {jobs.length > 0 ? (
                      jobs.map(job => (
                        <Link key={job.id} href={`/jobs/${job.id}`}>
                          <div className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                            <h4 className="font-semibold text-sm mb-1">{job.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{job.customer}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {job.team}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">No jobs scheduled</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Legend</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-500"></div>
                <span className="text-sm">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>
                <span className="text-sm">Active job</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                <span className="text-sm">Upcoming job</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </PermissionGate>
  );
}