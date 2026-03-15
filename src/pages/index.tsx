import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { UpcomingJobs } from "@/components/dashboard/UpcomingJobs";
import { supabase } from "@/integrations/supabase/client";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Clock, CheckCircle, Users, Package } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    newLeads: 0,
    scheduledThisWeek: 0,
    monthlyRevenue: 0,
    profitMargin: 0,
    avgJobValue: 0,
    monthlyGrowth: 0,
    teamMembers: 0,
    completionRate: 0
  });
  const [jobStatusData, setJobStatusData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [materialsCostData, setMaterialsCostData] = useState<any[]>([]);
  const [weeklyJobsData, setWeeklyJobsData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load all data in parallel
      const [jobsResult, leadsResult, teamResult, inventoryResult] = await Promise.all([
        supabase.from("jobs").select("*").order("created_at", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("team_members").select("*"),
        supabase.from("inventory_items").select("*")
      ]);

      const jobs = (jobsResult.data || []) as any;
      const leads = (leadsResult.data || []) as any;
      const team = (teamResult.data || []) as any;

      calculateStats(jobs, leads, team);
      calculateJobStatusDistribution(jobs);
      calculateMonthlyRevenue(jobs);
      calculateTeamPerformance(jobs, team);
      calculateWeeklyJobs(jobs);
      
    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (jobs: any[], leads: any[], team: any[]) => {
    const now = new Date();
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Active jobs (in-progress)
    const activeJobs = jobs.filter(j => j.status === "in-progress").length;

    // New leads this week
    const newLeads = leads.filter(l => {
      const created = new Date(l.created_at);
      return created >= thisWeekStart;
    }).length;

    // Scheduled this week
    const scheduledThisWeek = jobs.filter(j => {
      if (!j.scheduled_date) return false;
      const scheduled = new Date(j.scheduled_date);
      return scheduled >= thisWeekStart;
    }).length;

    // Monthly revenue and costs
    let monthlyRevenue = 0;
    let monthlyCosts = 0;
    let completedJobs = 0;
    let totalRevenue = 0;

    jobs.forEach((job) => {
      const created = new Date(job.created_at);
      const jobRevenue = job.total_cost || 0;
      const jobCost = job.estimated_cost || 0;

      if (job.status === "completed") {
        totalRevenue += jobRevenue;
        completedJobs++;
      }

      if (created >= thisMonthStart) {
        if (job.status === "completed") {
          monthlyRevenue += jobRevenue;
          monthlyCosts += jobCost;
        }
      }
    });

    // Calculate metrics
    const profitMargin = monthlyRevenue > 0 ? ((monthlyRevenue - monthlyCosts) / monthlyRevenue) * 100 : 0;
    const avgJobValue = completedJobs > 0 ? totalRevenue / completedJobs : 0;

    // Monthly growth
    const thisMonthJobs = jobs.filter(j => {
      const created = new Date(j.created_at);
      return created >= thisMonthStart;
    }).length;

    const lastMonthJobs = jobs.filter(j => {
      const created = new Date(j.created_at);
      return created >= lastMonthStart && created <= lastMonthEnd;
    }).length;

    const monthlyGrowth = lastMonthJobs > 0 ? ((thisMonthJobs - lastMonthJobs) / lastMonthJobs) * 100 : 0;

    // Completion rate
    const totalJobs = jobs.length;
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    setStats({
      activeJobs,
      newLeads,
      scheduledThisWeek,
      monthlyRevenue: Math.round(monthlyRevenue),
      profitMargin: Math.round(profitMargin),
      avgJobValue: Math.round(avgJobValue),
      monthlyGrowth: Math.round(monthlyGrowth),
      teamMembers: team.length,
      completionRate: Math.round(completionRate)
    });
  };

  const calculateJobStatusDistribution = (jobs: any[]) => {
    const statusCounts: { [key: string]: number } = {};
    
    jobs.forEach((job) => {
      const status = job.status || "planning";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const colors: { [key: string]: string } = {
      planning: "#3b82f6",
      "in-progress": "#f59e0b",
      completed: "#10b981",
      cancelled: "#ef4444"
    };

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      value: count,
      color: colors[status] || "#6b7280"
    }));

    setJobStatusData(data);
  };

  const calculateMonthlyRevenue = (jobs: any[]) => {
    const monthlyData: { [key: string]: { revenue: number, costs: number, count: number } } = {};
    
    jobs.forEach((job) => {
      const month = new Date(job.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const revenue = job.status === "completed" ? (job.total_cost || 0) : 0;
      const cost = job.status === "completed" ? (job.estimated_cost || 0) : 0;
      
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, costs: 0, count: 0 };
      }
      monthlyData[month].revenue += revenue;
      monthlyData[month].costs += cost;
      if (job.status === "completed") {
        monthlyData[month].count += 1;
      }
    });

    const data = Object.entries(monthlyData)
      .map(([month, values]) => ({
        month,
        revenue: Math.round(values.revenue),
        costs: Math.round(values.costs),
        profit: Math.round(values.revenue - values.costs),
        jobs: values.count
      }))
      .slice(-6);

    setRevenueData(data);
  };

  const calculateTeamPerformance = (jobs: any[], team: any[]) => {
    const teamData: { [key: string]: { completed: number, active: number } } = {};

    team.forEach(member => {
      teamData[member.name] = { completed: 0, active: 0 };
    });

    jobs.forEach(job => {
      if (job.assigned_to && teamData[job.assigned_to]) {
        if (job.status === "completed") {
          teamData[job.assigned_to].completed += 1;
        } else if (job.status === "in-progress") {
          teamData[job.assigned_to].active += 1;
        }
      }
    });

    const data = Object.entries(teamData).map(([name, stats]) => ({
      name: name.split(" ")[0],
      completed: stats.completed,
      active: stats.active,
      total: stats.completed + stats.active
    })).slice(0, 5);

    setTeamPerformance(data);
  };

  const calculateWeeklyJobs = (jobs: any[]) => {
    const weeklyData: { [key: string]: number } = {
      "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0
    };

    const now = new Date();
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));

    jobs.forEach(job => {
      if (job.scheduled_date) {
        const scheduled = new Date(job.scheduled_date);
        if (scheduled >= thisWeekStart) {
          const dayName = scheduled.toLocaleDateString("en-US", { weekday: "short" });
          if (weeklyData[dayName] !== undefined) {
            weeklyData[dayName] += 1;
          }
        }
      }
    });

    const data = Object.entries(weeklyData).map(([day, count]) => ({
      day,
      jobs: count
    }));

    setWeeklyJobsData(data);
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
          <p className="text-muted-foreground">Overview of your business performance</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduledThisWeek}</div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stats.monthlyGrowth > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">+{stats.monthlyGrowth}% vs last month</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{stats.monthlyGrowth}% vs last month</span>
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profitMargin}%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stats.profitMargin > 20 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Healthy margin</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-amber-500" />
                    <span className="text-amber-500">Below target</span>
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Job Value</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.avgJobValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Per completed job</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Jobs completed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Financial Overview</TabsTrigger>
            <TabsTrigger value="jobs">Job Analytics</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit Trends (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `£${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="costs" 
                      stackId="2"
                      stroke="#ef4444" 
                      fill="#ef4444"
                      fillOpacity={0.6}
                      name="Costs"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Jobs Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="jobs" fill="#3b82f6" name="Jobs Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={jobStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {jobStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>This Week's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyJobsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="jobs" fill="#f59e0b" name="Scheduled Jobs" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobStatusData.map((status) => (
                      <div key={status.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: status.color }}
                          />
                          <span className="font-medium">{status.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${(status.value / jobStatusData.reduce((a, b) => a + b.value, 0)) * 100}%`,
                                backgroundColor: status.color
                              }}
                            />
                          </div>
                          <span className="text-2xl font-bold w-12 text-right">{status.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <RecentJobs />
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={teamPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#10b981" name="Completed Jobs" />
                    <Bar dataKey="active" fill="#f59e0b" name="Active Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.teamMembers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active team members</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Jobs/Member</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.teamMembers > 0 ? Math.round((stats.activeJobs + jobStatusData.reduce((a, b) => a + b.value, 0)) / stats.teamMembers) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total jobs per member</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.teamMembers > 0 ? Math.round((stats.activeJobs / stats.teamMembers) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Active job capacity</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <RecentJobs />
              <UpcomingJobs />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}