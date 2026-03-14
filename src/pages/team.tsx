import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Users, Phone, Mail, MapPin } from "lucide-react";
import type { TeamMember } from "@/types";

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Smith",
    role: "Lead Builder",
    email: "john.smith@hardinghomes.com",
    phone: "07123 456789",
    skills: ["Carpentry", "Project Management", "Masonry"],
    availability: "on-job",
  },
  {
    id: "2",
    name: "Mike Johnson",
    role: "Electrician",
    email: "mike.j@hardinghomes.com",
    phone: "07987 654321",
    skills: ["Electrical", "Testing", "Certification"],
    availability: "available",
  },
  {
    id: "3",
    name: "Sarah Williams",
    role: "Plumber",
    email: "sarah.w@hardinghomes.com",
    phone: "07456 789123",
    skills: ["Plumbing", "Heating", "Gas Safe"],
    availability: "on-job",
  },
  {
    id: "4",
    name: "David Brown",
    role: "General Builder",
    email: "david.b@hardinghomes.com",
    phone: "07789 123456",
    skills: ["Bricklaying", "Plastering", "Tiling"],
    availability: "available",
  },
];

const availabilityColors = {
  available: "bg-green-100 text-green-800",
  "on-job": "bg-orange-100 text-orange-800",
  off: "bg-gray-100 text-gray-800",
};

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Team</h1>
            <p className="text-muted-foreground mt-1">Manage your workforce and assignments</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
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
          {mockTeamMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <Badge className={availabilityColors[member.availability]}>
                    {member.availability.replace("-", " ")}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}