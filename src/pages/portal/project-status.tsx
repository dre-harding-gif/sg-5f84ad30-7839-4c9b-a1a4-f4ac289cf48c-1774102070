import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { supabase } from "@/integrations/supabase/client";
import { projectUpdateService } from "@/services/projectUpdateService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { ArrowLeft, Calendar, User, Image as ImageIcon, FileText, Wrench } from "lucide-react";

interface ProjectUpdate {
  id: string;
  job_id: string;
  title: string;
  description: string;
  update_type: string;
  created_at: string;
  created_by: string;
  profiles: {
    id: string;
    full_name: string | null;
    role: string | null;
  };
}

interface ProjectPhoto {
  id: string;
  job_id: string;
  photo_url: string;
  caption: string | null;
  category: string | null;
  uploaded_at: string;
  uploaded_by: string;
  profiles: {
    id: string;
    full_name: string | null;
    role: string | null;
  };
}

interface Job {
  id: string;
  job_name: string;
  address: string;
  status: string;
  start_date: string | null;
  completion_date: string | null;
}

export default function ProjectStatus() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("updates");

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

      // Get customer's job
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

      // Get customer's active job
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("customer_id", customerData.id)
        .in("status", ["in_progress", "scheduled", "completed"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (jobError || !jobData) {
        console.error("No job found:", jobError);
        setLoading(false);
        return;
      }

      setJob(jobData);

      // Load project updates
      const { data: updatesData } = await projectUpdateService.getJobUpdates(jobData.id);
      setUpdates(updatesData || []);

      // Load project photos
      const { data: photosData } = await projectUpdateService.getJobPhotos(jobData.id);
      setPhotos(photosData || []);

      setLoading(false);
    } catch (error) {
      console.error("Error loading project status:", error);
      setLoading(false);
    }
  }

  function getUpdateIcon(type: string) {
    switch (type) {
      case "milestone": return "🎯";
      case "progress": return "📊";
      case "note": return "📝";
      case "issue": return "⚠️";
      default: return "📌";
    }
  }

  function getUpdateColor(type: string) {
    switch (type) {
      case "milestone": return "bg-green-100 text-green-800 border-green-200";
      case "progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "note": return "bg-slate-100 text-slate-800 border-slate-200";
      case "issue": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading project status...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Active Project</CardTitle>
            <CardDescription>You don&apos;t have any active construction projects at this time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/portal/dashboard")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push("/portal/dashboard")}
                className="mb-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-slate-900">{job.job_name}</h1>
              <p className="text-slate-600">{job.address}</p>
            </div>
            <Badge variant={job.status === "completed" ? "default" : "secondary"} className="text-sm px-3 py-1">
              {job.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="updates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Updates ({updates.length})
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photos ({photos.length})
            </TabsTrigger>
          </TabsList>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4">
            {updates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Updates Yet</h3>
                  <p className="text-slate-600">Your project updates will appear here as work progresses.</p>
                </CardContent>
              </Card>
            ) : (
              updates.map((update) => (
                <Card key={update.id} className="overflow-hidden">
                  <CardHeader className={`${getUpdateColor(update.update_type)} border-b`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getUpdateIcon(update.update_type)}</span>
                        <div>
                          <CardTitle className="text-lg">{update.title}</CardTitle>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{update.profiles?.full_name || "Staff"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(update.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {update.update_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-slate-700 whitespace-pre-wrap">{update.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            {photos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Photos Yet</h3>
                  <p className="text-slate-600">Project photos will be added here as work progresses.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <Card key={photo.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedPhoto(index)}>
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
                      <p className="text-xs text-slate-500">
                        {new Date(photo.uploaded_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedPhoto !== null && (
              <PhotoLightbox
                photos={photos.map(p => ({ url: p.photo_url, caption: p.caption || undefined }))}
                initialIndex={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Maintenance Request CTA */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-slate-50 border-blue-200">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Need Assistance?</h3>
                <p className="text-sm text-slate-600">Submit a maintenance request or ask a question</p>
              </div>
            </div>
            <Button onClick={() => router.push("/portal/maintenance")}>
              Submit Request
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}