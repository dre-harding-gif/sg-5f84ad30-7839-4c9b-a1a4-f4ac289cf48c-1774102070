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
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Clock, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [jobStatusData, setJobStatusData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [profitMargin, setProfitMargin] = useState(0);
  const [avgJobValue, setAvgJobValue] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0);

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/portal/login");
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load jobs for analytics
      const { data: jobs } = await supabase
        .from("jobs")
        .select("*, quotes(total), invoices(amount_paid)")
        .order("created_at", { ascending: false });

      if (jobs) {
        calculateFinancialMetrics(jobs);
        calculateJobStatusDistribution(jobs);
        calculateMonthlyRevenue(jobs);
      }
    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialMetrics = (jobs: any[]) => {
    let totalRevenue = 0;
    let totalCosts = 0;
    let completedJobs = 0;

    jobs.forEach((job) => {
      const jobRevenue = job.quotes?.[0]?.total || 0;
      const jobCost = job.estimated_cost || 0;
      
      if (job.status === "completed") {
        totalRevenue += jobRevenue;
        totalCosts += jobCost;
        completedJobs++;
      }
    });

    const margin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
    const avgValue = completedJobs > 0 ? totalRevenue / completedJobs : 0;

    setProfitMargin(Math.round(margin));
    setAvgJobValue(Math.round(avgValue));

    // Calculate monthly growth (simplified)
    const thisMonth = jobs.filter(j => {
      const created = new Date(j.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    });
    const lastMonth = jobs.filter(j => {
      const created = new Date(j.created_at);
      const now = new Date();
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return created.getMonth() === lastMonthDate.getMonth() && created.getFullYear() === lastMonthDate.getFullYear();
    });

    const growth = lastMonth.length > 0 ? ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100 : 0;
    setMonthlyGrowth(Math.round(growth));
  };

  const calculateJobStatusDistribution = (jobs: any[]) => {
    const statusCounts: { [key: string]: number } = {};
    
    jobs.forEach((job) => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    });

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: getStatusColor(status)
    }));

    setJobStatusData(data);
  };

  const calculateMonthlyRevenue = (jobs: any[]) => {
    const monthlyData: { [key: string]: { revenue: number, costs: number } } = {};
    
    jobs.forEach((job) => {
      if (job.status === "completed") {
        const month = new Date(job.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        const revenue = job.quotes?.[0]?.total || 0;
        const cost = job.estimated_cost || 0;
        
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, costs: 0 };
        }
        monthlyData[month].revenue += revenue;
        monthlyData[month].costs += cost;
      }
    });

    const data = Object.entries(monthlyData)
      .map(([month, values]) => ({
        month,
        revenue: Math.round(values.revenue),
        costs: Math.round(values.costs),
        profit: Math.round(values.revenue - values.costs)
      }))
      .slice(-6); // Last 6 months

    setRevenueData(data);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      planning: "#3b82f6",
      "in progress": "#f59e0b",
      completed: "#10b981",
      cancelled: "#ef4444"
    };
    return colors[status] || "#6b7280";
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

        <StatsCards />

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profitMargin}%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {profitMargin > 20 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Healthy margin</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-amber-500" />
                    <span className="text-amber-500">Needs improvement</span>
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
              <div className="text-2xl font-bold">£{avgJobValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Per completed job</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyGrowth > 0 ? "+" : ""}{monthlyGrowth}%</div>
              <p className="text-xs text-muted-foreground mt-1">vs last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue & Costs</TabsTrigger>
            <TabsTrigger value="jobs">Job Status</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `£${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="costs" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Costs"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                      <Bar dataKey="costs" fill="#ef4444" name="Costs" />
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
                        <span className="text-2xl font-bold">{status.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <UpcomingJobs />
            </div>

            <RecentJobs />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <RecentJobs />
            <UpcomingJobs />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}