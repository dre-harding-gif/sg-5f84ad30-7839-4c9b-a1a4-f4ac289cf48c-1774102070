import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function AdminResetPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<Array<{email: string, full_name: string, role: string}>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("email, full_name, role")
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err: any) {
      console.error("Error loading users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      console.log("🔄 Calling admin-reset-password function...");
      
      const { data, error: fnError } = await supabase.functions.invoke('admin-reset-password', {
        body: { email, newPassword }
      });

      console.log("📨 Function response:", { data, error: fnError });

      if (fnError) {
        throw new Error(fnError.message || "Failed to reset password");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Password reset failed");
      }

      setSuccess(true);
      setEmail("");
      setNewPassword("");
      
    } catch (err: any) {
      console.error("❌ Reset error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Admin Password Reset - Harding Homes"
        description="Admin tool to reset user passwords"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-lg mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Password Reset</h1>
            <p className="text-slate-600 mt-2">Reset passwords for any team member</p>
          </div>

          {/* Quick Access: Load Users */}
          <Card className="shadow-xl border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Quick Access - Team Members</CardTitle>
              <CardDescription>Click to load all team members and their emails</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={loadUsers}
                disabled={loadingUsers}
                variant="outline"
                className="w-full"
              >
                {loadingUsers ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Users...
                  </>
                ) : (
                  <>Load Team Members</>
                )}
              </Button>

              {users.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700">Click an email to auto-fill:</p>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {users.map((user) => (
                      <button
                        key={user.email}
                        onClick={() => setEmail(user.email)}
                        className="w-full text-left p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-medium text-slate-900">{user.full_name}</div>
                        <div className="text-sm text-slate-600">{user.email}</div>
                        <div className="text-xs text-slate-500 mt-1">Role: {user.role}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reset Form */}
          <Card className="shadow-xl border-slate-200">
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Enter email and new password for the user</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReset} className="space-y-4">
                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ Password reset successful! The user can now log in with the new password.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@hardinghomes.info"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                  <p className="text-xs text-slate-500">
                    Enter the email address of the user whose password you want to reset
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Minimum 6 characters. User should change this after first login.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base bg-orange-500 hover:bg-orange-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Presets */}
          <Card className="shadow-xl border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-sm">⚡ Quick Reset Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail("dre-harding@hardinghomes.info");
                    setNewPassword("Harding2026!");
                  }}
                  className="text-left justify-start"
                >
                  <div>
                    <div className="font-medium">Dre Harding (Owner)</div>
                    <div className="text-xs text-slate-600">dre-harding@hardinghomes.info</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail("admin@hardinghamhomes.com");
                    setNewPassword("Admin2026!");
                  }}
                  className="text-left justify-start"
                >
                  <div>
                    <div className="font-medium">Admin (Office Manager)</div>
                    <div className="text-xs text-slate-600">admin@hardinghamhomes.com</div>
                  </div>
                </Button>
              </div>
              <p className="text-xs text-orange-700 mt-2">
                💡 Click a preset to auto-fill email and suggested password
              </p>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="text-center text-xs text-slate-500 space-y-1">
            <p>⚠️ This is a powerful admin tool. Use responsibly.</p>
            <p>Always ask users to change their password after reset.</p>
          </div>
        </div>
      </div>
    </>
  );
}