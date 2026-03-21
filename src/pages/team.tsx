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
import { Users, Plus, Mail, Phone, CheckCircle2, Clock, Eye, EyeOff, Copy, RefreshCw, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getUserPermissions, updateUserRole } from "@/services/roleService";
import type { UserRole } from "@/services/roleService";
import { PermissionGate } from "@/components/PermissionGate";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: string;
}

interface SubContractor {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [subContractors, setSubContractors] = useState<SubContractor[]>([]);
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
  const [invitedCredentials, setInvitedCredentials] = useState({ 
    email: "", 
    password: "",
    emailSent: false 
  });
  const [showPassword, setShowPassword] = useState(false);

  // Resend state
  const [resending, setResending] = useState<string | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
    fetchUserRole();
    fetchSubContractors();
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
        status: "active"
      })) as TeamMember[]);
    }
    setLoading(false);
  }

  async function fetchSubContractors() {
    const { data, error } = await supabase
      .from("sub_contractors")
      .select("*")
      .order("name", { ascending: true });

    if (data) {
      setSubContractors(data);
    }
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
    
    try {
      console.log("Invoking invite-user function with:", {
        email: inviteForm.email,
        full_name: inviteForm.fullName,
        role: inviteForm.role
      });

      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: inviteForm.email,
          full_name: inviteForm.fullName,
          role: inviteForm.role
        }
      });

      console.log("Edge Function response:", { data, error });

      if (error) {
        console.error("Edge Function error details:", {
          message: error.message,
          status: error.status,
          context: error.context
        });
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to send invitation");
      }

      // Show success based on whether it's a new user
      if (data.isNewUser) {
        setInvitedCredentials({
          email: inviteForm.email,
          password: data.temporaryPassword || "",
          emailSent: data.emailSent || false
        });
        setSuccessDialogOpen(true);
      } else {
        // Existing user - password reset sent
        toast({
          title: data.emailSent ? "✅ Password Reset Sent!" : "✅ User Updated",
          description: data.message
        });
      }

      setInviteDialogOpen(false);
      setInviteForm({
        email: "",
        fullName: "",
        role: "builder"
      });
      
      fetchTeamMembers();

    } catch (error: any) {
      console.error("Full invitation error:", error);
      toast({
        title: "Invitation Failed",
        description: error.message || "Failed to send invitation. Check browser console for details.",
        variant: "destructive"
      });
    } finally {
      setInviting(false);
    }
  }

  const handleResendInvite = async (member: TeamMember) => {
    try {
      setResending(member.id);
      
      console.log("Resending invite for:", member.email);

      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: member.email,
          full_name: member.full_name,
          role: member.role
        }
      });

      console.log("Resend response:", { data, error });

      if (error) {
        console.error('Edge Function error:', error);
        toast({
          title: "Error",
          description: `Failed to resend invitation: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (!data?.success) {
        toast({
          title: "Error",
          description: data?.error || "Failed to resend invitation",
          variant: "destructive",
        });
        return;
      }

      // Show success message based on response
      if (data.emailSent) {
        toast({
          title: "✅ Password Reset Sent!",
          description: `Email sent to ${member.email}`,
        });
      } else if (data.temporaryPassword) {
        // Show temporary password if email wasn't sent
        toast({
          title: "⚠️ SMTP Not Configured",
          description: (
            <div className="space-y-2">
              <p>Share these credentials manually:</p>
              <p className="font-mono text-xs bg-black/10 p-2 rounded">
                Email: {member.email}<br/>
                Password: {data.temporaryPassword}
              </p>
            </div>
          ),
          duration: 10000,
        });
      } else {
        toast({
          title: "✅ Invitation Ready",
          description: data.message,
        });
      }

      await fetchTeamMembers();
    } catch (err: any) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: `Unexpected error: ${err.message || 'Please check console for details'}`,
        variant: "destructive",
      });
    } finally {
      setResending(null);
    }
  };

  async function handleDeleteMember() {
    if (!memberToDelete) return;

    setDeleting(true);
    try {
      // Delete from profiles table - the ON DELETE CASCADE foreign key will handle auth.users
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", memberToDelete.id);
      
      if (error) {
        throw error;
      }

      toast({
        title: "✅ Team Member Deleted",
        description: `${memberToDelete.full_name} has been removed from the team`
      });

      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      await fetchTeamMembers();

    } catch (error: any) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete team member",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
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

  // Sub-contractor management
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [newSubRow, setNewSubRow] = useState(false);
  const [subFormData, setSubFormData] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    notes: ""
  });

  function handleAddSubRow() {
    setNewSubRow(true);
    setSubFormData({ name: "", role: "", phone: "", email: "", notes: "" });
  }

  async function handleSaveNewSub() {
    if (!subFormData.name || !subFormData.role) {
      toast({
        title: "Missing Information",
        description: "Name and Role are required",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from("sub_contractors")
      .insert([subFormData])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add sub-contractor",
        variant: "destructive"
      });
      return;
    }

    setSubContractors([...subContractors, data]);
    setNewSubRow(false);
    setSubFormData({ name: "", role: "", phone: "", email: "", notes: "" });
    toast({
      title: "✅ Sub-Contractor Added",
      description: `${data.name} has been added to your list`
    });
  }

  function handleCancelNewSub() {
    setNewSubRow(false);
    setSubFormData({ name: "", role: "", phone: "", email: "", notes: "" });
  }

  function handleEditSub(sub: SubContractor) {
    setEditingSubId(sub.id);
    setSubFormData({
      name: sub.name,
      role: sub.role,
      phone: sub.phone || "",
      email: sub.email || "",
      notes: sub.notes || ""
    });
  }

  async function handleUpdateSub(subId: string) {
    if (!subFormData.name || !subFormData.role) {
      toast({
        title: "Missing Information",
        description: "Name and Role are required",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from("sub_contractors")
      .update(subFormData)
      .eq("id", subId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update sub-contractor",
        variant: "destructive"
      });
      return;
    }

    setSubContractors(subContractors.map(sub => 
      sub.id === subId ? { ...sub, ...subFormData } : sub
    ));
    setEditingSubId(null);
    toast({
      title: "✅ Updated",
      description: "Sub-contractor details updated"
    });
  }

  function handleCancelEdit() {
    setEditingSubId(null);
    setSubFormData({ name: "", role: "", phone: "", email: "", notes: "" });
  }

  async function handleDeleteSub(subId: string) {
    const { error } = await supabase
      .from("sub_contractors")
      .delete()
      .eq("id", subId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete sub-contractor",
        variant: "destructive"
      });
      return;
    }

    setSubContractors(subContractors.filter(sub => sub.id !== subId));
    toast({
      title: "✅ Deleted",
      description: "Sub-contractor removed"
    });
  }

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
                        <div className="flex gap-2">
                          <PermissionGate require="manage_team">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResendInvite(member)}
                              disabled={resending === member.id}
                              className="text-blue-600 border-blue-500 hover:bg-blue-50"
                            >
                              {resending === member.id ? (
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4 mr-1" />
                              )}
                              Resend Invite
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setMemberToDelete(member);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 border-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </PermissionGate>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Sub-Contractors Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sub-Contractors</CardTitle>
                  <CardDescription>Manage external contractors and specialists</CardDescription>
                </div>
                <Button
                  onClick={handleAddSubRow}
                  disabled={newSubRow}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Sub-Contractor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role/Trade</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* New Row for Adding */}
                  {newSubRow && (
                    <TableRow className="bg-blue-50">
                      <TableCell>
                        <Input
                          placeholder="Name *"
                          value={subFormData.name}
                          onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Role/Trade *"
                          value={subFormData.role}
                          onChange={(e) => setSubFormData({ ...subFormData, role: e.target.value })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Phone"
                          value={subFormData.phone}
                          onChange={(e) => setSubFormData({ ...subFormData, phone: e.target.value })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Email"
                          type="email"
                          value={subFormData.email}
                          onChange={(e) => setSubFormData({ ...subFormData, email: e.target.value })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Notes"
                          value={subFormData.notes}
                          onChange={(e) => setSubFormData({ ...subFormData, notes: e.target.value })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            onClick={handleSaveNewSub}
                            className="h-8 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelNewSub}
                            className="h-8"
                          >
                            ✕
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Existing Sub-Contractors */}
                  {subContractors.map((sub) => (
                    <TableRow key={sub.id}>
                      {editingSubId === sub.id ? (
                        // Edit Mode
                        <>
                          <TableCell>
                            <Input
                              value={subFormData.name}
                              onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={subFormData.role}
                              onChange={(e) => setSubFormData({ ...subFormData, role: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={subFormData.phone}
                              onChange={(e) => setSubFormData({ ...subFormData, phone: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={subFormData.email}
                              onChange={(e) => setSubFormData({ ...subFormData, email: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={subFormData.notes}
                              onChange={(e) => setSubFormData({ ...subFormData, notes: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateSub(sub.id)}
                                className="h-8 bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-8"
                              >
                                ✕
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <TableCell className="font-medium">{sub.name}</TableCell>
                          <TableCell>{sub.role}</TableCell>
                          <TableCell>
                            {sub.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{sub.phone}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {sub.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{sub.email}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {sub.notes}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSub(sub)}
                                className="h-8"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSub(sub.id)}
                                className="h-8 text-red-600 border-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}

                  {/* Empty State */}
                  {subContractors.length === 0 && !newSubRow && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No sub-contractors added yet. Click the "+ Add Sub-Contractor" button to get started.
                      </TableCell>
                    </TableRow>
                  )}
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
                {invitedCredentials.emailSent ? "Invitation Sent!" : "Credentials Generated"}
              </DialogTitle>
              <DialogDescription>
                {invitedCredentials.emailSent 
                  ? "Email sent with login instructions" 
                  : "Share these credentials with the team member (SMTP not configured)"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {invitedCredentials.emailSent && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <strong>Email sent to {invitedCredentials.email}</strong>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    They'll receive a password reset link. Save the credentials below as backup.
                  </p>
                </div>
              )}

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

              {!invitedCredentials.emailSent && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ <strong>SMTP not configured:</strong> Automated emails are disabled. Share credentials manually.
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    See docs/EMAIL_SETUP_GUIDE.md to enable automated invitation emails.
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Important:</strong> Ask the user to change their password after first login (Settings → Security)
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Team Member?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{memberToDelete?.full_name}</strong> from the team? 
                This action cannot be undone and will permanently remove their account and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMember}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete Member"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </PermissionGate>
  );
}