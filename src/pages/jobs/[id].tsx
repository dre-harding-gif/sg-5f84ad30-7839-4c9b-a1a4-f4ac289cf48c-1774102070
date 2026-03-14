import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Calendar, Users, Clock, FileText, Image, 
  ShoppingCart, CheckCircle, ExternalLink, Phone, Mail,
  Download, Upload, Edit, Trash2
} from "lucide-react";
import Link from "next/link";

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // Mock job data - replace with API call
  const job = {
    id: "1",
    jobNumber: "JOB-2024-001",
    customerId: "1",
    customer: {
      name: "Sarah Mitchell",
      email: "sarah.mitchell@email.com",
      phone: "07123 456789",
    },
    title: "Kitchen Extension - Mitchell Residence",
    description: "Complete kitchen extension with bi-fold doors, new flooring, and modern fixtures",
    address: "45 Oak Avenue, Manchester",
    postcode: "M20 2RQ",
    status: "in-progress",
    priority: "high",
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-04-15"),
    estimatedHours: 120,
    actualHours: 65,
    assignedTeam: [
      { id: "1", name: "John Smith", role: "Lead Builder" },
      { id: "2", name: "Mike Johnson", role: "Electrician" },
    ],
    materials: [
      { id: "1", name: "Bi-fold doors (3m)", quantity: 1, unit: "set", supplier: "Window World" },
      { id: "2", name: "Floor tiles", quantity: 25, unit: "sqm", supplier: "Tile Direct" },
      { id: "3", name: "Kitchen units", quantity: 12, unit: "units", supplier: "IKEA" },
    ],
    purchaseOrders: [
      {
        id: "1",
        poNumber: "PO-2024-045",
        supplier: "Window World",
        totalAmount: 2500,
        dateOrdered: new Date("2026-02-20"),
        status: "received",
      },
      {
        id: "2",
        poNumber: "PO-2024-046",
        supplier: "Tile Direct",
        totalAmount: 850,
        dateOrdered: new Date("2026-02-25"),
        status: "received",
      },
    ],
    documents: [
      { id: "1", name: "Building Plans.pdf", type: "plan", uploadedAt: new Date("2026-02-15") },
      { id: "2", name: "Electrical Spec.pdf", type: "specification", uploadedAt: new Date("2026-02-18") },
    ],
    photos: [
      { id: "1", url: "/placeholder.jpg", caption: "Before work started", stage: "before" },
      { id: "2", url: "/placeholder.jpg", caption: "Foundation work", stage: "during" },
    ],
    warranty: {
      years: 10,
      documents: ["warranty-cert.pdf"],
    },
  };

  const statusColors: Record<string, string> = {
    lead: "bg-yellow-100 text-yellow-800",
    quoted: "bg-blue-100 text-blue-800",
    scheduled: "bg-purple-100 text-purple-800",
    "in-progress": "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    "on-hold": "bg-gray-100 text-gray-800",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const handleOpenMaps = () => {
    const address = encodeURIComponent(job.address);
    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try Apple Maps first on iOS, then Google Maps
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isIOS) {
        window.location.href = `maps://maps.apple.com/?q=${address}`;
      } else {
        window.location.href = `geo:0,0?q=${address}`;
      }
    } else {
      // Desktop - open Google Maps
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-heading font-bold text-foreground">{job.title}</h1>
                <Badge className={statusColors[job.status]}>
                  {job.status.replace("-", " ")}
                </Badge>
                <Badge variant="outline" className={priorityColors[job.priority]}>
                  {job.priority}
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono">#{job.jobNumber}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/jobs/${id}/sheet`}>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Job Sheet
                </Button>
              </Link>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Job
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold mb-2">{job.customer.name}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${job.customer.email}`} className="hover:text-primary">
                    {job.customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${job.customer.phone}`} className="hover:text-primary">
                    {job.customer.phone}
                  </a>
                </div>
              </div>
              <Link href={`/customers/${job.customerId}`}>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 mb-4">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{job.address}</p>
                  <p className="text-sm text-muted-foreground">{job.postcode}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleOpenMaps}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Maps
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{job.startDate.toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Estimated Completion</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{job.endDate.toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Hours Progress</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{job.actualHours} / {job.estimatedHours} hours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="purchases">Purchase Orders</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{job.description}</p>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Progress</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Completion</span>
                      <span className="font-medium">{Math.round((job.actualHours / job.estimatedHours) * 100)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${(job.actualHours / job.estimatedHours) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {job.warranty && (
                  <div>
                    <h3 className="font-semibold mb-2">Warranty</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.warranty.years} year warranty included
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Assigned Team</CardTitle>
                  <Button size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Assign Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.assignedTeam.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Materials List</CardTitle>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {job.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{material.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.quantity} {material.unit} {material.supplier && `• ${material.supplier}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Purchase Orders</CardTitle>
                  <Button size="sm">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    New PO
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.purchaseOrders.map((po) => (
                    <div key={po.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{po.poNumber}</p>
                          <p className="text-sm text-muted-foreground">{po.supplier}</p>
                        </div>
                        <Badge variant={po.status === "received" ? "default" : "secondary"}>
                          {po.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Ordered: {po.dateOrdered.toLocaleDateString("en-GB")}
                        </span>
                        <span className="font-semibold">£{po.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Documents</CardTitle>
                  <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {job.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {doc.uploadedAt.toLocaleDateString("en-GB")}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Job Photos</CardTitle>
                  <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {job.photos.map((photo) => (
                    <div key={photo.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium">{photo.caption}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {photo.stage}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}