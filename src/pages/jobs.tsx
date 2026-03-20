import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock, 
  MoreVertical,
  Wrench,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  FileText
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { PermissionGate } from "@/components/PermissionGate";
import { useToast } from "@/hooks/use-toast";
import { emailNotificationService } from "@/services/emailNotificationService";

export interface Job {
  id: string;
  job_number: string;
  title: string;
  status: string;
  priority: string;
  address: string;
  start_date: string;
  end_date: string;
  customer_name?: string;
  customer_id?: string;
  po_numbers?: string[];
}

export default function JobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    customer_name: "",
    address: "",
    postcode: "",
    start_date: "",
    end_date: "",
    description: "",
    priority: "normal"
  });
  const [portalDialogOpen, setPortalDialogOpen] = useState(false);
  const [portalCredentials, setPortalCredentials] = useState({ email: "", password: "", portalUrl: "" });
  const [showPortalPassword, setShowPortalPassword] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          customer:profiles!jobs_customer_id_fkey(full_name),
          purchase_orders(po_number)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedJobs = (data || []).map(j => ({
        id: j.id,
        job_number: j.job_number || "JOB-PENDING",
        title: j.title,
        status: j.status,
        priority: j.priority || "normal",
        address: j.address,
        start_date: j.start_date,
        end_date: j.end_date,
        customer_name: (j.customer as any)?.full_name || "Unknown",
        customer_id: j.customer_id,
        po_numbers: (j.purchase_orders || []).map((po: any) => po.po_number)
      }));

      setJobs(formattedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generateSequentialPONumber(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("po_number")
        .order("po_number", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return "PO-000001";
      }

      const lastPO = data[0].po_number;
      const match = lastPO.match(/PO-(\d+)/);
      
      if (!match) {
        return "PO-000001";
      }

      const lastNumber = parseInt(match[1], 10);
      const nextNumber = lastNumber + 1;
      
      return `PO-${nextNumber.toString().padStart(6, "0")}`;
    } catch (error) {
      console.error("Error generating PO number:", error);
      return `PO-${Date.now().toString().slice(-6)}`;
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      // 1. Generate Job Number
      const jobNumber = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Create Job (customer_id is now optional)
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert([{
          job_number: jobNumber,
          customer_id: null, // Will be set when customer logs in/signs up
          title: formData.title,
          address: formData.address,
          postcode: formData.postcode,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          description: formData.description,
          priority: formData.priority,
          status: 'scheduled',
          notes: `Customer: ${formData.customer_name}` // Store customer name in notes for now
        }])
        .select()
        .single();
        
      if (jobError) throw jobError;

      toast({
        title: "Job Created Successfully!",
        description: `${formData.title} has been added`,
      });

      setDialogOpen(false);
      setFormData({
        title: "",
        customer_name: "",
        address: "",
        postcode: "",
        start_date: "",
        end_date: "",
        description: "",
        priority: "normal"
      });
      fetchJobs();
    } catch (error: any) {
      console.error("Job creation error:", error);
      
      const errorMessage = error.message || "Failed to create job. Please try again.";
      
      toast({
        title: "Error Creating Job",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  async function handleGeneratePO(jobId: string, jobTitle: string) {
    try {
      const poNumber = await generateSequentialPONumber();
      
      const { error: insertError } = await supabase.from("purchase_orders").insert({
        po_number: poNumber,
        job_id: jobId,
        supplier: "TBD (Update in POs page)",
        total_amount: 0,
        status: "pending"
      });
      
      if (insertError) throw insertError;
      
      toast({
        title: "P/O Generated",
        description: `P/O Number ${poNumber} created for ${jobTitle}. View it in the Purchase Orders page.`,
      });
      
      // Refresh jobs to show new P/O number
      await fetchJobs();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  async function handleStatusChange(jobId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;

      // If job is accepted and has a customer, create portal access
      if (newStatus === "active" || newStatus === "in progress") {
        const job = jobs.find(j => j.id === jobId);
        if (job?.customer_id) {
          await createCustomerPortalAccess(jobId, job.customer_id);
        }
      }

      toast({
        title: "Status Updated",
        description: `Job status changed to ${newStatus}`,
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  async function createCustomerPortalAccess(jobId: string, customerId: string) {
    try {
      // Get customer details
      const { data: customer, error: customerError } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .single();

      if (customerError || !customer) {
        console.error("Customer not found:", customerError);
        return;
      }

      // Call Edge Function to create portal account
      const { data, error } = await supabase.functions.invoke('customer-portal-setup', {
        body: {
          customerEmail: customer.email,
          customerName: customer.full_name,
          customerId: customer.id,
          jobId: jobId
        }
      });

      if (error) throw error;

      if (data.success && data.credentials) {
        // Show success dialog with credentials
        setPortalCredentials({
          email: data.credentials.email,
          password: data.credentials.password,
          portalUrl: `${window.location.origin}/portal/login`
        });
        setPortalDialogOpen(true);

        toast({
          title: "Customer Portal Created",
          description: "Share the login credentials with your customer",
        });
      }
    } catch (error: any) {
      console.error("Portal creation error:", error);
      toast({
        title: "Portal Setup Failed",
        description: "Manual setup may be required",
        variant: "destructive",
      });
    }
  }

  function copyPortalCredentialsToClipboard() {
    const credentials = `🏠 Harding Homes Customer Portal Access

Your job has been accepted! Track progress online:

Portal Login: ${portalCredentials.portalUrl}
Email: ${portalCredentials.email}
Temporary Password: ${portalCredentials.password}

⚠️ IMPORTANT: Change your password after first login

You can now:
✅ Track job progress in real-time
✅ View photos and updates
✅ Message us directly
✅ Access warranties and documents`;

    navigator.clipboard.writeText(credentials);
    toast({
      title: "Copied to Clipboard",
      description: "Share via WhatsApp, Email, or SMS"
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-orange-100 text-orange-800 border-orange-200";
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.job_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.customer_name && job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PermissionGate require="view_jobs">
      <DashboardLayout>
        <SEO title="Jobs Pipeline - Harding Homes" />
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Jobs Pipeline</h1>
              <p className="text-muted-foreground mt-1">Manage all active, scheduled, and completed projects.</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Book New Job</DialogTitle>
                  <DialogDescription>
                    Create a new job booking with customer and project details
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g., Kitchen Extension - Smith Residence"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer_name">Customer Name *</Label>
                      <Input
                        id="customer_name"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                        placeholder="M1 1AA"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Property Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="123 High Street, Manchester"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Estimated End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Job Description / Specifications</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Full description of work required, materials, special instructions..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                      Create Job
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search jobs by ID, customer, or title..." 
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Jobs List (Clean Card Layout) */}
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                    {/* Status Icon */}
                    <div className="hidden md:flex h-12 w-12 rounded-full bg-slate-50 items-center justify-center shrink-0 border">
                      {job.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Wrench className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    
                    {/* Main Info */}
                    <div className="flex-1 space-y-1 w-full">
                      <div className="flex items-center justify-between md:justify-start gap-3">
                        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {job.job_number}
                        </span>
                        <Badge variant="outline" className={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {job.po_numbers && job.po_numbers.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {job.po_numbers.map((poNum, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200">
                                {poNum}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 hover:text-primary">
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      {job.customer_name && (
                        <p className="text-sm text-slate-600 font-medium">Customer: {job.customer_name}</p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                        <span>{job.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>
                          {new Date(job.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} 
                          {' - '} 
                          {new Date(job.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0 flex-wrap">
                      <Button 
                        variant="outline" 
                        className="w-full md:w-auto text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleGeneratePO(job.id, job.title)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate P/O
                      </Button>
                      <Link href={`/jobs/${job.id}`} className="w-full md:w-auto flex-1">
                        <Button className="w-full">Manage Job</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredJobs.length === 0 && (
              <div className="text-center p-12 bg-white rounded-lg border border-dashed">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
                <p className="text-slate-500">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Portal Credentials Dialog */}
        <Dialog open={portalDialogOpen} onOpenChange={setPortalDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Customer Portal Created!
              </DialogTitle>
              <DialogDescription>
                Share these credentials with your customer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Portal URL</Label>
                  <p className="font-medium text-sm break-all">{portalCredentials.portalUrl}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{portalCredentials.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-medium">
                      {showPortalPassword ? portalCredentials.password : "••••••••••••••••"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPortalPassword(!showPortalPassword)}
                    >
                      {showPortalPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ Customer can track job progress, view photos, and message you directly through the portal
                </p>
              </div>

              <Button
                onClick={copyPortalCredentialsToClipboard}
                className="w-full bg-blue-500 hover:bg-blue-600"
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