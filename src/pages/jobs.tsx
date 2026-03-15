import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock, 
  MoreVertical,
  Wrench,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { PermissionGate } from "@/components/PermissionGate";

interface Job {
  id: string;
  job_number: string;
  title: string;
  status: string;
  priority: string;
  address: string;
  start_date: string;
  end_date: string;
  customer_name?: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      // Mock data for immediate clear preview while DB hooks up completely
      const mockJobs: Job[] = [
        {
          id: "1",
          job_number: "JOB-2024-001",
          title: "Kitchen Extension",
          status: "in_progress",
          priority: "high",
          address: "45 Oak Avenue, Manchester",
          start_date: "2026-03-01",
          end_date: "2026-04-15",
          customer_name: "Sarah Mitchell"
        },
        {
          id: "2",
          job_number: "JOB-2024-002",
          title: "Loft Conversion",
          status: "scheduled",
          priority: "normal",
          address: "12 High Street, Liverpool",
          start_date: "2026-04-20",
          end_date: "2026-06-10",
          customer_name: "John Davis"
        },
        {
          id: "3",
          job_number: "JOB-2024-003",
          title: "Bathroom Refit",
          status: "completed",
          priority: "normal",
          address: "88 Park Lane, Leeds",
          start_date: "2026-02-10",
          end_date: "2026-02-28",
          customer_name: "Emma Thompson"
        }
      ];
      setJobs(mockJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.job_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.customer_name && job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PermissionGate require="view_jobs">
      <DashboardLayout>
        <SEO title="Jobs Pipeline - Harding Homes" />
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Jobs Pipeline</h1>
              <p className="text-muted-foreground mt-1">Manage all active, scheduled, and completed projects.</p>
            </div>
            <Link href="/jobs/new">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Job
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search jobs by ID, customer, or title..." 
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Jobs List (Clean Card Layout) */}
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                    {/* Status Icon */}
                    <div className="hidden md:flex h-12 w-12 rounded-full bg-slate-50 items-center justify-center shrink-0 border">
                      {job.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Wrench className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    
                    {/* Main Info */}
                    <div className="flex-1 space-y-1 w-full">
                      <div className="flex items-center justify-between md:justify-start gap-3">
                        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {job.job_number}
                        </span>
                        <Badge variant="outline" className={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 hover:text-primary">
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      {job.customer_name && (
                        <p className="text-sm text-slate-600 font-medium">Customer: {job.customer_name}</p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                        <span>{job.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>
                          {new Date(job.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} 
                          {' - '} 
                          {new Date(job.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0">
                      <Link href={`/jobs/${job.id}`} className="w-full md:w-auto">
                        <Button className="w-full md:w-auto">Manage Job</Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="shrink-0 text-slate-400">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredJobs.length === 0 && (
              <div className="text-center p-12 bg-white rounded-lg border border-dashed">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
                <p className="text-slate-500">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </PermissionGate>
  );
}