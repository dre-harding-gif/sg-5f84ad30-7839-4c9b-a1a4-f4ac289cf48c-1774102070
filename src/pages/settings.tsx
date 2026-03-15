import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Bell, Shield, Palette, Save, Smartphone, Download, Trash2, LogOut, Upload, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SetupInstructions } from "@/components/SetupInstructions";
import { useRouter } from "next/router";

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    email_jobs: true,
    email_leads: true,
    email_updates: false,
    push_jobs: true,
    push_messages: true,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        const profileData = data as any;
        setProfile({
          full_name: data.full_name || "",
          email: user.email || "",
          phone: profileData.phone || "",
          avatar_url: profileData.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: any = {
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setProfile({ ...profile, avatar_url: publicUrl });

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleSignOutAllDevices() {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out from all devices.",
      });
      router.push("/portal/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleExportData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      toast({
        title: "Preparing export",
        description: "Your data is being prepared for download...",
      });

      // Export user data as JSON
      const exportData = {
        profile,
        exported_at: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `harding-homes-data-${new Date().toISOString().split("T")[0]}.json`;
      link.click();

      toast({
        title: "Export complete",
        description: "Your data has been downloaded.",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <DashboardLayout>
      <SEO title="Settings - Harding Homes" />
      
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="setup" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Smartphone className="w-4 h-4 mr-2" />
              Setup & QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-gray-200">
                          <User className="w-10 h-10 text-primary" />
                        </div>
                      )}
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Upload a new photo</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                      {uploading && <p className="text-xs text-primary mt-1">Uploading...</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact admin to update.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="07123 456789"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New Job Assignments</Label>
                        <p className="text-sm text-muted-foreground">Receive email when assigned to new jobs</p>
                      </div>
                      <Switch
                        checked={notifications.email_jobs}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email_jobs: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New Leads</Label>
                        <p className="text-sm text-muted-foreground">Get notified about new customer inquiries</p>
                      </div>
                      <Switch
                        checked={notifications.email_leads}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email_leads: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Job Updates</Label>
                        <p className="text-sm text-muted-foreground">Status changes and progress updates</p>
                      </div>
                      <Switch
                        checked={notifications.email_updates}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email_updates: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Push Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Job Assignments</Label>
                        <p className="text-sm text-muted-foreground">Mobile push for new assignments</p>
                      </div>
                      <Switch
                        checked={notifications.push_jobs}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, push_jobs: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Team Messages</Label>
                        <p className="text-sm text-muted-foreground">Instant notifications for messages</p>
                      </div>
                      <Switch
                        checked={notifications.push_messages}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, push_messages: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                  <Button onClick={handlePasswordChange} disabled={changingPassword}>
                    {changingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage devices where you're currently logged in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Current Device</p>
                        <p className="text-xs text-muted-foreground">Your active session</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                  <Button variant="destructive" onClick={handleSignOutAllDevices}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out All Devices
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This will sign you out from all devices. You'll need to log in again.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                  <CardDescription>Export or delete your personal data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export My Data
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Download all your personal data in JSON format
                    </p>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-2 text-destructive">Danger Zone</h4>
                    <Button variant="destructive" disabled>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Contact your administrator to delete your account
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the application looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border-2 border-primary rounded-lg p-4 cursor-pointer">
                      <div className="w-full h-20 bg-white border rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Light</p>
                    </div>
                    <div className="border-2 border-transparent rounded-lg p-4 cursor-pointer hover:border-muted">
                      <div className="w-full h-20 bg-gray-900 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </div>
                    <div className="border-2 border-transparent rounded-lg p-4 cursor-pointer hover:border-muted">
                      <div className="w-full h-20 bg-gradient-to-br from-white to-gray-900 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Auto</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Reduce spacing for more content on screen</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup">
            <SetupInstructions />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}