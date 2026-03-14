import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Customer } from "@/types";

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@email.com",
    phone: "07123 456789",
    address: "45 Oak Avenue, Manchester",
    postcode: "M20 2RQ",
    source: "checkatrade",
    createdAt: new Date("2026-02-15"),
    portalAccess: {
      username: "sarah.mitchell",
      lastLogin: new Date("2026-03-13"),
    },
  },
  {
    id: "2",
    name: "John Davis",
    email: "john.davis@email.com",
    phone: "07987 654321",
    address: "12 High Street, Liverpool",
    postcode: "L1 1AA",
    source: "referral",
    createdAt: new Date("2026-03-05"),
    portalAccess: {
      username: "john.davis",
    },
  },
  {
    id: "3",
    name: "Emma Thompson",
    email: "emma.t@email.com",
    phone: "07456 789123",
    address: "88 Park Lane, Leeds",
    postcode: "LS2 8JT",
    source: "direct",
    createdAt: new Date("2026-03-10"),
  },
];

const sourceColors = {
  checkatrade: "bg-orange-100 text-orange-800",
  direct: "bg-blue-100 text-blue-800",
  referral: "bg-green-100 text-green-800",
  other: "bg-gray-100 text-gray-800",
};

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-1">Manage your customer database</p>
          </div>
          <Link href="/customers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, email, or address..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{customer.name}</h3>
                    <Badge variant="outline" className={sourceColors[customer.source]}>
                      {customer.source}
                    </Badge>
                  </div>
                  {customer.portalAccess && (
                    <Badge variant="secondary">Portal Access</Badge>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{customer.address}</span>
                  </div>
                </div>

                {customer.portalAccess?.lastLogin && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Last portal login: {new Date(customer.portalAccess.lastLogin).toLocaleDateString("en-GB")}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link href={`/customers/${customer.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                  </Link>
                  {customer.portalAccess && (
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}