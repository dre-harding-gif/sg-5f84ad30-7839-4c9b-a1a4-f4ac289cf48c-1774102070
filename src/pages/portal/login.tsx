import { useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services/authService";

export default function CustomerPortalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.signIn(email, password);
      router.push("/portal/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setRecoverySuccess(false);

    try {
      await authService.sendPasswordRecoveryEmail(recoveryEmail);
      setRecoverySuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send recovery email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <SEO 
        title="Customer Portal Login - Harding Homes"
        description="Access your Harding Homes customer portal"
      />

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Harding Homes</CardTitle>
          <CardDescription>
            {showRecovery ? "Reset Your Password" : "Customer Portal Login"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!showRecovery ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowRecovery(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </div>

              <div className="pt-4 border-t text-center text-sm text-muted-foreground">
                Need access? Contact Harding Homes to receive your login credentials.
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordRecovery} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {recoverySuccess && (
                <Alert>
                  <AlertDescription>
                    Password recovery email sent! Check your inbox for a link to reset your password.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email Address</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  We'll send you a link to reset your password.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Recovery Email"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(false);
                    setRecoverySuccess(false);
                    setError("");
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}