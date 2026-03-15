import { useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CustomerLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      if (data.session) {
        router.push("/portal/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions"
      });
      
      setIsReset(false);
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <SEO title="Customer Portal Login - Harding Homes" />
      
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-block bg-white p-6 rounded-2xl shadow-xl mb-4">
            <Image 
              src="/harding-homes-logo.svg" 
              alt="Harding Homes" 
              width={200} 
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Customer Portal</h1>
          <p className="text-blue-100">Track your project progress</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>{isReset ? "Reset Password" : "Welcome Back"}</CardTitle>
            <CardDescription>
              {isReset 
                ? "Enter your email to receive reset instructions" 
                : "Sign in to view your projects and updates"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isReset ? handleResetPassword : handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {!isReset && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full bg-gradient-brand" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>{isReset ? "Send Reset Link" : "Sign In"}</>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsReset(!isReset)}
                  className="text-sm text-primary hover:underline"
                >
                  {isReset ? "Back to login" : "Forgot password?"}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Need help accessing your account?</p>
              <p className="mt-1">Contact us: <a href="tel:01234567890" className="text-primary hover:underline">01234 567890</a></p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-white/80 text-sm">
          <p>© 2026 Harding Homes Ltd. All rights reserved.</p>
          <p className="mt-1">Building Excellence Since 2010</p>
        </div>
      </div>
    </div>
  );
}