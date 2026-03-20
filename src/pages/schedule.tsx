import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Plus, Users, CalendarDays } from "lucide-react";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface ScheduleJob {
  id: string;
  title: string;
  customer_name: string;
  date: string;
  team: string;
  status: string;
}

export default function SchedulePage() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month" | "year">("month");
  const [userRole, setUserRole] = useState<string>("");
  const [scheduleJobs, setScheduleJobs] = useState<ScheduleJob[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
    loadScheduleJobs();
  }, [currentDate, viewMode]);

  async function loadUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
        // Builders see week view by default, managers see month
        if (profile.role === "builder") {
          setViewMode("week");
        } else {
          setViewMode("month");
        }
      }
    } catch (error) {
      console.error("Error loading user role:", error);
    }
  }

  async function loadScheduleJobs() {
    try {
      setLoading(true);
      let startDate: Date;
      let endDate: Date;

      if (viewMode === "week") {
        const weekDates = getWeekDates();
        startDate = weekDates[0];
        endDate = weekDates[6];
      } else if (viewMode === "month") {
        const monthDates = getMonthDates();
        startDate = monthDates[0];
        endDate = monthDates[monthDates.length - 1];
      } else {
        // Year view - load entire year
        const year = currentDate.getFullYear();
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
      }

      const { data: jobsData } = await supabase
        .from("jobs")
        .select(`
          *,
          profiles!jobs_customer_id_fkey(full_name)
        `)
        .gte("start_date", startDate.toISOString().split('T')[0])
        .lte("start_date", endDate.toISOString().split('T')[0])
        .order("start_date", { ascending: true });

      const formattedJobs = (jobsData || []).map((job: any) => ({
        id: job.id,
        title: job.title,
        customer_name: job.profiles?.full_name || 'Unknown Customer',
        date: job.start_date,
        team: Array.isArray(job.assigned_team) ? job.assigned_team.join(", ") : "Unassigned",
        status: job.status
      }));

      setScheduleJobs(formattedJobs);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  }

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getMonthDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    const startPadding = (firstDay.getDay() + 6) % 7;
    
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      dates.push(date);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }
    
    const endPadding = (7 - (dates.length % 7)) % 7;
    for (let i = 1; i <= endPadding; i++) {
      dates.push(new Date(year, month + 1, i));
    }
    
    return dates;
  };

  const getYearMonths = () => {
    const year = currentDate.getFullYear();
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push({
        month: i,
        year: year,
        name: monthNames[i],
        dates: getMonthDatesForMonth(year, i)
      });
    }
    return months;
  };

  const getMonthDatesForMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    const startPadding = (firstDay.getDay() + 6) % 7;
    
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      dates.push(date);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }
    
    const endPadding = (7 - (dates.length % 7)) % 7;
    for (let i = 1; i <= endPadding; i++) {
      dates.push(new Date(year, month + 1, i));
    }
    
    return dates;
  };

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduleJobs.filter(job => job.date === dateStr);
  };

  const previousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleScheduleJob = () => {
    toast({
      title: "Job Scheduled",
      description: "Job has been added to the schedule",
    });
    setDialogOpen(false);
    loadScheduleJobs();
  };

  const getJobStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const weekDates = viewMode === "week" ? getWeekDates() : [];
  const monthDates = viewMode === "month" ? getMonthDates() : [];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
            <div className="flex gap-2">
              {/* View Mode Toggle (Only for managers/office) */}
              {userRole !== "builder" && (
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === "week" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                    className={viewMode === "week" ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    <CalendarDays className="h-4 w-4 mr-1" />
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "month" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                    className={viewMode === "month" ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Month
                  </Button>
                  <Button
                    variant={viewMode === "year" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("year")}
                    className={viewMode === "year" ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Year
                  </Button>
                </div>
              )}
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Job
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Quick Schedule Job</DialogTitle>
                    <DialogDescription>
                      Assign a job to team members for a specific date
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="job">Select Job</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a job" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Kitchen Extension - Sarah Mitchell</SelectItem>
                          <SelectItem value="2">Bathroom Refit - John Davis</SelectItem>
                          <SelectItem value="3">Loft Conversion - Emma Wilson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Schedule Date</Label>
                      <Input type="date" id="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team">Assign Team Members</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team members" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mike">Mike (Builder)</SelectItem>
                          <SelectItem value="tom">Tom (Builder)</SelectItem>
                          <SelectItem value="steve">Steve (Site Manager)</SelectItem>
                          <SelectItem value="pete">Pete (Builder)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleScheduleJob} className="bg-orange-500 hover:bg-orange-600 text-white">
                        Schedule
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Period Navigator */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={previousPeriod}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  {viewMode === "week" ? (
                    <>
                      <h2 className="text-xl font-bold">
                        {weekDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} - {weekDates[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">Week View</p>
                    </>
                  ) : viewMode === "month" ? (
                    <>
                      <h2 className="text-xl font-bold">
                        {currentMonth} {currentYear}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">Month View</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold">
                        {currentYear}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">Year View</p>
                    </>
                  )}
                </div>
                <Button variant="outline" size="icon" onClick={nextPeriod}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading schedule...</p>
            </div>
          ) : (
            <>
              {/* Week View */}
              {viewMode === "week" && (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weekDates.map((date, index) => {
                    const jobs = getJobsForDate(date);
                    const today = isToday(date);
                    
                    return (
                      <Card key={index} className={today ? "border-2 border-orange-500" : ""}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <span className="text-muted-foreground">{daysOfWeek[index]}</span>
                            <span className={`text-lg font-bold ${today ? 'text-orange-500' : ''}`}>
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
                                  <p className="text-xs text-muted-foreground mb-2">{job.customer_name}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={getJobStatusColor(job.status)}>
                                      {job.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  {job.team && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      <Users className="h-3 w-3 inline mr-1" />
                                      {job.team}
                                    </p>
                                  )}
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
              )}

              {/* Month View */}
              {viewMode === "month" && (
                <Card>
                  <CardContent className="p-6">
                    {/* Month Header */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Month Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {monthDates.map((date, index) => {
                        const jobs = getJobsForDate(date);
                        const today = isToday(date);
                        const currentMonthDate = isCurrentMonth(date);
                        
                        return (
                          <div
                            key={index}
                            className={`
                              min-h-[120px] p-2 border rounded-lg
                              ${today ? 'border-2 border-orange-500 bg-orange-50' : 'border-border'}
                              ${!currentMonthDate ? 'bg-muted/50 text-muted-foreground' : 'bg-background'}
                              hover:bg-accent transition-colors
                            `}
                          >
                            <div className={`text-sm font-semibold mb-2 ${today ? 'text-orange-600' : ''}`}>
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {jobs.slice(0, 3).map(job => (
                                <Link key={job.id} href={`/jobs/${job.id}`}>
                                  <div className="text-xs p-1.5 bg-blue-100 hover:bg-blue-200 rounded cursor-pointer truncate">
                                    <div className="font-medium truncate">{job.title}</div>
                                    <div className="text-muted-foreground truncate">{job.customer_name}</div>
                                  </div>
                                </Link>
                              ))}
                              {jobs.length > 3 && (
                                <div className="text-xs text-muted-foreground text-center py-1">
                                  +{jobs.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Year View */}
              {viewMode === "year" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {getYearMonths().map((monthData, monthIndex) => {
                    const monthJobs = scheduleJobs.filter(job => {
                      const jobDate = new Date(job.date);
                      return jobDate.getMonth() === monthData.month && jobDate.getFullYear() === monthData.year;
                    });
                    
                    return (
                      <Card key={monthIndex} className="overflow-hidden">
                        <CardHeader className="pb-3 bg-muted/50">
                          <CardTitle className="text-base font-semibold flex items-center justify-between">
                            <span>{monthData.name}</span>
                            {monthJobs.length > 0 && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                {monthJobs.length} {monthJobs.length === 1 ? 'job' : 'jobs'}
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          {/* Mini calendar header */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                              <div key={i} className="text-center text-xs font-medium text-muted-foreground">
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Mini calendar grid */}
                          <div className="grid grid-cols-7 gap-1">
                            {monthData.dates.map((date, dateIndex) => {
                              const dateJobs = getJobsForDate(date);
                              const isCurrentMonthDate = date.getMonth() === monthData.month;
                              const today = isToday(date);
                              
                              return (
                                <div
                                  key={dateIndex}
                                  className={`
                                    aspect-square flex items-center justify-center text-xs rounded
                                    ${today ? 'bg-orange-500 text-white font-bold' : ''}
                                    ${!today && dateJobs.length > 0 ? 'bg-blue-500 text-white font-semibold' : ''}
                                    ${!today && dateJobs.length === 0 && isCurrentMonthDate ? 'hover:bg-muted' : ''}
                                    ${!isCurrentMonthDate ? 'text-muted-foreground/40' : ''}
                                    cursor-pointer transition-colors
                                  `}
                                  title={dateJobs.length > 0 ? `${dateJobs.length} job(s) on ${date.toLocaleDateString()}` : ''}
                                >
                                  {date.getDate()}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Month summary */}
                          {monthJobs.length > 0 && (
                            <div className="mt-3 pt-3 border-t space-y-1">
                              {monthJobs.slice(0, 2).map(job => (
                                <Link key={job.id} href={`/jobs/${job.id}`}>
                                  <div className="text-xs p-1.5 bg-muted hover:bg-muted/80 rounded cursor-pointer truncate">
                                    <div className="font-medium truncate">{job.title}</div>
                                  </div>
                                </Link>
                              ))}
                              {monthJobs.length > 2 && (
                                <div className="text-xs text-muted-foreground text-center">
                                  +{monthJobs.length - 2} more jobs
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Legend</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500"></div>
                <span className="text-sm">Today</span>
              </div>
              {viewMode === "year" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="text-sm">Has scheduled jobs</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>
                <span className="text-sm">Active job</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                <span className="text-sm">Upcoming job</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
                <span className="text-sm">Finished job</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </PermissionGate>
  );
}