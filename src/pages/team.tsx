import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Mail, Phone, CheckCircle2, Clock, Eye, EyeOff, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getUserPermissions, updateUserRole } from "@/services/roleService";
import type { UserRole } from "@/services/roleService";
import { PermissionGate } from "@/components/PermissionGate";
import { inviteUser } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: string;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>("builder");
  const { toast } = useToast();
  
  // Invitation dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    fullName: "",
    role: "builder" as UserRole
  });
  
  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [invitedCredentials, setInvitedCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
    fetchUserRole();
  }, []);

  async function fetchUserRole() {
    const permissions = await getUserPermissions();
    setUserRole(permissions.role);
  }

  async function fetchTeamMembers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) {
      setTeamMembers(data.map(member => ({
        ...member,
        status: "active" // Default mock status for all members since we don't have it in profiles yet
      })) as TeamMember[]);
    }
    setLoading(false);
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      setTeamMembers(teamMembers.map(member => 
        member.id === userId ? { ...member, role: newRole } : member
      ));
    }
  }

  async function handleInviteUser() {
    if (!inviteForm.email || !inviteForm.fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setInviting(true);
    const result = await inviteUser(inviteForm.email, inviteForm.fullName, inviteForm.role);
    setInviting(false);

    if (result.success && result.password) {
      // Show success dialog with credentials
      setInvitedCredentials({
        email: inviteForm.email,
        password: result.password
      });
      setSuccessDialogOpen(true);
      setInviteDialogOpen(false);
      
      // Reset form
      setInviteForm({
        email: "",
        fullName: "",
        role: "builder"
      });
      
      // Refresh team list
      fetchTeamMembers();
      
      toast({
        title: "User Invited Successfully",
        description: "Share the credentials with the new team member"
      });
    } else {
      toast({
        title: "Invitation Failed",
        description: result.error || "Failed to create user account",
        variant: "destructive"
      });
    }
  }

  function copyCredentialsToClipboard() {
    const credentials = `Harding Homes Login Credentials

Email: ${invitedCredentials.email}
Temporary Password: ${invitedCredentials.password}

Login at: ${window.location.origin}

⚠️ IMPORTANT: Change your password after first login (Settings → Security)`;

    navigator.clipboard.writeText(credentials);
    toast({
      title: "Copied to Clipboard",
      description: "Credentials copied! Share via WhatsApp, Email, or SMS"
    });
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "owner": return "bg-purple-100 text-purple-800 border-purple-200";
      case "office_manager": return "bg-blue-100 text-blue-800 border-blue-200";
      case "site_manager": return "bg-green-100 text-green-800 border-green-200";
      case "builder": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <PermissionGate require="view_team">
      <DashboardLayout>
        <SEO title="Team Management - Harding Homes" />
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Team Management</h1>
              <p className="text-muted-foreground mt-1">Manage staff, roles, and permissions</p>
            </div>
            <PermissionGate require="manage_team">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setInviteDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </PermissionGate>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Team</p>
                    <h3 className="text-2xl font-bold">{teamMembers.length}</h3>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <h3 className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</h3>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">On Jobs</p>
                    <h3 className="text-2xl font-bold">4</h3>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Builders</p>
                    <h3 className="text-2xl font-bold">{teamMembers.filter(m => m.role === 'builder').length}</h3>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage roles and access permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.full_name || 'User'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <PermissionGate require="manage_team" fallback={
                          <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                            {getRoleDisplayName(member.role)}
                          </Badge>
                        }>
                          <Select 
                            value={member.role} 
                            onValueChange={(value) => handleRoleChange(member.id, value as UserRole)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="office_manager">Office Manager</SelectItem>
                              <SelectItem value="site_manager">Site Manager</SelectItem>
                              <SelectItem value="builder">Builder</SelectItem>
                            </SelectContent>
                          </Select>
                        </PermissionGate>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Role Permissions Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>What each role can access and manage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <Badge className="bg-purple-100 text-purple-800 mb-3">Owner</Badge>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Full system access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Manage team roles
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Company finances
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      All reports
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <Badge className="bg-blue-100 text-blue-800 mb-3">Office Manager</Badge>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Jobs & customers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Pricing guide
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Inventory
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Reports
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <Badge className="bg-green-100 text-green-800 mb-3">Site Manager</Badge>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Jobs & schedule
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Team management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Inventory
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <Badge className="bg-orange-100 text-orange-800 mb-3">Builder</Badge>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      My Week view
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Inventory lookup
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Job sheets
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite User Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Add a new team member and assign their role
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
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="office_manager">Office Manager</SelectItem>
                    <SelectItem value="site_manager">Site Manager</SelectItem>
                    <SelectItem value="builder">Builder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                  disabled={inviting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteUser}
                  disabled={inviting}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {inviting ? "Inviting..." : "Send Invitation"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Dialog with Credentials */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                User Invited Successfully!
              </DialogTitle>
              <DialogDescription>
                Share these credentials with the new team member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{invitedCredentials.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-medium">
                      {showPassword ? invitedCredentials.password : "••••••••••••••••"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <p className="text-sm text-orange-800">
                  ⚠️ <strong>Important:</strong> Ask the user to change their password after first login
                </p>
              </div>

              <Button
                onClick={copyCredentialsToClipboard}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Credentials to Clipboard
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Share via WhatsApp, Email, SMS, or in person
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </PermissionGate>
  );
}