import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { maintenanceRequestService } from "@/services/maintenanceRequestService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  jobs: {
    id: string;
    job_name: string;
    address: string;
  };
}

export default function MaintenanceRequests() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    job_id: "",
    title: "",
    description: "",
    priority: "medium"
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  async function checkAuthAndLoadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/portal/login");
        return;
      }

      // Get customer data
      const { data: customerData } = await supabase
        .from("customers")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (!customerData) {
        console.error("No customer found");
        setLoading(false);
        return;
      }

      setCustomerId(customerData.id);

      // Load customer's jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, job_name, address")
        .eq("customer_id", customerData.id)
        .order("created_at", { ascending: false });

      setJobs(jobsData || []);

      // Load existing maintenance requests
      const { data: requestsData } = await maintenanceRequestService.getCustomerRequests(customerData.id);
      setRequests(requestsData || []);

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!customerId || !formData.job_id) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await maintenanceRequestService.createRequest({
        customer_id: customerId,
        job_id: formData.job_id,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: "pending"
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "We'll review your request and get back to you soon.",
      });

      // Reset form and reload requests
      setFormData({ job_id: "", title: "", description: "", priority: "medium" });
      setShowForm(false);
      checkAuthAndLoadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "in_progress": return <AlertCircle className="h-4 w-4" />;
      case "resolved": return <CheckCircle2 className="h-4 w-4" />;
      default: return null;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/portal/dashboard")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance Requests</h1>
          <p className="text-slate-600">Submit and track your service requests</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* New Request Form */}
        {!showForm ? (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-slate-600 mb-4">Submit a maintenance request or ask us a question</p>
              <Button onClick={() => setShowForm(true)} size="lg">
                <Send className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit Maintenance Request</CardTitle>
              <CardDescription>Fill out the form below and we&apos;ll get back to you as soon as possible</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="job">Project</Label>
                  <Select value={formData.job_id} onValueChange={(value) => setFormData({ ...formData, job_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.job_name} - {job.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Can wait</SelectItem>
                      <SelectItem value="medium">Medium - Normal urgency</SelectItem>
                      <SelectItem value="high">High - Needs attention soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Subject</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of your request"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Details</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Please provide as much detail as possible..."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Previous Requests */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Your Requests</h2>
          
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-600">
                No maintenance requests yet
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {request.jobs.job_name} - {request.jobs.address}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(request.priority)} className="capitalize">
                        {request.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(request.status)} capitalize flex items-center gap-1`}>
                        {getStatusIcon(request.status)}
                        {request.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-3 whitespace-pre-wrap">{request.description}</p>
                  <p className="text-sm text-slate-500">
                    Submitted {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}