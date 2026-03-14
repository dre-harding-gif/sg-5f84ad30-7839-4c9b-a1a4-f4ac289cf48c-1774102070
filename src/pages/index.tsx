import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/Dashboard/StatCard";
import { RecentJobs } from "@/components/Dashboard/RecentJobs";
import { Briefcase, Users, Clock, DollarSign } from "lucide-react";
import type { Job } from "@/types";

const mockJobs: Job[] = [
  {
    id: "1",
    jobNumber: "JOB-2024-001",
    customerId: "1",
    title: "Kitchen Extension",
    description: "Full kitchen extension with new flooring",
    address: "123 High Street, London",
    postcode: "SW1A 1AA",
    status: "in-progress",
    priority: "high",
    estimatedHours: 120,
    actualHours: 45,
    assignedTeam: ["1", "2"],
    materials: [],
    purchaseOrders: [],
    documents: [],
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    jobNumber: "JOB-2024-002",
    customerId: "2",
    title: "Bathroom Renovation",
    description: "Complete bathroom refit",
    address: "456 Park Avenue, Manchester",
    postcode: "M1 1AA",
    status: "scheduled",
    priority: "medium",
    estimatedHours: 80,
    actualHours: 0,
    assignedTeam: ["3"],
    materials: [],
    purchaseOrders: [],
    documents: [],
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function HomePage() {
  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to BuildPro</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Jobs"
            value={12}
            icon={<Briefcase className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
            color="blue"
          />
          <StatCard
            title="Total Customers"
            value={45}
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
            color="orange"
          />
          <StatCard
            title="Hours This Month"
            value={324}
            icon={<Clock className="h-6 w-6" />}
            trend={{ value: 5, isPositive: false }}
            color="green"
          />
          <StatCard
            title="Revenue (MTD)"
            value="£24,500"
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 15, isPositive: true }}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentJobs jobs={mockJobs} />
          
          <div className="space-y-6">
            {/* Placeholder for additional dashboard widgets */}
          </div>
        </div>
      </div>
    </Layout>
  );
}