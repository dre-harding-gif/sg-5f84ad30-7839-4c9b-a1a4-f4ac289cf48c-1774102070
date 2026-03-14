import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, UserPlus } from "lucide-react";
import Link from "next/link";

const mockLeads = [
  {
    id: "1",
    name: "James Patterson",
    email: "james.p@email.com",
    phone: "07123 456789",
    source: "checkatrade",
    address: "15 Victoria Road, Birmingham",
    postcode: "B15 3QN",
    jobType: "Kitchen Extension",
    estimatedValue: "£25,000",
    status: "new",
    createdAt: "2026-03-10",
  },
  {
    id: "2",
    name: "Sophie Williams",
    email: "sophie.w@email.com",
    phone: "07987 654321",
    source: "referral",
    address: "42 Church Lane, Leeds",
    postcode: "LS1 4BR",
    jobType: "Bathroom Renovation",
    estimatedValue: "£12,000",
    status: "contacted",
    createdAt: "2026-03-12",
  },
  {
    id: "3",
    name: "Robert Taylor",
    email: "rob.taylor@email.com",
    phone: "07456 123789",
    source: "direct",
    address: "88 Oak Avenue, Manchester",
    postcode: "M1 1AE",
    jobType: "Loft Conversion",
    estimatedValue: "£35,000",
    status: "quoted",
    createdAt: "2026-03-08",
  },
];

const sourceColors = {
  checkatrade: "bg-orange-100 text-orange-800",
  direct: "bg-blue-100 text-blue-800",
  referral: "bg-green-100 text-green-800",
  other: "bg-gray-100 text-gray-800",
};

const statusColors = {
  new: "bg-yellow-100 text-yellow-800",
  contacted: "bg-blue-100 text-blue-800",
  quoted: "bg-purple-100 text-purple-800",
  converted: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground mt-1">Manage and convert your leads into jobs</p>
          </div>
          <Link href="/leads/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads by name, email, or address..."
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

        <div className="grid gap-4">
          {mockLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{lead.name}</h3>
                      <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                        {lead.status}
                      </Badge>
                      <Badge variant="outline" className={sourceColors[lead.source as keyof typeof sourceColors]}>
                        {lead.source}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{lead.email} • {lead.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Est. Value</p>
                    <p className="text-xl font-bold text-primary">{lead.estimatedValue}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Job Type</p>
                    <p className="font-medium">{lead.jobType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Address</p>
                    <p className="font-medium">{lead.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Received</p>
                    <p className="font-medium">{new Date(lead.createdAt).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/leads/${lead.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
                  <Button className="flex-1">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Convert to Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}