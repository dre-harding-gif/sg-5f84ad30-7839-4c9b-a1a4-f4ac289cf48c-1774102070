import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, MapPin, Phone, Mail, FileText, Package, Receipt, 
  Edit, Clock, User, CheckCircle2, Plus, Upload, Play, CheckSquare, MessageSquare, Send,
  AlertCircle, FileUp, Download, Trash2, Calendar, Timer
} from "lucide-react";
import Link from "next/link";
import { PhotoUpload } from "@/components/PhotoUpload";
import { MapLauncher } from "@/components/MapLauncher";
import { supabase } from "@/integrations/supabase/client";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { QuoteGenerator } from "@/components/QuoteGenerator";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { useToast } from "@/hooks/use-toast";
import { sendNotification, sendCustomNotification } from "@/services/notificationService";

interface TimeLog {
  id: string;
  job_id: string;
  user_id: string;
  log_date: string;
  hours_worked: number;
  work_description: string;
  profiles: {
    full_name: string;
  };
}

interface JobDocument {
  id: string;
  job_id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  uploaded_by: string;
  uploaded_at: string;
  profiles: {
    full_name: string;
  };
}

interface CustomerCommunication {
  id: string;
  job_id: string;
  message: string;
  sender_id: string;
  sender_type: string;
  is_concern: boolean;
  concern_resolved: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [documents, setDocuments] = useState<JobDocument[]>([]);
  const [communications, setCommunications] = useState<CustomerCommunication[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxPhotos, setLightboxPhotos] = useState<any[]>([]);
  
  // Time Log States
  const [showTimeLogDialog, setShowTimeLogDialog] = useState(false);
  const [newTimeLog, setNewTimeLog] = useState({
    log_date: new Date().toISOString().split('T')[0],
    hours_worked: 0,
    work_description: ""
  });
  
