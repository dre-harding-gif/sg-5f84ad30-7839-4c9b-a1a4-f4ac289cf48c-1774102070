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
  AreaChart, Area, ComposedChart
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Clock, CheckCircle, Users, Package, AlertCircle } from "lucide-react";

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
    completionRate: 0,
    pendingPOs: 0,
    lowStockItems: 0
  });
  const [jobStatusData, setJobStatusData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [leadConversionData, setLeadConversionData] = useState<any[]>([]);
  const [weeklyJobsData, setWeeklyJobsData] = useState<any[]>([]);
  const [inventoryCostData, setInventoryCostData] = useState<any[]>([]);
  const [timeTrackingData, setTimeTrackingData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load all data in parallel from Supabase
      const [
        jobsResult, 
        leadsResult, 
        teamResult, 
        inventoryResult,
        purchaseOrdersResult,
        timeLogsResult,
        quotesResult
      ] = await Promise.all([
        supabase.from("jobs").select("*").order("created_at", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").neq("role", "customer"),
        supabase.from("inventory_items").select("*"),
        supabase.from("purchase_orders").select("*"),
        supabase.from("time_logs").select("*, jobs(title), profiles(full_name)"),
        supabase.from("quotes").select("*")
      ]);

      const jobs = Array.isArray(jobsResult.data) ? jobsResult.data : [];
      const leads = Array.isArray(leadsResult.data) ? leadsResult.data : [];
      const team = Array.isArray(teamResult.data) ? teamResult.data : [];
      const inventory = Array.isArray(inventoryResult.data) ? inventoryResult.data : [];
      const purchaseOrders = Array.isArray(purchaseOrdersResult.data) ? purchaseOrdersResult.data : [];
      const timeLogs = Array.isArray(timeLogsResult.data) ? timeLogsResult.data : [];
      const quotes = Array.isArray(quotesResult.data) ? quotesResult.data : [];

      calculateStats(jobs, leads, team, purchaseOrders, inventory);
      calculateJobStatusDistribution(jobs);
      calculateMonthlyRevenue(jobs, purchaseOrders);
      calculateTeamPerformance(jobs, team);
      calculateLeadConversion(leads);
      calculateWeeklyJobs(jobs);
      calculateInventoryCosts(inventory, purchaseOrders);
      calculateTimeTracking(timeLogs);
      
    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (jobs: any[], leads: any[], team: any[], purchaseOrders: any[], inventory: any[]) => {
    const now = new Date();
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Active jobs (in-progress)
    const activeJobs = jobs.filter(j => j.status === "in_progress").length;

    // New leads this week
    const newLeads = leads.filter(l => {
      const created = new Date(l.created_at);
      return created >= thisWeekStart;
    }).length;

    // Scheduled this week
    const scheduledThisWeek = jobs.filter(j => {
      if (!j.start_date) return false;
      const scheduled = new Date(j.start_date);
      return scheduled >= thisWeekStart;
    }).length;

    // Monthly revenue and costs
    let monthlyRevenue = 0;
    let monthlyCosts = 0;
    let completedJobs = 0;
    let totalRevenue = 0;

    jobs.forEach((job) => {
      const created = new Date(job.created_at);
      const jobRevenue = parseFloat(job.final_price || job.quoted_price || "0");
      const jobCost = parseFloat(job.quoted_price || "0") * 0.6; // Estimated cost

      if (job.status === "completed") {
        totalRevenue += jobRevenue;
        completedJobs++;
      }

      if (created >= thisMonthStart && job.status === "completed") {
        monthlyRevenue += jobRevenue;
        monthlyCosts += jobCost;
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

    // Purchase orders pending
    const pendingPOs = purchaseOrders.filter(po => po.status === "pending" || po.status === "ordered").length;

    // Low stock items
    const lowStockItems = inventory.filter(item => 
      item.current_quantity <= item.reorder_level
    ).length;

    setStats({
      activeJobs,
      newLeads,
      scheduledThisWeek,
      monthlyRevenue: Math.round(monthlyRevenue),
      profitMargin: Math.round(profitMargin),
      avgJobValue: Math.round(avgJobValue),
      monthlyGrowth: Math.round(monthlyGrowth),
      teamMembers: team.length,
      completionRate: Math.round(completionRate),
      pendingPOs,
      lowStockItems
    });
  };

  const calculateJobStatusDistribution = (jobs: any[]) => {
    const statusCounts: { [key: string]: number } = {};
    
    jobs.forEach((job) => {
      const status = job.status || "pending";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const colors: { [key: string]: string } = {
      pending: "#6b7280",
      scheduled: "#3b82f6",
      in_progress: "#f59e0b",
      completed: "#10b981",
      on_hold: "#8b5cf6",
      cancelled: "#ef4444"
    };

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      value: count,
      color: colors[status] || "#6b7280"
    }));

    setJobStatusData(data);
  };

  const calculateMonthlyRevenue = (jobs: any[], purchaseOrders: any[]) => {
    const monthlyData: { [key: string]: { revenue: number, costs: number, count: number } } = {};
    
    // Calculate revenue from completed jobs
    jobs.forEach((job) => {
      const month = new Date(job.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const revenue = job.status === "completed" ? parseFloat(job.final_price || job.quoted_price || "0") : 0;
      
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, costs: 0, count: 0 };
      }
      monthlyData[month].revenue += revenue;
      if (job.status === "completed") {
        monthlyData[month].count += 1;
      }
    });

    // Calculate costs from purchase orders
    purchaseOrders.forEach((po) => {
      const month = new Date(po.order_date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const cost = parseFloat(po.total_amount || "0");
      
      if (monthlyData[month]) {
        monthlyData[month].costs += cost;
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
    const teamData: { [key: string]: { name: string, completed: number, active: number, hours: number } } = {};

    team.forEach(member => {
      teamData[member.id] = { 
        name: member.full_name || member.email || "Unknown",
        completed: 0, 
        active: 0,
        hours: 0
      };
    });

    jobs.forEach(job => {
      if (job.assigned_team && Array.isArray(job.assigned_team)) {
        job.assigned_team.forEach((memberId: string) => {
          if (teamData[memberId]) {
            if (job.status === "completed") {
              teamData[memberId].completed += 1;
            } else if (job.status === "in_progress") {
              teamData[memberId].active += 1;
            }
            teamData[memberId].hours += parseFloat(job.actual_hours || "0");
          }
        });
      }
    });

    const data = Object.values(teamData)
      .map((stats: any) => ({
        name: stats.name.split(" ")[0],
        completed: stats.completed,
        active: stats.active,
        hours: Math.round(stats.hours),
        total: stats.completed + stats.active
      }))
      .filter(d => d.total > 0)
      .slice(0, 5);

    setTeamPerformance(data);
  };

  const calculateLeadConversion = (leads: any[]) => {
    const monthlyData: { [key: string]: { total: number, converted: number } } = {};

    leads.forEach(lead => {
      const month = new Date(lead.created_at).toLocaleDateString("en-US", { month: "short" });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, converted: 0 };
      }
      
      monthlyData[month].total += 1;
      if (lead.status === "won") {
        monthlyData[month].converted += 1;
      }
    });

    const data = Object.entries(monthlyData)
      .map(([month, values]) => ({
        month,
        leads: values.total,
        converted: values.converted,
        rate: values.total > 0 ? Math.round((values.converted / values.total) * 100) : 0
      }))
      .slice(-6);

    setLeadConversionData(data);
  };

  const calculateWeeklyJobs = (jobs: any[]) => {
    const weeklyData: { [key: string]: number } = {
      "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0
    };

    const now = new Date();
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));

    jobs.forEach(job => {
      if (job.start_date) {
        const scheduled = new Date(job.start_date);
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

  const calculateInventoryCosts = (inventory: any[], purchaseOrders: any[]) => {
    const categories: { [key: string]: number } = {};

    inventory.forEach(item => {
      const category = item.category || "Other";
      const value = (item.current_quantity || 0) * parseFloat(item.unit_cost || "0");
      categories[category] = (categories[category] || 0) + value;
    });

    const data = Object.entries(categories)
      .map(([category, value]) => ({
        category,
        value: Math.round(value)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    setInventoryCostData(data);
  };

  const calculateTimeTracking = (timeLogs: any[]) => {
    const weeklyData: { [key: string]: number } = {};

    timeLogs.forEach(log => {
      const week = new Date(log.log_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      weeklyData[week] = (weeklyData[week] || 0) + parseFloat(log.hours_worked || "0");
    });

    const data = Object.entries(weeklyData)
      .map(([date, hours]) => ({
        date,
        hours: Math.round(hours * 10) / 10
      }))
      .slice(-7);

    setTimeTrackingData(data);
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
                ) : stats.monthlyGrowth < 0 ? (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{stats.monthlyGrowth}% vs last month</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">No change vs last month</span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPOs}</div>
              <p className="text-xs text-muted-foreground mt-1">Purchase orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground mt-1">Need reordering</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Financial</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit Trends (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={revenueData}>
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
                      fill="#10b981"
                      fillOpacity={0.3}
                      stroke="#10b981"
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="costs" 
                      fill="#ef4444"
                      fillOpacity={0.3}
                      stroke="#ef4444"
                      name="Costs"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Profit"
                    />
                  </ComposedChart>
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
                  <CardTitle>Inventory Value by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={inventoryCostData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={80} />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Bar dataKey="value" fill="#8b5cf6" name="Value" />
                    </BarChart>
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
                  <CardTitle>Job Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={jobStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
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

            <RecentJobs />
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#10b981" name="Completed" />
                      <Bar dataKey="active" fill="#f59e0b" name="Active" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hours Logged (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeTrackingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#3b82f6" 
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="Hours"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

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
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completionRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Jobs completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Hours/Job</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {teamPerformance.length > 0 ? 
                      Math.round(teamPerformance.reduce((acc, t) => acc + t.hours, 0) / teamPerformance.reduce((acc, t) => acc + t.total, 0)) 
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per completed job</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Rate (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={leadConversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="leads" fill="#6b7280" name="Total Leads" />
                    <Bar yAxisId="left" dataKey="converted" fill="#10b981" name="Converted" />
                    <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} name="Conversion Rate %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leadConversionData.reduce((acc, d) => acc + d.leads, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Converted</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leadConversionData.reduce((acc, d) => acc + d.converted, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Won leads</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leadConversionData.length > 0 ? 
                      Math.round(leadConversionData.reduce((acc, d) => acc + d.rate, 0) / leadConversionData.length)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Value by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={inventoryCostData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={(entry: any) => `${entry.category}: £${entry.value.toLocaleString()}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {inventoryCostData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stock Value by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={inventoryCostData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Bar dataKey="value" fill="#8b5cf6" name="Value (£)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £{inventoryCostData.reduce((acc, d) => acc + d.value, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Current inventory</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                  <p className="text-xs text-muted-foreground mt-1">Need reordering</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingPOs}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting delivery</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}