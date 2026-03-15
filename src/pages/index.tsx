import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Wrench,
  ArrowRight,
  Briefcase,
  FileText
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PermissionGate } from "@/components/PermissionGate";

const revenueData = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 38000 },
  { name: 'Apr', value: 65000 },
  { name: 'May', value: 48000 },
  { name: 'Jun', value: 71000 },
];

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <DashboardLayout>
      <SEO title="Dashboard - Harding Homes" />
      
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Command Center</h1>
            <p className="text-muted-foreground mt-1">Welcome back. Here is what's happening today.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/jobs/new">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Briefcase className="w-4 h-4 mr-2" />
                New Job
              </Button>
            </Link>
            <Link href="/leads">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Leads
              </Button>
            </Link>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Jobs</p>
                  <h3 className="text-3xl font-bold text-foreground">12</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">New Leads</p>
                  <h3 className="text-3xl font-bold text-foreground">8</h3>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Completed (MTD)</p>
                  <h3 className="text-3xl font-bold text-foreground">5</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <PermissionGate require="view_company">
            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Revenue</p>
                    <h3 className="text-3xl font-bold text-foreground">£71k</h3>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </PermissionGate>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Charts & Activity (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-8">
            <PermissionGate require="view_company">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Revenue Pipeline</CardTitle>
                  <CardDescription>6-month revenue trend for completed projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `£${value/1000}k`} />
                        <Tooltip formatter={(value) => `£${value.toLocaleString()}`} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </PermissionGate>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Jobs Overview</CardTitle>
                  <CardDescription>Latest active and scheduled projects</CardDescription>
                </div>
                <Link href="/jobs">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 1, title: "Kitchen Extension", customer: "Sarah Mitchell", status: "In Progress", progress: 65, color: "bg-orange-100 text-orange-800" },
                    { id: 2, title: "Loft Conversion", customer: "James Miller", status: "Scheduled", progress: 0, color: "bg-blue-100 text-blue-800" },
                    { id: 3, title: "Bathroom Refit", customer: "David Wilson", status: "Nearing Completion", progress: 90, color: "bg-green-100 text-green-800" }
                  ].map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Wrench className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.customer}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <Badge className={job.color} variant="outline">{job.status}</Badge>
                        <span className="text-xs font-medium text-muted-foreground">{job.progress}% Complete</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Urgent Tasks & Alerts */}
          <div className="space-y-8">
            <Card className="border-t-4 border-t-red-500 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Action Required
                </CardTitle>
                <CardDescription>Items needing immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900">Van MOT Expiring</h4>
                      <p className="text-xs text-red-700 mt-1">HN19 XYZ MOT expires in 4 days. Please book.</p>
                      <Link href="/company"><Button variant="link" className="text-red-700 h-auto p-0 mt-1 text-xs">Manage Fleet →</Button></Link>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-orange-900">3 Uncontacted Leads</h4>
                      <p className="text-xs text-orange-700 mt-1">New Checkatrade leads waiting for response over 24h.</p>
                      <Link href="/leads"><Button variant="link" className="text-orange-700 h-auto p-0 mt-1 text-xs">View Leads →</Button></Link>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-900">Low Stock Alert</h4>
                      <p className="text-xs text-yellow-700 mt-1">Plasterboard (12.5mm) is below minimum reorder level.</p>
                      <Link href="/inventory"><Button variant="link" className="text-yellow-700 h-auto p-0 mt-1 text-xs">Check Inventory →</Button></Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Link href="/schedule">
                  <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    Schedule
                  </Button>
                </Link>
                <Link href="/team">
                  <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    Team
                  </Button>
                </Link>
                <Link href="/inventory">
                  <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                    <Wrench className="w-4 h-4 mr-2 text-primary" />
                    Stock
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full justify-start h-auto py-3 px-4">
                    <FileText className="w-4 h-4 mr-2 text-primary" />
                    Pricing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}