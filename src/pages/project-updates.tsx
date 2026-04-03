import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { projectUpdateService } from "@/services/projectUpdateService";
import { maintenanceRequestService } from "@/services/maintenanceRequestService";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, FileText, MessageSquare, Wrench, Plus, Send, Trash2, Eye, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";

interface Job {
  id: string;
  job_name: string;
  address: string;
  status: string;
  customer_id: string;
}

interface ProjectUpdate {
  id: string;
  job_id: string;
  title: string;
  description: string;
  update_type: string;
  created_at: string;
  created_by: string;
  jobs: Job;
  profiles: {
    full_name: string | null;
  };
}

interface ProjectPhoto {
  id: string;
  job_id: string;
  photo_url: string;
  caption: string | null;
  category: string | null;
  uploaded_at: string;
  jobs: Job;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  customer_id: string;
  job_id: string;
  staff_notes: string | null;
  jobs: Job;
  customers: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function ProjectUpdates() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("updates");
  const [userId, setUserId] = useState<string | null>(null);
  
  // Jobs list
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  
  // Updates
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    job_id: "",
    title: "",
    description: "",
    update_type: "progress"
  });
  
  // Photos
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [photoForm, setPhotoForm] = useState({
    job_id: "",
    caption: "",
    category: ""
  });
  
  // Maintenance Requests
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [staffNotes, setStaffNotes] = useState("");
  const [requestStatus, setRequestStatus] = useState("");

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadJobData(selectedJobId);
    }
  }, [selectedJobId]);

  async function checkAuthAndLoadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/staff-login");
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", session.user.id)
        .single();

      if (!profile || !["owner", "office_manager", "site_manager", "builder"].includes(profile.role)) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page",
          variant: "destructive"
        });
        router.push("/");
        return;
      }

      setUserId(profile.id);

      // Load jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, job_name, address, status, customer_id")
        .in("status", ["in_progress", "scheduled", "completed"])
        .order("created_at", { ascending: false });

      setJobs(jobsData || []);

      // Load all maintenance requests
      const { data: requestsData } = await maintenanceRequestService.getAllRequests();
      setRequests(requestsData || []);

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  }

  async function loadJobData(jobId: string) {
    try {
      // Load updates for this job
      const { data: updatesData } = await projectUpdateService.getJobUpdates(jobId);
      setUpdates(updatesData || []);

      // Load photos for this job
      const { data: photosData } = await projectUpdateService.getJobPhotos(jobId);
      setPhotos(photosData || []);
    } catch (error) {
      console.error("Error loading job data:", error);
    }
  }

  async function handleCreateUpdate(e: React.FormEvent) {
    e.preventDefault();
    
    if (!userId || !updateForm.job_id) {
      toast({
        title: "Error",
        description: "Please select a job",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await projectUpdateService.createUpdate({
        job_id: updateForm.job_id,
        title: updateForm.title,
        description: updateForm.description,
        update_type: updateForm.update_type,
        created_by: userId
      });

      if (error) throw error;

      toast({
        title: "Update Posted",
        description: "Project update has been published to the customer portal",
      });

      setUpdateForm({ job_id: "", title: "", description: "", update_type: "progress" });
      setShowUpdateForm(false);
      
      if (selectedJobId) {
        loadJobData(selectedJobId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post update",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePhotoUpload(photoUrls: string[]) {
    if (!userId || !photoForm.job_id) {
      toast({
        title: "Error",
        description: "Please select a job",
        variant: "destructive"
      });
      return;
    }

    try {
      for (const url of photoUrls) {
        await projectUpdateService.uploadPhoto({
          job_id: photoForm.job_id,
          photo_url: url,
          caption: photoForm.caption || null,
          category: photoForm.category || null,
          uploaded_by: userId
        });
      }

      toast({
        title: "Photos Uploaded",
        description: `${photoUrls.length} photo(s) added to project`,
      });

      setPhotoForm({ job_id: "", caption: "", category: "" });
      setShowPhotoUpload(false);
      
      if (selectedJobId) {
        loadJobData(selectedJobId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload photos",
        variant: "destructive"
      });
    }
  }

  async function handleUpdateRequest(requestId: string) {
    setSubmitting(true);

    try {
      const updates: any = {};
      if (staffNotes) updates.staff_notes = staffNotes;
      if (requestStatus) updates.status = requestStatus;

      const { error } = await maintenanceRequestService.updateRequest(requestId, updates);

      if (error) throw error;

      toast({
        title: "Request Updated",
        description: "Maintenance request has been updated",
      });

      setSelectedRequest(null);
      setStaffNotes("");
      setRequestStatus("");

      // Reload requests
      const { data: requestsData } = await maintenanceRequestService.getAllRequests();
      setRequests(requestsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUpdate(id: string) {
    if (!confirm("Are you sure you want to delete this update?")) return;

    try {
      const { error } = await projectUpdateService.deleteUpdate(id);
      if (error) throw error;

      toast({ title: "Update Deleted" });
      
      if (selectedJobId) {
        loadJobData(selectedJobId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function handleDeletePhoto(id: string) {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const { error } = await projectUpdateService.deletePhoto(id);
      if (error) throw error;

      toast({ title: "Photo Deleted" });
      
      if (selectedJobId) {
        loadJobData(selectedJobId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
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
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Project Updates & Photos</h1>
          <p className="text-slate-600 mt-1">Manage customer-facing project updates and maintenance requests</p>
        </div>

        {/* Job Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
            <CardDescription>Choose a job to view or add updates and photos</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.job_name} - {job.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="updates">
              <FileText className="h-4 w-4 mr-2" />
              Updates ({updates.length})
            </TabsTrigger>
            <TabsTrigger value="photos">
              <Camera className="h-4 w-4 mr-2" />
              Photos ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              <Wrench className="h-4 w-4 mr-2" />
              Requests ({requests.filter(r => r.status === "pending").length})
            </TabsTrigger>
          </TabsList>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Updates</h2>
              <Button onClick={() => setShowUpdateForm(true)} disabled={!selectedJobId}>
                <Plus className="h-4 w-4 mr-2" />
                Post Update
              </Button>
            </div>

            {showUpdateForm && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>Post New Update</CardTitle>
                  <CardDescription>Share progress with the customer</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="update-job">Project</Label>
                      <Select 
                        value={updateForm.job_id} 
                        onValueChange={(value) => setUpdateForm({ ...updateForm, job_id: value })}
                      >
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
                      <Label htmlFor="update-type">Update Type</Label>
                      <Select 
                        value={updateForm.update_type} 
                        onValueChange={(value) => setUpdateForm({ ...updateForm, update_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="milestone">🎯 Milestone</SelectItem>
                          <SelectItem value="progress">📊 Progress</SelectItem>
                          <SelectItem value="note">📝 Note</SelectItem>
                          <SelectItem value="issue">⚠️ Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="update-title">Title</Label>
                      <Input
                        id="update-title"
                        value={updateForm.title}
                        onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                        placeholder="e.g., Foundation complete"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="update-description">Description</Label>
                      <Textarea
                        id="update-description"
                        value={updateForm.description}
                        onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                        placeholder="Provide details about this update..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Posting..." : "Post Update"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowUpdateForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {!selectedJobId ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Select a project above to view and manage updates
                </CardContent>
              </Card>
            ) : updates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No updates posted yet for this project
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <Card key={update.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{update.title}</CardTitle>
                          <CardDescription>
                            Posted by {update.profiles?.full_name || "Staff"} on {new Date(update.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="capitalize">
                            {update.update_type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUpdate(update.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 whitespace-pre-wrap">{update.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Photos</h2>
              <Button onClick={() => setShowPhotoUpload(true)} disabled={!selectedJobId}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>
            </div>

            {showPhotoUpload && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>Upload Project Photos</CardTitle>
                  <CardDescription>Add photos that customers can view in their portal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="photo-job">Project</Label>
                    <Select 
                      value={photoForm.job_id} 
                      onValueChange={(value) => setPhotoForm({ ...photoForm, job_id: value })}
                    >
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
                    <Label htmlFor="photo-category">Category (optional)</Label>
                    <Input
                      id="photo-category"
                      value={photoForm.category}
                      onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                      placeholder="e.g., Foundation, Framing, Finish"
                    />
                  </div>

                  <div>
                    <Label htmlFor="photo-caption">Caption (optional)</Label>
                    <Textarea
                      id="photo-caption"
                      value={photoForm.caption}
                      onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                      placeholder="Add a description for these photos..."
                      rows={3}
                    />
                  </div>

                  <PhotoUpload
                    onUploadComplete={handlePhotoUpload}
                    maxFiles={10}
                  />

                  <Button variant="outline" onClick={() => setShowPhotoUpload(false)} className="w-full">
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            )}

            {!selectedJobId ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Select a project above to view and manage photos
                </CardContent>
              </Card>
            ) : photos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No photos uploaded yet for this project
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <div className="relative aspect-video bg-slate-100">
                      <Image
                        src={photo.photo_url}
                        alt={photo.caption || "Project photo"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      {photo.caption && (
                        <p className="text-sm text-slate-700 mb-2">{photo.caption}</p>
                      )}
                      {photo.category && (
                        <Badge variant="secondary" className="text-xs mb-2">
                          {photo.category}
                        </Badge>
                      )}
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">
                          {new Date(photo.uploaded_at).toLocaleDateString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePhoto(photo.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Maintenance Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Customer Maintenance Requests</h2>
              
              {requests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No maintenance requests
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{request.title}</CardTitle>
                            <CardDescription>
                              {request.jobs?.job_name} - {request.customers?.name}
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
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Customer Request:</p>
                          <p className="text-slate-600 whitespace-pre-wrap">{request.description}</p>
                        </div>
                        
                        {request.staff_notes && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900 mb-1">Staff Notes:</p>
                            <p className="text-blue-700 text-sm whitespace-pre-wrap">{request.staff_notes}</p>
                          </div>
                        )}

                        <div className="flex gap-2 text-xs text-slate-500">
                          <span>📧 {request.customers?.email}</span>
                          {request.customers?.phone && <span>📞 {request.customers.phone}</span>}
                          <span>📅 {new Date(request.created_at).toLocaleDateString()}</span>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setStaffNotes(request.staff_notes || "");
                                setRequestStatus(request.status);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Respond to Maintenance Request</DialogTitle>
                              <DialogDescription>
                                Update the status and add staff notes
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="request-status">Status</Label>
                                <Select value={requestStatus} onValueChange={setRequestStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending Review</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="staff-notes">Staff Notes</Label>
                                <Textarea
                                  id="staff-notes"
                                  value={staffNotes}
                                  onChange={(e) => setStaffNotes(e.target.value)}
                                  placeholder="Add internal notes about this request..."
                                  rows={4}
                                />
                              </div>

                              <Button 
                                onClick={() => selectedRequest && handleUpdateRequest(selectedRequest.id)}
                                disabled={submitting}
                                className="w-full"
                              >
                                {submitting ? "Updating..." : "Update Request"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}