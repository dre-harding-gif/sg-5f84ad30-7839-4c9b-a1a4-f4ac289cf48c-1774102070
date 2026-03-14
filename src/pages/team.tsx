import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Calendar, Wrench, Crown, Briefcase, HardHat, User } from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentUserRole, updateUserRole, UserRole } from "@/services/roleService";

export default function TeamPage() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [teamMembers, setTeamMembers] = useState([
    {
      id: "1",
      name: "John Smith",
      role: "site_manager" as UserRole,
      email: "john.smith@hardinghomes.com",
      phone: "07700 900123",
      specialization: "Extensions & Conversions",
      status: "active",
      currentJobs: 3,
      joinDate: "2019-03-15",
      address: "Reading, Berkshire"
    },
    {
      id: "2",
      name: "Mike Johnson",
      role: "builder" as UserRole,
      email: "mike.j@hardinghomes.com",
      phone: "07700 900456",
      specialization: "Bricklaying",
      status: "active",
      currentJobs: 2,
      joinDate: "2020-06-01",
      address: "Henley-on-Thames"
    },
    {
      id: "3",
      name: "Sarah Williams",
      role: "office_manager" as UserRole,
      email: "sarah.w@hardinghomes.com",
      phone: "07700 900789",
      specialization: "Project Coordination",
      status: "active",
      currentJobs: 12,
      joinDate: "2018-09-10",
      address: "Reading, Berkshire"
    },
    {
      id: "4",
      name: "Tom Davies",
      role: "builder" as UserRole,
      email: "tom.d@hardinghomes.com",
      phone: "07700 900321",
      specialization: "Carpentry & Joinery",
      status: "active",
      currentJobs: 1,
      joinDate: "2021-01-20",
      address: "Caversham"
    }
  ]);

  useEffect(() => {
    async function fetchUserRole() {
      const role = await getCurrentUserRole();
      setCurrentUserRole(role);
    }
    fetchUserRole();
  }, []);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "owner": return <Crown className="h-4 w-4" />;
      case "office_manager": return <Briefcase className="h-4 w-4" />;
      case "site_manager": return <HardHat className="h-4 w-4" />;
      case "builder": return <Wrench className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "owner": return "bg-purple-100 text-purple-800";
      case "office_manager": return "bg-blue-100 text-blue-800";
      case "site_manager": return "bg-green-100 text-green-800";
      case "builder": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    const success = await updateUserRole(memberId, newRole);
    if (success) {
      setTeamMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    }
  };

  const canEditRoles = currentUserRole === "owner";

  return (
    <DashboardLayout>
      <SEO title="Team Management" description="Manage your team members and their roles" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-600 mt-2">Manage team members and their access levels</p>
          </div>
          <Button>Add Team Member</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <span className="capitalize">{member.role.replace("_", " ")}</span>
                    </CardDescription>
                  </div>
                  <Badge className={getRoleBadgeColor(member.role)}>
                    {member.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {member.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {member.address}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Wrench className="h-4 w-4" />
                    {member.specialization}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(member.joinDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Jobs:</span>
                    <Badge variant="outline">{member.currentJobs}</Badge>
                  </div>

                  {canEditRoles && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Access Level:</label>
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleRoleChange(member.id, value as UserRole)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner (Full Access)</SelectItem>
                          <SelectItem value="office_manager">Office Manager</SelectItem>
                          <SelectItem value="site_manager">Site Manager</SelectItem>
                          <SelectItem value="builder">Builder/Tradesperson</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {member.role === "owner" && "Full system access including settings and billing"}
                        {member.role === "office_manager" && "Can manage jobs, schedule, customers, and view reports"}
                        {member.role === "site_manager" && "Can manage jobs, schedule, team, and inventory"}
                        {member.role === "builder" && "Can view assigned jobs and check inventory"}
                      </p>
                    </div>
                  )}

                  {!canEditRoles && (
                    <p className="text-xs text-gray-500 italic">
                      Only owners can modify team member roles
                    </p>
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