import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, Clock, CheckCircle, MapPin, Plus, Trash2,
  Briefcase, Users, TrendingUp, DollarSign, AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface TodayJob {
  id: string;
  title: string;
  customer_name: string;
  address: string;
  status: string;
  assigned_team?: string[];
  start_time?: string;
}

interface DailyTask {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assigned_to?: string;
  due_date: string;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'job' | 'lead';
  address: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [todayJobs, setTodayJobs] = useState<TodayJob[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    newLeads: 0,
    todayJobs: 0,
    monthlyRevenue: 0
  });

  // Task dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "high" | "medium" | "low",
    due_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Load today's jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select(`
          *,
          profiles!jobs_customer_id_fkey(full_name)
        `)
        .gte("start_date", today)
        .lte("start_date", today + "T23:59:59")
        .order("start_date", { ascending: true });

      // Load daily tasks
      const { data: tasksData } = await supabase
        .from("daily_tasks")
        .select("*")
        .eq("due_date", today)
        .order("priority", { ascending: false });

      // Load all jobs and leads for map
      const { data: allJobs } = await supabase
        .from("jobs")
        .select("id, title, address, latitude, longitude, status")
        .neq("status", "completed")
        .neq("status", "cancelled");

      const { data: allLeads } = await supabase
        .from("leads")
        .select("id, customer_name, address, latitude, longitude")
        .eq("status", "new");

      // Calculate stats
      const { data: activeJobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "in_progress");

      const { data: newLeadsData } = await supabase
        .from("leads")
        .select("*")
        .eq("status", "new");

      const { data: completedJobsData } = await supabase
        .from("jobs")
        .select("final_price, quoted_price")
        .eq("status", "completed")
        .gte("completed_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      let monthlyRevenue = 0;
      if (completedJobsData) {
        completedJobsData.forEach(job => {
          monthlyRevenue += parseFloat(job.final_price?.toString() || job.quoted_price?.toString() || "0");
        });
      }

      const formattedTodayJobs = (jobsData || []).map((job: any) => ({
        id: job.id,
        title: job.title,
        customer_name: job.profiles?.full_name || 'Unknown Customer',
        address: job.address,
        status: job.status,
        assigned_team: job.assigned_team,
        start_time: job.start_date
      }));

      setTodayJobs(formattedTodayJobs);
      setDailyTasks(Array.isArray(tasksData) ? tasksData : []);
      
      // Prepare map markers
      const markers: MapMarker[] = [];
      
      if (allJobs) {
        allJobs.forEach(job => {
          if (job.latitude !== null && job.longitude !== null) {
            markers.push({
              id: job.id,
              lat: Number(job.latitude),
              lng: Number(job.longitude),
              title: job.title,
              type: 'job',
              address: job.address || ''
            });
          }
        });
      }

      if (allLeads) {
        allLeads.forEach(lead => {
          if (lead.latitude !== null && lead.longitude !== null) {
            markers.push({
              id: lead.id,
              lat: Number(lead.latitude),
              lng: Number(lead.longitude),
              title: lead.customer_name || 'New Enquiry',
              type: 'lead',
              address: lead.address || ''
            });
          }
        });
      }

      setMapMarkers(markers);

      setStats({
        activeJobs: activeJobsData?.length || 0,
        newLeads: newLeadsData?.length || 0,
        todayJobs: jobsData?.length || 0,
        monthlyRevenue: Math.round(monthlyRevenue)
      });

    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask() {
    if (!newTask.title) {
      toast({
        title: "Missing Information",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("Creating task:", newTask);
      
      const { data, error } = await supabase
        .from("daily_tasks")
        .insert([{
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: "pending",
          due_date: newTask.due_date
        }])
        .select();

      console.log("Task creation result:", { data, error });

      if (error) {
        console.error("Task creation error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create task",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Task Created",
        description: "Daily task has been added"
      });

      setTaskDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        due_date: new Date().toISOString().split('T')[0]
      });
      loadDashboardData();
    } catch (error) {
      console.error("Unexpected error creating task:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }

  async function toggleTaskComplete(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    
    const { error } = await supabase
      .from("daily_tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (!error) {
      setDailyTasks(tasks => 
        tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );
    }
  }

  async function deleteTask(taskId: string) {
    const { error } = await supabase
      .from("daily_tasks")
      .delete()
      .eq("id", taskId);

    if (!error) {
      setDailyTasks(tasks => tasks.filter(t => t.id !== taskId));
      toast({
        title: "Task Deleted",
        description: "Task has been removed"
      });
    }
  }

  const getJobStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-orange-100 text-orange-800 border-orange-200",
      low: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <SEO title="Dashboard - Harding Homes" />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEO title="Dashboard - Harding Homes" />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Today's overview and activities</p>
        </div>

        {/* Top Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Jobs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayJobs}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
              <p className="text-xs text-muted-foreground">Awaiting contact</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Logs & Tasks Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Today's Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Today's Jobs
                </CardTitle>
                <Button size="sm" onClick={() => router.push("/schedule")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No jobs scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.customer_name}</p>
                        </div>
                        <Badge variant="outline" className={getJobStatusColor(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{job.address}</span>
                      </div>
                      {job.start_time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{job.start_time}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Tasks Pin Board */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                  Daily Tasks
                </CardTitle>
                <Button size="sm" onClick={() => setTaskDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dailyTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks for today</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setTaskDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create First Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {dailyTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={task.status === "completed"}
                          onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </h4>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interactive Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Jobs & Enquiries Map
            </CardTitle>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-muted-foreground">Active Jobs ({mapMarkers.filter(m => m.type === 'job').length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">New Enquiries ({mapMarkers.filter(m => m.type === 'lead').length})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {mapMarkers.length === 0 ? (
              <div className="space-y-4">
                {/* Always show live map of Berkshire */}
                <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden border-2 border-border">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=51.4543,-0.9781&zoom=10"
                  ></iframe>
                  <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
                    <h4 className="font-semibold text-sm mb-2">📍 Berkshire Area</h4>
                    <p className="text-xs text-muted-foreground">Jobs and enquiries with addresses will appear as pins on this map</p>
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 How to add locations to the map:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside text-left max-w-md mx-auto">
                    <li>Go to Jobs or Leads page</li>
                    <li>When adding an address, the system will auto-detect coordinates</li>
                    <li>Locations will appear as pins on this map automatically</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Map Visualization - Simple Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  {/* Active Jobs Column */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Active Jobs ({mapMarkers.filter(m => m.type === 'job').length})
                    </h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {mapMarkers.filter(m => m.type === 'job').map((marker) => (
                        <div 
                          key={marker.id} 
                          className="p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/jobs/${marker.id}`)}
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{marker.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{marker.address}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {mapMarkers.filter(m => m.type === 'job').length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">No active jobs with locations</p>
                      )}
                    </div>
                  </div>

                  {/* New Enquiries Column */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      New Enquiries ({mapMarkers.filter(m => m.type === 'lead').length})
                    </h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {mapMarkers.filter(m => m.type === 'lead').map((marker) => (
                        <div 
                          key={marker.id} 
                          className="p-2 bg-white rounded border border-green-200 hover:bg-green-50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/leads`)}
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{marker.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{marker.address}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {mapMarkers.filter(m => m.type === 'lead').length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">No new enquiries with locations</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Google Maps */}
                <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden border-2 border-border">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${mapMarkers[0]?.lat || 51.4543},${mapMarkers[0]?.lng || -0.9781}&zoom=11`}
                  ></iframe>
                </div>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/jobs")}>
                View All Jobs
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/leads")}>
                View All Leads
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push("/jobs")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Jobs</h3>
                  <p className="text-sm text-muted-foreground">View and edit all jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push("/leads")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">New Leads</h3>
                  <p className="text-sm text-muted-foreground">Convert enquiries to jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push("/team")}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Team</h3>
                  <p className="text-sm text-muted-foreground">Manage team members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Daily Task</DialogTitle>
            <DialogDescription>
              Create a task for today's to-do list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Call supplier about materials"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional details..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="w-full p-2 border rounded-md"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setTaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTask}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}