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
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail,
  FileText,
  Package,
  Receipt,
  Edit,
  Clock,
  User,
  CheckCircle2,
  Plus,
  MapPinned,
  Calendar,
  Upload
} from "lucide-react";
import Link from "next/link";
import { PhotoUpload } from "@/components/PhotoUpload";
import { MapLauncher } from "@/components/MapLauncher";
import { supabase } from "@/integrations/supabase/client";
import { PhotoLightbox } from "@/components/PhotoLightbox";

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: string;
  items_description: string;
  total_amount: number;
  order_date: string;
  status: string;
}

interface TimeLog {
  id: string;
  date: string;
  staff_name: string;
  hours_worked: number;
  task_description: string;
}

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [newPO, setNewPO] = useState({ supplier: "", items: "", amount: "" });
  const [newTimeLog, setNewTimeLog] = useState({ staff: "", hours: "", task: "" });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [job, setJob] = useState({
    id: id as string,
    jobNumber: "JOB-2024-001",
    title: "Kitchen Extension",
    status: "in_progress",
    priority: "high",
    customer: {
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
      { name: "Timber Joists (4x2)", quantity: 12, unit: "lengths", inStock: true, location: "Unit 1 - A3" },
      { name: "Insulation Rolls", quantity: 8, unit: "rolls", inStock: false }
    ],
    photos: [] as any[]
  });

  useEffect(() => {
    if (id) {
      setJob(prev => ({ ...prev, id: id as string }));
      fetchPurchaseOrders();
      fetchTimeLogs();
    }
  }, [id]);

  async function fetchPurchaseOrders() {
    const jobId = id as string;
    if (!jobId) return;

    const { data, error } = await supabase
      .from("purchase_orders")
      .select("*")
      .eq("job_id", jobId)
      .order("order_date", { ascending: false });

    if (data) {
      setPurchaseOrders(data.map(po => ({
        id: po.id,
        order_number: po.po_number || "PO-" + po.id.substring(0,4),
        supplier: po.supplier || "Unknown",
        items_description: typeof po.items === 'string' ? po.items : JSON.stringify(po.items || ""),
        total_amount: po.total_amount || 0,
        order_date: po.order_date || po.created_at || "",
        status: po.status || "ordered"
      })));
    }
    setLoading(false);
  }

  async function fetchTimeLogs() {
    const jobId = id as string;
    if (!jobId) return;

    const { data, error } = await supabase
      .from("time_logs")
      .select(`
        *,
        profiles!time_logs_user_id_fkey(full_name)
      `)
      .eq("job_id", jobId)
      .order("log_date", { ascending: false });

    if (data) {
      setTimeLogs(data.map(log => {
        // Handle joined profile data safely
        let staffName = "Staff";
        if (log.profiles) {
          // If it's an array, take first item, if object, take it directly
          const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
          staffName = profile?.full_name || "Staff";
        }

        return {
          id: log.id,
          date: log.log_date || log.created_at || "",
          staff_name: staffName,
          hours_worked: log.hours_worked || 0,
          task_description: log.work_description || ""
        };
      }));
    }
  }

  async function addPurchaseOrder() {
    const jobId = id as string;
    if (!jobId || !newPO.supplier || !newPO.items || !newPO.amount) return;

    const { data, error } = await supabase
      .from("purchase_orders")
      .insert({
        job_id: jobId,
        supplier: newPO.supplier,
        items: newPO.items,
        total_amount: parseFloat(newPO.amount),
        status: "ordered",
        po_number: "PO-" + Math.floor(Math.random() * 10000)
      })
      .select()
      .single();

    if (data) {
      const newFormattedPO = {
        id: data.id,
        order_number: data.po_number || "",
        supplier: data.supplier || "",
        items_description: typeof data.items === 'string' ? data.items : "Items",
        total_amount: data.total_amount || 0,
        order_date: data.order_date || data.created_at || "",
        status: data.status || "ordered"
      };
      setPurchaseOrders([newFormattedPO, ...purchaseOrders]);
      setNewPO({ supplier: "", items: "", amount: "" });
    }
  }

  async function addTimeLog() {
    const jobId = id as string;
    if (!jobId || !newTimeLog.staff || !newTimeLog.hours || !newTimeLog.task) return;

    // Get current user to link the log to them
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("time_logs")
      .insert({
        job_id: jobId,
        user_id: user.id,
        hours_worked: parseFloat(newTimeLog.hours),
        work_description: newTimeLog.task,
        log_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (data) {
      const newFormattedLog = {
        id: data.id,
        date: data.log_date || data.created_at || "",
        staff_name: newTimeLog.staff,
        hours_worked: data.hours_worked || 0,
        task_description: data.work_description || ""
      };
      setTimeLogs([newFormattedLog, ...timeLogs]);
      setNewTimeLog({ staff: "", hours: "", task: "" });
    }
  }

  const totalSpent = purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0);
  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours_worked, 0);

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleDeletePhoto = async (photoId: string) => {
    // In a real implementation, this would delete from Supabase Storage
    console.log("Deleting photo:", photoId);
    // Update local state to remove the photo
    if (job) {
      setJob({
        ...job,
        photos: job.photos.filter(p => p.id !== photoId)
      });
    }
  };

  return (
    <DashboardLayout>
      <SEO title={`${job.title} - Job Details`} />
      
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/jobs")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
                <Badge className={
                  job.status === "in_progress" ? "bg-orange-100 text-orange-800 border-orange-200" :
                  job.status === "completed" ? "bg-green-100 text-green-800 border-green-200" :
                  "bg-blue-100 text-blue-800 border-blue-200"
                }>
                  {job.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono">{job.jobNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/jobs/${job.id}/sheet`}>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Job Sheet
              </Button>
            </Link>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Job
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
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
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <h3 className="text-2xl font-bold">£{totalSpent.toLocaleString()}</h3>
                </div>
                <Package className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hours Logged</p>
                  <h3 className="text-2xl font-bold">{totalHours}h</h3>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
                <TabsTrigger value="time">Time Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
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
                      <a href={`mailto:${job.customer.email}`} className="text-sm text-primary hover:underline">
                        {job.customer.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <a href={`tel:${job.customer.phone}`} className="text-sm text-primary hover:underline">
                        {job.customer.phone}
                      </a>
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
                    <CardTitle>Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Start Date</span>
                      <span className="font-medium">{new Date(job.dates.start).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">End Date</span>
                      <span className="font-medium">{new Date(job.dates.end).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated Duration</span>
                      <span className="font-medium">{job.dates.estimated}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="materials">
                <Card>
                  <CardHeader>
                    <CardTitle>Materials Required</CardTitle>
                    <CardDescription>Items needed for this job with stock availability</CardDescription>
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

              <TabsContent value="purchases">
                <Card>
                  <CardHeader>
                    <CardTitle>Purchase Orders</CardTitle>
                    <CardDescription>Track all purchases for this job</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                      <h4 className="font-semibold text-sm">Add New Purchase Order</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <Input 
                          placeholder="Supplier" 
                          value={newPO.supplier}
                          onChange={(e) => setNewPO({...newPO, supplier: e.target.value})}
                        />
                        <Input 
                          placeholder="Items description" 
                          value={newPO.items}
                          onChange={(e) => setNewPO({...newPO, items: e.target.value})}
                        />
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            placeholder="Amount (£)" 
                            value={newPO.amount}
                            onChange={(e) => setNewPO({...newPO, amount: e.target.value})}
                          />
                          <Button onClick={addPurchaseOrder}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseOrders.map((po) => (
                          <TableRow key={po.id}>
                            <TableCell>{new Date(po.order_date).toLocaleDateString('en-GB')}</TableCell>
                            <TableCell className="font-medium">{po.supplier}</TableCell>
                            <TableCell className="text-sm">{po.items_description}</TableCell>
                            <TableCell className="font-semibold">£{po.total_amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{po.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {purchaseOrders.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No purchase orders yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="time">
                <Card>
                  <CardHeader>
                    <CardTitle>Time Logs</CardTitle>
                    <CardDescription>Track hours worked on this job</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                      <h4 className="font-semibold text-sm">Log Time Entry</h4>
                      <div className="grid grid-cols-4 gap-3">
                        <Input 
                          placeholder="Staff name" 
                          value={newTimeLog.staff}
                          onChange={(e) => setNewTimeLog({...newTimeLog, staff: e.target.value})}
                        />
                        <Input 
                          type="number" 
                          placeholder="Hours" 
                          value={newTimeLog.hours}
                          onChange={(e) => setNewTimeLog({...newTimeLog, hours: e.target.value})}
                        />
                        <Input 
                          placeholder="Task description" 
                          value={newTimeLog.task}
                          onChange={(e) => setNewTimeLog({...newTimeLog, task: e.target.value})}
                        />
                        <Button onClick={addTimeLog}>
                          <Plus className="w-4 h-4 mr-2" />
                          Log
                        </Button>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Staff Member</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Task</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timeLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.date).toLocaleDateString('en-GB')}</TableCell>
                            <TableCell className="font-medium">{log.staff_name}</TableCell>
                            <TableCell className="font-semibold">{log.hours_worked}h</TableCell>
                            <TableCell className="text-sm">{log.task_description}</TableCell>
                          </TableRow>
                        ))}
                        {timeLogs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No time logged yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Job Photos</CardTitle>
                      <PhotoUpload jobId={id as string} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {job.photos && job.photos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {job.photos.map((photo, index) => (
                          <div 
                            key={photo.id} 
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handlePhotoClick(index)}
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption || `Job photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {photo.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                                {photo.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No photos uploaded yet. Click "Upload Photos" to add images.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.team.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>Job progress documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUpload jobId={id as string} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {job && job.photos && (
        <PhotoLightbox
          photos={job.photos}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onDelete={handleDeletePhoto}
          canDelete={true}
        />
      )}
    </DashboardLayout>
  );
}