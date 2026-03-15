import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, MapPin, Users, FileText, MessageSquare, 
  Download, LogOut, CheckCircle, Clock, AlertCircle,
  Image as ImageIcon, Send
} from "lucide-react";
import { format } from "date-fns";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { MapLauncher } from "@/components/MapLauncher";

interface CustomerJob {
  id: string;
  job_number: string;
  status: string;
  start_date: string;
  end_date: string | null;
  description: string;
  address: string;
  team_members: string[];
  materials: any[];
  photos: any[];
  documents: any[];
  messages: any[];
  estimated_cost: number;
}

export default function CustomerPortal() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<CustomerJob | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/portal/login");
        return;
      }

      // Load customer data
      const { data: customerData } = await supabase
        .from("customers" as any)
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (!customerData) {
        toast({
          title: "Access Denied",
          description: "No customer account found",
          variant: "destructive"
        });
        await supabase.auth.signOut();
        router.push("/portal/login");
        return;
      }

      setCustomer(customerData);
      await loadCustomerJobs(customerData.id);
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerJobs = async (customerId: string) => {
    try {
      // Load jobs first
      const jobsResponse = await supabase
        .from("jobs")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      const jobsData = jobsResponse.data as any;
      const jobsError = jobsResponse.error;

      if (jobsError) throw jobsError;

      if (jobsData && jobsData.length > 0) {
        const jobsList: any[] = Array.isArray(jobsData) ? jobsData : [];
        const jobIds = jobsList.map((j: any) => j.id);

        // Load photos for these jobs
        const photosResponse = await supabase
          .from("job_photos")
          .select("*")
          .in("job_id", jobIds);
        const photosData = photosResponse.data as any;

        // Load quotes for these jobs
        const quotesResponse = await supabase
          .from("quotes")
          .select("*")
          .in("job_id", jobIds);
        const quotesData = quotesResponse.data as any;

        const formattedJobs = jobsList.map((job: any) => ({
          id: job.id,
          job_number: job.job_number || `JOB-${job.id.slice(0, 8)}`,
          status: job.status,
          start_date: job.start_date,
          end_date: job.end_date,
          description: job.description || "No description",
          address: job.address || "No address",
          team_members: job.assigned_team || [],
          materials: job.materials || [],
          photos: photosData?.filter((p: any) => p.job_id === job.id) || [],
          documents: [],
          messages: [],
          estimated_cost: quotesData?.find((q: any) => q.job_id === job.id)?.total || job.estimated_cost || 0
        }));

        setJobs(formattedJobs);
        if (formattedJobs.length > 0 && !selectedJob) {
          setSelectedJob(formattedJobs[0]);
        }
      }
    } catch (error: any) {
      console.error("Load jobs error:", error);
      toast({
        title: "Error Loading Jobs",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedJob || !customer) return;

    try {
      const { error } = await supabase
        .from("notifications" as any)
        .insert({
          customer_id: customer.id,
          job_id: selectedJob.id,
          type: "message",
          message: newMessage,
          status: "sent",
          sent_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Your message has been sent to Harding Homes"
      });

      setNewMessage("");
    } catch (error: any) {
      console.error("Send message error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/portal/login");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "planning":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "planning":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SEO title="Customer Portal - Harding Homes" />
        <p className="text-muted-foreground">Loading your jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Customer Portal - Harding Homes" />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Harding Homes</h1>
              <p className="text-sm text-muted-foreground">Customer Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{customer?.name}</p>
                <p className="text-sm text-muted-foreground">{customer?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Jobs List Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Jobs ({jobs.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedJob?.id === job.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium">{job.job_number}</span>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(job.start_date), "dd MMM yyyy")}
                    </div>
                  </button>
                ))}

                {jobs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No jobs found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Job Details */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{selectedJob.job_number}</CardTitle>
                          <p className="text-muted-foreground mt-1">
                            {selectedJob.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedJob.status)}
                          <Badge className={getStatusColor(selectedJob.status)}>
                            {selectedJob.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Start Date</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(selectedJob.start_date), "dd MMMM yyyy")}
                            </p>
                          </div>
                        </div>

                        {selectedJob.end_date && (
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Completion Date</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(selectedJob.end_date), "dd MMMM yyyy")}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedJob.address}
                            </p>
                            <MapLauncher address={selectedJob.address} />
                          </div>
                        </div>

                        {selectedJob.team_members.length > 0 && (
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">Team</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedJob.team_members.join(", ")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedJob.estimated_cost > 0 && (
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Project Value</span>
                            <span className="text-2xl font-bold">
                              £{selectedJob.estimated_cost.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {selectedJob.materials.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Materials & Specifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedJob.materials.map((material: any, index: number) => (
                            <li key={index} className="flex items-center justify-between">
                              <span>{material.name}</span>
                              <span className="text-muted-foreground">
                                Qty: {material.quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="photos">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Photos ({selectedJob.photos.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedJob.photos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedJob.photos.map((photo: any, index: number) => (
                            <div
                              key={photo.id}
                              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                              onClick={() => {
                                setLightboxIndex(index);
                                setLightboxOpen(true);
                              }}
                            >
                              <img
                                src={photo.photo_url}
                                alt={photo.caption || `Photo ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              {photo.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                                  <p className="text-white text-xs line-clamp-2">
                                    {photo.caption}
                                  </p>
                                </div>
                              )}
                              {photo.photo_type && (
                                <Badge className="absolute top-2 right-2">
                                  {photo.photo_type}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No photos uploaded yet
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <CardTitle>Documents & Warranties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedJob.documents.length > 0 ? (
                        <div className="space-y-2">
                          {selectedJob.documents.map((doc: any) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {doc.type}
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No documents available yet
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="messages">
                  <Card>
                    <CardHeader>
                      <CardTitle>Messages & Updates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedJob.messages.length > 0 ? (
                          selectedJob.messages.map((msg: any) => (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-lg ${
                                msg.sender === "customer"
                                  ? "bg-primary/10 ml-8"
                                  : "bg-muted mr-8"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(msg.sent_at), "dd MMM yyyy HH:mm")}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              No messages yet. Send one below!
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-4 border-t">
                        <Label>Send a message to Harding Homes</Label>
                        <Textarea
                          placeholder="Type your message or question here..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={3}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Select a job from the list to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && selectedJob && (
        <PhotoLightbox
          photos={selectedJob.photos}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          canDelete={false}
        />
      )}
    </div>
  );
}