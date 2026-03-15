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
import { 
  ArrowLeft, MapPin, Phone, Mail, FileText, Package, Receipt, 
  Edit, Clock, User, CheckCircle2, Plus, Upload, Play, CheckSquare, MessageSquare, Send
} from "lucide-react";
import Link from "next/link";
import { PhotoUpload } from "@/components/PhotoUpload";
import { MapLauncher } from "@/components/MapLauncher";
import { supabase } from "@/integrations/supabase/client";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { QuoteGenerator } from "@/components/QuoteGenerator";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { useToast } from "@/hooks/use-toast";

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxPhotos, setLightboxPhotos] = useState<any[]>([]);
  
  // Notification States
  const [notificationType, setNotificationType] = useState("email");
  const [notificationMessage, setNotificationMessage] = useState("");

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
    if (id) {
      setJob(prev => ({ ...prev, id: id as string }));
      setLoading(false);
    }
  }, [id]);

  const handlePhotoClick = (photoList: any[], index: number) => {
    setLightboxPhotos(photoList);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleStatusChange = (newStatus: string) => {
    setJob({ ...job, status: newStatus });
    
    // Auto-prompt for photos based on status
    if (newStatus === "in_progress") {
      toast({
        title: "Job Started!",
        description: "Don't forget to take your 'Before' photos. Switching to Photos tab...",
      });
      // Switch to photos tab logic could go here
    } else if (newStatus === "completed") {
      setJob({ ...job, status: "completed", progress: 100 });
      toast({
        title: "Job Completed!",
        description: "Great work! Please upload the final 'After' photos for the portfolio.",
      });
    }
  };

  const sendNotification = async () => {
    if (!notificationMessage) return;
    
    toast({
      title: `${notificationType.toUpperCase()} Sent`,
      description: `Message successfully sent to ${job.customer.name}`,
    });
    setNotificationMessage("");
  };

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
            <TabsTrigger value="photos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Photos</TabsTrigger>
            <TabsTrigger value="quotes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Quotes</TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Invoices</TabsTrigger>
            <TabsTrigger value="comms" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Communications</TabsTrigger>
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
                <CardHeader>
                  <CardTitle>Assigned Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.team.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 border p-3 rounded-lg">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PHOTOS TAB - With Before/After comparison focus */}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Automated Customer Updates
                </CardTitle>
                <CardDescription>Send progress updates directly to the customer's phone or email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Quick Templates */}
                  <Button variant="outline" className="justify-start h-auto p-4 flex-col items-start gap-2" onClick={() => {
                    setNotificationType("sms");
                    setNotificationMessage("Hi Sarah, Harding Homes here. Our team is on the way to your property and will arrive in approx 30 minutes.");
                  }}>
                    <span className="font-semibold">"On Our Way"</span>
                    <span className="text-xs text-muted-foreground font-normal text-left">Quick SMS to let them know you're heading to the site.</span>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4 flex-col items-start gap-2" onClick={() => {
                    setNotificationType("email");
                    setNotificationMessage("Hi Sarah, we've completed the foundation work today. Everything is on schedule. We've uploaded new progress photos to your portal!");
                  }}>
                    <span className="font-semibold">"Daily Update"</span>
                    <span className="text-xs text-muted-foreground font-normal text-left">Email update about the day's progress.</span>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4 flex-col items-start gap-2 border-green-200 bg-green-50" onClick={() => {
                    setNotificationType("email");
                    setNotificationMessage("Hi Sarah, fantastic news! We've completed the job. Please log in to your portal to review the final photos, warranty documents, and your final invoice.");
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

                  <Button onClick={sendNotification} className="w-full sm:w-auto" disabled={!notificationMessage}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
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