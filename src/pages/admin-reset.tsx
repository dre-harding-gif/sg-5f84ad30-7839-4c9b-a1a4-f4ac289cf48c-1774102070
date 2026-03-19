import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PermissionGate } from "@/components/PermissionGate";

export default function AdminResetPage() {
  const [userId, setUserId] = useState("2178891a-ec5f-4a5d-be98-6ff7d615d431");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleReset() {
    if (!userId || !newPassword) {
      toast({
        title: "Missing fields",
        description: "Please provide both user ID and new password",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/reset-user-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      toast({
        title: "✅ Password reset successful",
        description: `Password has been updated. User can now login with the new password.`
      });

      setNewPassword("");
    } catch (error: any) {
      console.error("Reset error:", error);
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PermissionGate require="manage_team">
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Admin Password Reset</CardTitle>
              <CardDescription>
                Reset password for Dre Harding (or any user)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID"
                />
                <p className="text-sm text-muted-foreground">
                  Dre Harding&apos;s ID: 2178891a-ec5f-4a5d-be98-6ff7d615d431
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <Button 
                onClick={handleReset} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Enter the new password (minimum 6 characters)</li>
                  <li>Click &quot;Reset Password&quot;</li>
                  <li>User can immediately login with the new password</li>
                  <li>Recommend user changes password after first login</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </PermissionGate>
  );
}