  // Document Upload States
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [documentType, setDocumentType] = useState("plan");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
  // Notification States
  const [notificationType, setNotificationType] = useState("email");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isConcern, setIsConcern] = useState(false);

  const [job, setJob] = useState({
    id: id as string,
    jobNumber: "JOB-2024-001",
    title: "Kitchen Extension",
    status: "in_progress",
    priority: "high",
    customer: {
      id: "cust-1",
      name: "Sarah Mitchell",
      email: "sarah.mitchell@email.com",
      phone: "07700 900123",
      address: "45 Oak Avenue, Manchester, M20 4RJ"
    },
    dates: {
      start: "2026-03-01",
      end: "2026-04-15",
      estimated: "6 weeks"
    },
    team: [
      { id: "1", name: "Mike Johnson", role: "Lead Builder", avatar: "" },
      { id: "2", name: "Tom Davies", role: "Electrician", avatar: "" }
    ],
    progress: 65,
    estimatedValue: 45000,
    materials: [
      { name: "Plasterboard (12.5mm)", quantity: 24, unit: "sheets", inStock: true, location: "Unit 1 - B1" },
      { name: "Timber Joists (4x2)", quantity: 12, unit: "lengths", inStock: true, location: "Unit 1 - A3" }
    ],
    photos: [
      { id: "1", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e", type: "before", caption: "Initial site condition" },
      { id: "2", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a", type: "progress", caption: "Foundation dug" }
    ]
  });

  // Photo categories
  const beforePhotos = job.photos.filter(p => p.type === "before");
  const progressPhotos = job.photos.filter(p => p.type === "progress");
  const afterPhotos = job.photos.filter(p => p.type === "after");

  useEffect(() => {
    async function init() {
      const { data: { session: userSession } } = await supabase.auth.getSession();
      setSession(userSession);
      
      if (id) {
        setJob(prev => ({ ...prev, id: id as string }));
        await fetchTimeLogs();
        await fetchDocuments();
        await fetchCommunications();
        await fetchPurchaseOrders();
        setLoading(false);
      }
    }
    init();
  }, [id]);

  async function fetchTimeLogs() {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("time_logs")
        .select("*, profiles!time_logs_user_id_fkey(full_name)")
        .eq("job_id", id as string)
        .order("log_date", { ascending: false });
      
      if (error) throw error;
      setTimeLogs((data as unknown as TimeLog[]) || []);
    } catch (error) {
      console.error("Error fetching time logs:", error);
    }
  }

  async function fetchDocuments() {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("job_documents")
        .select("*, profiles!job_documents_uploaded_by_fkey(full_name)")
        .eq("job_id", id as string)
        .order("uploaded_at", { ascending: false });
      
      if (error) throw error;
      setDocuments((data as unknown as JobDocument[]) || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }

  async function fetchCommunications() {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("customer_communications")
        .select("*, profiles!customer_communications_sender_id_fkey(full_name)")
        .eq("job_id", id as string)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setCommunications((data as unknown as CustomerCommunication[]) || []);
    } catch (error) {
      console.error("Error fetching communications:", error);
    }
  }

  async function fetchPurchaseOrders() {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*")
        .eq("job_id", id as string)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setPurchaseOrders(data || []);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
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

  async function handleGeneratePOForJob() {
    try {
      const poNumber = await generateSequentialPONumber();
      
      const { error } = await supabase.from("purchase_orders").insert({
        po_number: poNumber,
        job_id: id as string,
        supplier: "TBD (Update in POs page)",
        total_amount: 0,
        status: "pending"
      });
      
      if (error) throw error;
      
      toast({
        title: "P/O Generated",
        description: `P/O Number ${poNumber} created successfully. View it in the Purchase Orders page.`,
      });
      
      await fetchPurchaseOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function handleAddTimeLog() {
    if (!session?.user?.id || !newTimeLog.hours_worked || newTimeLog.hours_worked <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid hours worked",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("time_logs")
        .insert({
          job_id: id as string,
          user_id: session.user.id,
          log_date: newTimeLog.log_date,
          hours_worked: newTimeLog.hours_worked,
          work_description: newTimeLog.work_description
        });

      if (error) throw error;

      toast({
        title: "Time Log Added",
        description: `${newTimeLog.hours_worked} hours recorded successfully`
      });

      setShowTimeLogDialog(false);
      setNewTimeLog({ log_date: new Date().toISOString().split('T')[0], hours_worked: 0, work_description: "" });
      await fetchTimeLogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function handleDocumentUpload() {
    if (!documentFile || !session?.user?.id) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      const fileExt = documentFile.name.split('.').pop();
      const fileName = `${id}/${documentType}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('job-documents')
        .upload(fileName, documentFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('job-documents')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from("job_documents")
        .insert({
          job_id: id as string,
          document_type: documentType,
          document_name: documentFile.name,
          document_url: publicUrl,
          uploaded_by: session.user.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Document Uploaded",
        description: `${documentFile.name} uploaded successfully`
      });

      setShowDocumentDialog(false);
      setDocumentFile(null);
      await fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function handleDeleteDocument(docId: string, documentUrl: string) {
    try {
      const fileNameMatch = documentUrl.match(/\/job-documents\/(.+)$/);
      if (fileNameMatch && fileNameMatch[1]) {
        const { error: storageError } = await supabase.storage
          .from('job-documents')
          .remove([fileNameMatch[1]]);
        if (storageError) console.error("Storage deletion error:", storageError);
      }

      const { error: dbError } = await supabase
        .from("job_documents")
        .delete()
        .eq("id", docId);

      if (dbError) throw dbError;

      toast({
        title: "Document Deleted",
        description: "Document removed successfully"
      });

      await fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  const handlePhotoClick = (photoList: any[], index: number) => {
    setLightboxPhotos(photoList);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    setJob({ ...job, status: newStatus });
    
    if (newStatus === "in_progress") {
      toast({
        title: "Job Started!",
        description: "Don't forget to take your 'Before' photos. Switching to Photos tab...",
      });
      
      try {
        await sendNotification(job.customer.id, "jobStarting", {
          jobNumber: job.jobNumber,
          jobTitle: job.title,
          startDate: new Date().toLocaleDateString(),
          teamMembers: job.team.map(m => `- ${m.name} (${m.role})`).join("\n"),
          portalLink: `${window.location.origin}/portal/dashboard`
        });
        
        toast({
          title: "Customer Notified",
          description: "Automated email sent to customer about job start",
        });
      } catch (error) {
        console.error("Notification error:", error);
      }
    } else if (newStatus === "completed") {
      setJob({ ...job, status: "completed", progress: 100 });
      toast({
        title: "Job Completed!",
        description: "Great work! Please upload the final 'After' photos for the portfolio.",
      });
      
      try {
        await sendNotification(job.customer.id, "jobCompleted", {
          jobNumber: job.jobNumber,
          jobTitle: job.title,
          completionDate: new Date().toLocaleDateString(),
          invoiceNumber: "INV-" + Date.now(),
          portalLink: `${window.location.origin}/portal/dashboard`
        });
        
        toast({
          title: "Customer Notified",
          description: "Job completion email sent with portal access for final review",
        });
      } catch (error) {
        console.error("Notification error:", error);
      }
    }
  };

  const handleSendNotification = async () => {
    if (!notificationMessage || !session?.user?.id) return;
    
    try {
      const { error } = await supabase
        .from("customer_communications")
        .insert({
          job_id: id as string,
          customer_id: job.customer.id,
          message: notificationMessage,
          sender_id: session.user.id,
          sender_type: "staff",
          is_concern: isConcern,
          concern_resolved: false
        });

      if (error) throw error;

      await sendCustomNotification(
        job.customer.id,
        notificationType as "email" | "sms",
        notificationMessage,
        notificationType === "email" ? `Update on ${job.title}` : undefined
      );
      
      toast({
        title: `${notificationType.toUpperCase()} Sent`,
        description: `Message successfully sent to ${job.customer.name}`,
      });
      setNotificationMessage("");
      setIsConcern(false);
      await fetchCommunications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  async function handleResolveConcern(commId: string) {
    try {
      const { error } = await supabase
        .from("customer_communications")
        .update({ concern_resolved: true })
        .eq("id", commId);

      if (error) throw error;

      toast({
        title: "Concern Resolved",
        description: "Customer concern marked as resolved"
      });

      await fetchCommunications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  const totalHours = timeLogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
  const unresolvedConcerns = communications.filter(c => c.is_concern && !c.concern_resolved);

  return (
    <DashboardLayout>
      <SEO title={`${job.title} - Job Details`} />
      
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/jobs")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
                <Badge className={
                  job.status === "in_progress" ? "bg-orange-100 text-orange-800" :
                  job.status === "completed" ? "bg-green-100 text-green-800" :
                  "bg-blue-100 text-blue-800"
                }>
                  {job.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {unresolvedConcerns.length > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {unresolvedConcerns.length} Concern{unresolvedConcerns.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-mono">{job.jobNumber}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.status === "planning" && (
              <Button onClick={() => handleStatusChange("in_progress")} className="bg-orange-600 hover:bg-orange-700">
                <Play className="w-4 h-4 mr-2" />
                Start Job
              </Button>
            )}
            {job.status === "in_progress" && (
              <Button onClick={() => handleStatusChange("completed")} className="bg-green-600 hover:bg-green-700">
                <CheckSquare className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
            <Link href={`/jobs/${job.id}/sheet`}>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Job Sheet
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start">
            <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Details</TabsTrigger>
            <TabsTrigger value="time-logs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
              Time Logs
              {totalHours > 0 && <Badge variant="secondary" className="ml-2">{totalHours}h</Badge>}
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Photos</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
              Documents
              {documents.length > 0 && <Badge variant="secondary" className="ml-2">{documents.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="quotes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Quotes</TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Invoices</TabsTrigger>
            <TabsTrigger value="comms" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
              Communications
              {unresolvedConcerns.length > 0 && <Badge variant="destructive" className="ml-2">{unresolvedConcerns.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="materials" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <h3 className="text-2xl font-bold">{job.progress}%</h3>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <Progress value={job.progress} className="mt-3" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Value</p>
                      <h3 className="text-2xl font-bold">£{(job.estimatedValue).toLocaleString()}</h3>
                    </div>
                    <Receipt className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <h3 className="text-2xl font-bold">{totalHours}h</h3>
                    </div>
                    <Timer className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Documents</p>
                      <h3 className="text-2xl font-bold">{documents.length}</h3>
                    </div>
                    <FileText className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{job.customer.name}</p>
                      <p className="text-sm text-muted-foreground">Primary Contact</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <a href={`mailto:${job.customer.email}`} className="text-sm text-primary hover:underline">{job.customer.email}</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <a href={`tel:${job.customer.phone}`} className="text-sm text-primary hover:underline">{job.customer.phone}</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{job.customer.address}</p>
                      <MapLauncher address={job.customer.address} className="mt-2" size="sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Purchase Orders</CardTitle>
                    <CardDescription>P/O numbers for this job</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleGeneratePOForJob} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate P/O
                  </Button>
                </CardHeader>
                <CardContent>
                  {purchaseOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Receipt className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No P/O numbers generated yet</p>
                      <p className="text-xs">Click "Generate P/O" to create one</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {purchaseOrders.map((po) => (
                        <div key={po.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Receipt className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-mono font-semibold text-sm">{po.po_number}</p>
                              <p className="text-xs text-muted-foreground">
                                {po.supplier} • {po.status.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="font-mono">
                            £{(po.total_amount || 0).toLocaleString()}
                          </Badge>
                        </div>
                      ))}
                      <div className="pt-2 border-t">
                        <Link href="/purchase-orders" className="text-sm text-primary hover:underline flex items-center gap-1">
                          View all in Purchase Orders page
                          <ArrowLeft className="w-3 h-3 rotate-180" />
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TIME LOGS TAB */}
          <TabsContent value="time-logs" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Time Tracking</CardTitle>
                  <CardDescription>Record hours worked on this job for accurate tracking and analytics</CardDescription>
                </div>
                <Dialog open={showTimeLogDialog} onOpenChange={setShowTimeLogDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Log Time
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Time Log</DialogTitle>
                      <DialogDescription>Record hours worked on this job</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input 
                          type="date" 
                          value={newTimeLog.log_date}
                          onChange={(e) => setNewTimeLog({ ...newTimeLog, log_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hours Worked</Label>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.5"
                          placeholder="e.g., 8 or 4.5"
                          value={newTimeLog.hours_worked || ""}
                          onChange={(e) => setNewTimeLog({ ...newTimeLog, hours_worked: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea 
                          placeholder="What work was completed?"
                          value={newTimeLog.work_description}
                          onChange={(e) => setNewTimeLog({ ...newTimeLog, work_description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowTimeLogDialog(false)}>Cancel</Button>
                      <Button onClick={handleAddTimeLog}>Save Time Log</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {timeLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No time logs recorded yet</p>
                    <p className="text-sm">Click "Log Time" to start tracking hours</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Total Hours Worked:</span>
                        <span className="text-2xl font-bold text-primary">{totalHours} hours</span>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Team Member</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timeLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.log_date).toLocaleDateString()}</TableCell>
                            <TableCell>{log.profiles?.full_name || "Unknown"}</TableCell>
                            <TableCell className="font-semibold">{log.hours_worked}h</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{log.work_description || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PHOTOS TAB */}
          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Job Documentation</CardTitle>
                    <CardDescription>Capture progress from start to finish</CardDescription>
                  </div>
                  <div className="w-1/3">
                    <PhotoUpload jobId={id as string} defaultType={job.status === "planning" ? "before" : job.status === "completed" ? "after" : "progress"} />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="space-y-8">
              {/* Before Photos */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <h3 className="text-xl font-semibold text-orange-600">Before Work Started</h3>
                  <Badge variant="outline">{beforePhotos.length}</Badge>
                </div>
                {beforePhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {beforePhotos.map((photo, index) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-4 ring-orange-500 transition-all" onClick={() => handlePhotoClick(beforePhotos, index)}>
                        <img src={photo.url} alt="Before" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">{photo.caption || "Initial condition"}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground bg-muted/10">
                    <p>No "Before" photos uploaded yet.</p>
                  </div>
                )}
              </div>

              {/* Progress Photos */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <h3 className="text-xl font-semibold text-blue-600">Work In Progress</h3>
                  <Badge variant="outline">{progressPhotos.length}</Badge>
                </div>
                {progressPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {progressPhotos.map((photo, index) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-4 ring-blue-500 transition-all" onClick={() => handlePhotoClick(progressPhotos, index)}>
                        <img src={photo.url} alt="Progress" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">{photo.caption || "Progress update"}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* After Photos */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <h3 className="text-xl font-semibold text-green-600">Completed Work (After)</h3>
                  <Badge variant="outline">{afterPhotos.length}</Badge>
                </div>
                {afterPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {afterPhotos.map((photo, index) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-4 ring-green-500 transition-all" onClick={() => handlePhotoClick(afterPhotos, index)}>
                        <img src={photo.url} alt="After" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">{photo.caption || "Finished result"}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground bg-muted/10">
                    <p>No "After" photos uploaded yet. Upload these when the job is complete to build your portfolio!</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Job Documents</CardTitle>
                  <CardDescription>Plans, specifications, warranties, and certificates</CardDescription>
                </div>
                <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <FileUp className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                      <DialogDescription>Add plans, specs, warranties, or certificates</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Document Type</Label>
                        <Select value={documentType} onValueChange={setDocumentType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plan">Architectural Plan</SelectItem>
                            <SelectItem value="specification">Job Specification</SelectItem>
                            <SelectItem value="warranty">Warranty Document</SelectItem>
                            <SelectItem value="certificate">Certificate</SelectItem>
                            <SelectItem value="permit">Building Permit</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>File</Label>
                        <Input 
                          type="file" 
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-muted-foreground">PDF, Word, or Image files accepted</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>Cancel</Button>
                      <Button onClick={handleDocumentUpload}>Upload</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                    <p className="text-sm">Click "Upload Document" to add plans, specs, or warranties</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {doc.document_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{doc.document_name}</TableCell>
                          <TableCell>{doc.profiles?.full_name || "Unknown"}</TableCell>
                          <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4" />
                                </a>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleDeleteDocument(doc.id, doc.document_url)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUOTES TAB */}
          <TabsContent value="quotes">
            <QuoteGenerator customerId={job.customer.id} jobId={job.id} />
          </TabsContent>

          {/* INVOICES TAB */}
          <TabsContent value="invoices">
            <InvoiceGenerator jobId={job.id} />
          </TabsContent>

          {/* COMMUNICATIONS TAB */}
          <TabsContent value="comms" className="space-y-6">
            {unresolvedConcerns.length > 0 && (
              <Card className="border-destructive">
                <CardHeader className="bg-destructive/10">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    Unresolved Customer Concerns
                  </CardTitle>
                  <CardDescription>These require immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {unresolvedConcerns.map((comm) => (
                      <div key={comm.id} className="border-l-4 border-destructive pl-4 py-2">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm text-muted-foreground">
                              {new Date(comm.created_at).toLocaleDateString()} - {comm.profiles?.full_name}
                            </p>
                          </div>
                          <Button size="sm" onClick={() => handleResolveConcern(comm.id)}>
                            Mark Resolved
                          </Button>
                        </div>
                        <p className="text-sm">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Customer Communications
                </CardTitle>
                <CardDescription>Send updates and track customer concerns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Quick Templates */}
                  <Button variant="outline" className="justify-start h-auto p-4 flex-col items-start gap-2" onClick={() => {
                    setNotificationType("sms");
                    setNotificationMessage(`Hi ${job.customer.name.split(' ')[0]}, Harding Homes here. Our team is on the way to your property and will arrive in approx 30 minutes.`);
                  }}>
                    <span className="font-semibold">"On Our Way"</span>
                    <span className="text-xs text-muted-foreground font-normal text-left">Quick SMS to let them know you're heading to the site.</span>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4 flex-col items-start gap-2" onClick={() => {
                    setNotificationType("email");
                    setNotificationMessage(`Hi ${job.customer.name.split(' ')[0]}, we've completed the foundation work today. Everything is on schedule. We've uploaded new progress photos to your portal!`);
                  }}>
                    <span className="font-semibold">"Daily Update"</span>
                    <span className="text-xs text-muted-foreground font-normal text-left">Email update about the day's progress.</span>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4 flex-col items-start gap-2 border-green-200 bg-green-50" onClick={() => {
                    setNotificationType("email");
                    setNotificationMessage(`Hi ${job.customer.name.split(' ')[0]}, fantastic news! We've completed the job. Please log in to your portal to review the final photos, warranty documents, and your final invoice.`);
                  }}>
                    <span className="font-semibold text-green-700">"Job Complete"</span>
                    <span className="text-xs text-muted-foreground font-normal text-left">Official handover and invoice prompt.</span>
                  </Button>
                </div>

                <div className="space-y-4 border rounded-lg p-5 bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="space-y-1 flex-1">
                      <Label>Send Method</Label>
                      <Select value={notificationType} onValueChange={setNotificationType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email ({job.customer.email})</SelectItem>
                          <SelectItem value="sms">SMS Text ({job.customer.phone})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-7">
                      <input
                        type="checkbox"
                        id="is-concern"
                        checked={isConcern}
                        onChange={(e) => setIsConcern(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="is-concern" className="text-sm font-normal">
                        This is a customer concern
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Message Content</Label>
                    <Textarea 
                      rows={5} 
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      placeholder="Type your message to the customer here..."
                      className="resize-none"
                    />
                  </div>

                  <Button onClick={handleSendNotification} className="w-full sm:w-auto" disabled={!notificationMessage}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </div>

                {/* Communication History */}
                <div className="space-y-4 mt-8">
                  <h3 className="font-semibold text-lg">Communication History</h3>
                  {communications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No communications logged yet</p>
                  ) : (
                    <div className="space-y-3">
                      {communications.map((comm) => (
                        <div key={comm.id} className={`border rounded-lg p-4 ${comm.is_concern ? 'border-l-4 border-l-destructive bg-destructive/5' : ''}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{comm.profiles?.full_name}</p>
                              {comm.is_concern && (
                                <Badge variant={comm.concern_resolved ? "outline" : "destructive"} className="text-xs">
                                  {comm.concern_resolved ? "Concern Resolved" : "Customer Concern"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{new Date(comm.created_at).toLocaleString()}</p>
                          </div>
                          <p className="text-sm">{comm.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle>Materials Required</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {job.materials.map((material, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{material.quantity} {material.unit}</TableCell>
                        <TableCell>
                          {material.inStock ? (
                            <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-800">Needs Order</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {material.location || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={lightboxPhotos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        canDelete={true}
      />
    </DashboardLayout>
  );
}