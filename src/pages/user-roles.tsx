import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PermissionGate } from "@/components/PermissionGate";
import { 
  getAllUsers, 
  updateUserRole, 
  getRoleDisplayName, 
  getRoleBadgeColor,
  type UserRole 
} from "@/services/roleService";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Mail, Calendar } from "lucide-react";

const roles: UserRole[] = ["owner", "office_manager", "site_manager", "builder", "customer"];

export default function UserRolesPage() {
  const [users, setUsers] = useState<Tables<"profiles">[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setUpdating(userId);
    const result = await updateUserRole(userId, newRole);
    
    if (result.success) {
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
      await loadUsers();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update user role.",
        variant: "destructive",
      });
    }
    setUpdating(null);
  }

  return (
    <DashboardLayout>
      <PermissionGate require="manage_team">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">User Roles & Permissions</h1>
            <p className="text-muted-foreground mt-2">
              Manage team member roles and access levels
            </p>
          </div>

          {/* Role Permissions Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Permissions Guide
              </CardTitle>
              <CardDescription>
                Understanding access levels for each role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <Badge className="bg-purple-100 text-purple-800 mb-2">Owner</Badge>
                  <p className="text-sm text-muted-foreground">
                    Full system access - manage everything including company settings, team, finances, and all operations
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Badge className="bg-blue-100 text-blue-800 mb-2">Office Manager</Badge>
                  <p className="text-sm text-muted-foreground">
                    Manage leads, customers, scheduling, quotes, and invoices. Cannot change company settings or manage team
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Badge className="bg-green-100 text-green-800 mb-2">Site Manager</Badge>
                  <p className="text-sm text-muted-foreground">
                    Manage jobs, assign work, track inventory, and coordinate team schedules
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Badge className="bg-orange-100 text-orange-800 mb-2">Builder</Badge>
                  <p className="text-sm text-muted-foreground">
                    View assigned jobs, track time, check out tools and materials, view schedule
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Badge className="bg-gray-100 text-gray-800 mb-2">Customer</Badge>
                  <p className="text-sm text-muted-foreground">
                    Portal access only - view their own jobs, track progress, and communicate with team
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({users.length})
              </CardTitle>
              <CardDescription>
                Assign and manage user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No users found</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{user.full_name || "Unnamed User"}</h3>
                          <Badge className={getRoleBadgeColor(user.role as UserRole)}>
                            {getRoleDisplayName(user.role as UserRole)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {user.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(user.created_at || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={user.role || "builder"}
                          onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                          disabled={updating === user.id}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {getRoleDisplayName(role)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PermissionGate>
    </DashboardLayout>
  );
}