import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MessageSquare, FileText, Image as ImageIcon, MapPin, Calendar, Clock, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function PortalDashboard() {
  const router = useRouter();

  // Mock customer project data
  const project = {
    title: "Kitchen Extension",
    jobNumber: "JOB-2024-001",
    status: "in-progress",
    progress: 65,
    address: "45 Oak Avenue, Manchester, M20 2RQ",
    startDate: "2026-03-01",
    estCompletion: "2026-04-15",
    manager: "John Smith",
    updates: [
      { date: "2026-03-14", message: "First fix electrical completed. Plastering to begin tomorrow." },
      { date: "2026-03-10", message: "Bi-fold doors delivered and installed successfully." },
      { date: "2026-03-05", message: "Foundations laid and signed off by building control." },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Harding Homes</h1>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 hidden sm:inline-flex">
              Customer Portal
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90 hidden sm:block">Welcome, Sarah Mitchell</span>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => router.push("/portal/login")}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Project Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{project.jobNumber}</span>
              <Badge className="bg-orange-100 text-orange-800 border-0">In Progress</Badge>
            </div>
            <h2 className="text-3xl font-bold">{project.title}</h2>
          </div>
          <Button className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Message Team
          </Button>
        </div>

        <Card className="border-primary/20 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="font-semibold text-lg">Overall Progress</span>
                <span className="text-2xl font-bold text-primary">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Est. Completion</p>
                  <p className="font-medium">{new Date(project.estCompletion).toLocaleDateString("en-GB")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Site Address</p>
                  <p className="font-medium text-sm">{project.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Project Manager</p>
                  <p className="font-medium">{project.manager}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Updates */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {project.updates.map((update, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <time className="text-sm font-medium text-primary">
                            {new Date(update.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
                          </time>
                        </div>
                        <p className="text-sm text-muted-foreground">{update.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents & Resources */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="#" className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors">
                  <FileText className="w-8 h-8 text-blue-500 mr-3 opacity-80" />
                  <div>
                    <p className="font-medium text-sm">Building Quote & Specs</p>
                    <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                  </div>
                </a>
                <a href="#" className="flex items-center p-3 border rounded-lg hover:bg-muted transition-colors">
                  <FileText className="w-8 h-8 text-red-500 mr-3 opacity-80" />
                  <div>
                    <p className="font-medium text-sm">Floor Plans</p>
                    <p className="text-xs text-muted-foreground">PDF • 5.1 MB</p>
                  </div>
                </a>
                <div className="p-4 bg-muted/50 rounded-lg border border-dashed text-center">
                  <p className="text-sm text-muted-foreground mb-2">Guarantees & Warranties will appear here upon completion.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-square bg-muted rounded-md border flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">View</span>
                    </div>
                  </div>
                  <div className="aspect-square bg-muted rounded-md border flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">View</span>
                    </div>
                  </div>
                  <div className="aspect-square bg-muted rounded-md border flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">View</span>
                    </div>
                  </div>
                  <div className="aspect-square bg-muted rounded-md border flex items-center justify-center bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
                    <span className="text-sm font-medium">+5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}