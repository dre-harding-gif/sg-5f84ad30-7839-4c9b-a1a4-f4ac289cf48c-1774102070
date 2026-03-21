import { useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorDetails(null);

    try {
      console.log("🔐 Sending reset request for:", email);

      // Call our Next.js API route to handle the secure lookup and reset
      const response = await fetch('/api/reset-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword
        }),
      });

      const data = await response.json();
      console.log("📨 API response:", { status: response.status, data });

      if (!response.ok) {
        console.error("❌ API error:", data);
        console.error("❌ Full error details:", JSON.stringify(data, null, 2));
        setErrorDetails(data);
        setIsLoading(false);
        return; // Don't throw - let the error display show
      }

      if (!data.success) {
        setErrorDetails(data);
        setIsLoading(false);
        return;
      }

      console.log("✅ Password reset successful!");
      setSuccessMessage("✅ Password reset successful! User can now log in with the new password.");
      setEmail("");
      setNewPassword("");
      
    } catch (err: any) {
      console.error("❌ Reset error:", err);
      setErrorDetails(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Admin Password Reset - Harding Homes"
        description="Admin tool to reset user passwords"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-slate-200">
            <CardHeader className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl shadow-lg mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Admin Password Reset</CardTitle>
                <CardDescription className="mt-2">
                  Reset passwords for any team member
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReset} className="space-y-4">
                {successMessage && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {errorDetails && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorDetails.message || "Failed to reset password. Please try again."}</AlertDescription>
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
                    disabled={isLoading}
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
                      disabled={isLoading}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
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

              {errorDetails && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">🔍 Detailed Error Information:</h3>
                  <pre className="text-xs text-red-800 overflow-auto max-h-96 whitespace-pre-wrap">
                    {JSON.stringify(errorDetails, null, 2)}
                  </pre>
                </div>
              )}

              {/* Quick Presets */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-3">⚡ Quick Presets:</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmail("dre-harding@hardinghomes.info");
                      setNewPassword("Harding2026!");
                    }}
                    className="w-full justify-start text-left"
                    type="button"
                  >
                    <div className="text-left">
                      <div className="font-medium">Dre Harding (Owner)</div>
                      <div className="text-xs text-slate-600">dre-harding@hardinghomes.info</div>
                      <div className="text-xs text-orange-600">Password: Harding2026!</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmail("admin@hardinghamhomes.com");
                      setNewPassword("Admin2026!");
                    }}
                    className="w-full justify-start text-left"
                    type="button"
                  >
                    <div className="text-left">
                      <div className="font-medium">Admin (Office Manager)</div>
                      <div className="text-xs text-slate-600">admin@hardinghamhomes.com</div>
                      <div className="text-xs text-orange-600">Password: Admin2026!</div>
                    </div>
                  </Button>
                </div>
                <p className="text-xs text-orange-700 mt-3">
                  💡 Click a preset to auto-fill, then click "Reset Password"
                </p>
              </div>

              {/* Security Note */}
              <div className="mt-6 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
                <p>⚠️ This is a powerful admin tool. Use responsibly.</p>
                <p>Always ask users to change their password after reset.</p>
                <p className="pt-2 text-slate-600 font-medium">
                  📝 After resetting, tell users to log in at: /staff-login
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}