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
import { authService } from "@/services/authService";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Mail, Calendar, Filter, Search, X, UserPlus, Copy, Eye, EyeOff } from "lucide-react";

const roles: UserRole[] = ["owner", "office_manager", "site_manager", "builder", "customer"];

export default function UserRolesPage() {
  const [users, setUsers] = useState<Tables<"profiles">[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Tables<"profiles">[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    role: "builder" as UserRole,
  });
  const [invitationResult, setInvitationResult] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, selectedRole, searchQuery]);

  async function loadUsers() {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  }

  function filterUsers() {
    let filtered = users;

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search query (name or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => {
        const name = (user.full_name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        return name.includes(query) || email.includes(query);
      });
    }

    setFilteredUsers(filtered);
  }

  function getRoleCount(role: UserRole | "all"): number {
    if (role === "all") return users.length;
    return users.filter(user => user.role === role).length;
  }

  function clearSearch() {
    setSearchQuery("");
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

  async function handleInviteUser() {
    if (!inviteForm.fullName || !inviteForm.email) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and email address.",
        variant: "destructive",
      });
      return;
    }

    setInviting(true);
    const result = await authService.inviteUser(
      inviteForm.email,
      inviteForm.fullName,
      inviteForm.role
    );

    if (result.success) {
      setInvitationResult({
        email: result.email!,
        tempPassword: result.tempPassword!,
      });
      
      toast({
        title: "User Invited!",
        description: `Invitation sent to ${inviteForm.email}`,
      });
      
      await loadUsers();
      
      // Reset form
      setInviteForm({
        fullName: "",
        email: "",
        role: "builder",
      });
    } else {
      toast({
        title: "Invitation Failed",
        description: result.error || "Failed to invite user.",
        variant: "destructive",
      });
    }
    setInviting(false);
  }

  function copyCredentials() {
    if (!invitationResult) return;
    
    const credentials = `Login Credentials for ${invitationResult.email}

Email: ${invitationResult.email}
Temporary Password: ${invitationResult.tempPassword}

Please change your password after first login.
Login at: ${window.location.origin}`;

    navigator.clipboard.writeText(credentials);
    toast({
      title: "Copied!",
      description: "Login credentials copied to clipboard",
    });
  }

  function closeInviteDialog() {
    setInviteDialogOpen(false);
    setInvitationResult(null);
    setShowPassword(false);
  }

  return (
    <DashboardLayout>
      <PermissionGate require="manage_team">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Roles & Permissions</h1>
              <p className="text-muted-foreground mt-2">
                Manage team member roles and access levels
              </p>
            </div>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                {!invitationResult ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Invite New Team Member</DialogTitle>
                      <DialogDescription>
                        Create a new user account and assign their role. They'll receive login credentials to get started.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="John Smith"
                          value={inviteForm.fullName}
                          onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select
                          value={inviteForm.role}
                          onValueChange={(value) => setInviteForm({ ...inviteForm, role: value as UserRole })}
                        >
                          <SelectTrigger>
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
                        <p className="text-xs text-muted-foreground">
                          {inviteForm.role === "owner" && "Full system access - manage everything"}
                          {inviteForm.role === "office_manager" && "Manage leads, customers, quotes, and schedules"}
                          {inviteForm.role === "site_manager" && "Manage jobs, assign work, track inventory"}
                          {inviteForm.role === "builder" && "View assigned jobs, track time, check out materials"}
                          {inviteForm.role === "customer" && "Portal access only - view their jobs"}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={closeInviteDialog}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteUser} disabled={inviting}>
                        {inviting ? "Sending Invitation..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle>User Invited Successfully! 🎉</DialogTitle>
                      <DialogDescription>
                        Share these login credentials with the new team member
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Email Address</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={invitationResult.email}
                              readOnly
                              className="bg-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={invitationResult.tempPassword}
                              readOnly
                              className="bg-white font-mono"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-900">
                          <strong>⚠️ Important:</strong> The user must change this temporary password on their first login.
                        </p>
                      </div>
                      <Button onClick={copyCredentials} className="w-full" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Credentials to Clipboard
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button onClick={closeInviteDialog}>
                        Done
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
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

          {/* Search Bar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Users
              </CardTitle>
              <CardDescription>
                Find team members by name or email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  Found {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} matching "{searchQuery}"
                </p>
              )}
            </CardContent>
          </Card>

          {/* Role Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter by Role
              </CardTitle>
              <CardDescription>
                Click a role to filter the user list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedRole === "all" ? "default" : "outline"}
                  onClick={() => setSelectedRole("all")}
                  className="gap-2"
                >
                  All Users
                  <Badge variant="secondary" className="ml-1">
                    {getRoleCount("all")}
                  </Badge>
                </Button>
                {roles.map((role) => (
                  <Button
                    key={role}
                    variant={selectedRole === role ? "default" : "outline"}
                    onClick={() => setSelectedRole(role)}
                    className="gap-2"
                  >
                    {getRoleDisplayName(role)}
                    <Badge variant="secondary" className="ml-1">
                      {getRoleCount(role)}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedRole === "all" 
                  ? `All Team Members (${filteredUsers.length})`
                  : `${getRoleDisplayName(selectedRole as UserRole)} (${filteredUsers.length})`
                }
              </CardTitle>
              <CardDescription>
                {searchQuery ? (
                  `Showing ${filteredUsers.length} user${filteredUsers.length !== 1 ? "s" : ""} matching your search${selectedRole !== "all" ? ` with role: ${getRoleDisplayName(selectedRole as UserRole)}` : ""}`
                ) : selectedRole === "all" ? (
                  "Showing all users - filter by role or search above"
                ) : (
                  `Showing users with role: ${getRoleDisplayName(selectedRole as UserRole)}`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery ? (
                      <>No users found matching "{searchQuery}"</>
                    ) : selectedRole === "all" ? (
                      "No users found"
                    ) : (
                      `No users with role: ${getRoleDisplayName(selectedRole as UserRole)}`
                    )}
                  </p>
                  {(searchQuery || selectedRole !== "all") && (
                    <div className="flex gap-2 justify-center mt-4">
                      {searchQuery && (
                        <Button
                          variant="link"
                          onClick={clearSearch}
                        >
                          Clear search
                        </Button>
                      )}
                      {selectedRole !== "all" && (
                        <Button
                          variant="link"
                          onClick={() => setSelectedRole("all")}
                        >
                          View all users
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
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