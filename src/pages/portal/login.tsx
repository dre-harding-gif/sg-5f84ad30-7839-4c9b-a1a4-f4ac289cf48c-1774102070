import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home } from "lucide-react";
import Link from "next/link";

export default function PortalLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      router.push("/portal/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
          <Home className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Harding Homes</h1>
        <p className="text-muted-foreground mt-2">Customer Portal</p>
      </div>

      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your details to view your project progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">
                Email Address or Username
              </label>
              <Input
                id="email"
                placeholder="sarah.mitchell"
                type="text"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
              />
            </div>
            <Button className="w-full mt-6" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground border-t pt-4">
            <p>Having trouble logging in?</p>
            <p className="mt-1">Contact us at <strong>07123 456789</strong></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}