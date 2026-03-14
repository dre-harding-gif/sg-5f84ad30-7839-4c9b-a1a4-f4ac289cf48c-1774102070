import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, MapPin, Calendar, Users } from "lucide-react";
import Link from "next/link";
import type { Job } from "@/types";

const mockJobs: Job[] = [
  {
    id: "1",
    jobNumber: "JOB-2024-001",
    customerId: "1",
    title: "Kitchen Extension - Mitchell Residence",
    description: "Complete kitchen extension with bi-fold doors",
    address: "45 Oak Avenue, Manchester",
    postcode: "M20 2RQ",
    status: "in-progress",
    priority: "high",
    startDate: new Date("2026-03-01"),
    estimatedHours: 120,
    actualHours: 65,
    assignedTeam: ["John Smith", "Mike Johnson"],
    materials: [],
    purchaseOrders: [],
    documents: [],
    photos: [],
    createdAt: new Date("2026-02-15"),
    updatedAt: new Date(),
  },
  {
    id: "2",
    jobNumber: "JOB-2024-002",
    customerId: "2",
    title: "Bathroom Renovation - Davis Property",
    description: "Full bathroom refit with wet room installation",
    address: "12 High Street, Liverpool",
    postcode: "L1 1AA",
    status: "scheduled",
    priority: "medium",
    startDate: new Date("2026-03-18"),
    estimatedHours: 80,
    actualHours: 0,
    assignedTeam: ["Sarah Williams"],
    materials: [],
    purchaseOrders: [],
    documents: [],
    photos: [],
    createdAt: new Date("2026-03-05"),
    updatedAt: new Date(),
  },
  {
    id: "3",
    jobNumber: "JOB-2024-003",
    customerId: "3",
    title: "Loft Conversion - Thompson Home",
    description: "Two bedroom loft conversion with dormer windows",
    address: "88 Park Lane, Leeds",
    postcode: "LS2 8JT",
    status: "quoted",
    priority: "medium",
    estimatedHours: 200,
    actualHours: 0,
    assignedTeam: [],
    materials: [],
    purchaseOrders: [],
    documents: [],
    photos: [],
    createdAt: new Date("2026-03-10"),
    updatedAt: new Date(),
  },
];

const statusColors = {
  lead: "bg-yellow-100 text-yellow-800",
  quoted: "bg-blue-100 text-blue-800",
  scheduled: "bg-purple-100 text-purple-800",
  "in-progress": "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  "on-hold": "bg-gray-100 text-gray-800",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filterJobsByStatus = (jobs: Job[], status: string) => {
    if (status === "all") return jobs;
    return jobs.filter(job => job.status === status);
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Jobs</h1>
            <p className="text-muted-foreground mt-1">Manage all your construction projects</p>
          </div>
          <Link href="/jobs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by number, customer, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filterJobsByStatus(mockJobs, activeTab).map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge className={statusColors[job.status]}>
                          {job.status.replace("-", " ")}
                        </Badge>
                        <Badge variant="outline" className={priorityColors[job.priority]}>
                          {job.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">#{job.jobNumber}</p>
                    </div>
                  </div>

                  <p className="text-sm mb-4">{job.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-medium text-sm">{job.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Start Date</p>
                        <p className="font-medium text-sm">
                          {job.startDate ? new Date(job.startDate).toLocaleDateString("en-GB") : "Not scheduled"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Team</p>
                        <p className="font-medium text-sm">
                          {job.assignedTeam.length > 0 ? `${job.assignedTeam.length} members` : "Unassigned"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {job.status === "in-progress" && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {job.actualHours} / {job.estimatedHours} hours
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${(job.actualHours / job.estimatedHours) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/jobs/${job.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">View Job</Button>
                    </Link>
                    <Link href={`/jobs/${job.id}/sheet`} className="flex-1">
                      <Button variant="outline" className="w-full">Job Sheet</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}