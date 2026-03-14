import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, Download, Calendar, Clock, DollarSign, 
  Users, BarChart3, PieChart, FileText 
} from "lucide-react";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Track performance and generate monthly recaps</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="march-2026">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="march-2026">March 2026</SelectItem>
                <SelectItem value="february-2026">February 2026</SelectItem>
                <SelectItem value="january-2026">January 2026</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Revenue", value: "£45,280", change: "+12.5%", icon: DollarSign, trend: "up" },
            { label: "Jobs Completed", value: "18", change: "+3 from last month", icon: FileText, trend: "up" },
            { label: "Hours Worked", value: "1,247", change: "852 billable", icon: Clock, trend: "neutral" },
            { label: "Active Team", value: "12", change: "All available", icon: Users, trend: "neutral" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Job Analysis</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Job Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Chart visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <PieChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Chart visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { job: "Kitchen Extension - Mitchell", profit: "£8,500", margin: "28%", hours: "120/120" },
                    { job: "Bathroom Renovation - Davis", profit: "£4,200", margin: "25%", hours: "80/80" },
                    { job: "Loft Conversion - Thompson", profit: "£12,800", margin: "32%", hours: "195/200" },
                  ].map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{job.job}</p>
                        <p className="text-sm text-muted-foreground">Hours: {job.hours}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{job.profit}</p>
                        <p className="text-sm text-muted-foreground">{job.margin} margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Job Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Average Job Duration by Type</h3>
                    <div className="space-y-3">
                      {[
                        { type: "Kitchen Extensions", avgDays: "15 days", count: "5 jobs" },
                        { type: "Bathroom Renovations", avgDays: "8 days", count: "7 jobs" },
                        { type: "Loft Conversions", avgDays: "22 days", count: "3 jobs" },
                        { type: "General Repairs", avgDays: "3 days", count: "12 jobs" },
                      ].map((type, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{type.type}</p>
                            <p className="text-sm text-muted-foreground">{type.count}</p>
                          </div>
                          <span className="font-semibold">{type.avgDays}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "John Smith", role: "Lead Builder", hours: "168", jobs: "5", rating: "4.9" },
                    { name: "Mike Johnson", role: "Electrician", hours: "152", jobs: "8", rating: "4.8" },
                    { name: "Sarah Williams", role: "Plumber", hours: "144", jobs: "6", rating: "5.0" },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{member.hours} hours • {member.jobs} jobs</p>
                        <p className="text-sm text-muted-foreground">Rating: {member.rating}/5.0</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Revenue Breakdown</h3>
                    <div className="space-y-3">
                      {[
                        { category: "Labour", amount: "£28,400", percent: "63%" },
                        { category: "Materials", amount: "£12,200", percent: "27%" },
                        { category: "Equipment", amount: "£4,680", percent: "10%" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{item.category}</span>
                          <div className="text-right">
                            <p className="font-semibold">{item.amount}</p>
                            <p className="text-xs text-muted-foreground">{item.percent}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Outstanding Payments</h3>
                    <div className="space-y-3">
                      {[
                        { customer: "Sarah Mitchell", amount: "£2,500", due: "Due in 5 days" },
                        { customer: "John Davis", amount: "£4,800", due: "Due in 12 days" },
                      ].map((item, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{item.customer}</p>
                            <p className="font-bold text-orange-600">{item.amount}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.due}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}