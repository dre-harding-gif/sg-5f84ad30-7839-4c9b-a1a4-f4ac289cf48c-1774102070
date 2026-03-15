import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MapLauncher } from "@/components/MapLauncher";

export default function MyWeekPage() {
  // Mock data - will be replaced with real data filtered by assigned team member
  const weekSchedule = [
    {
      date: "Monday, 15 Jan",
      jobs: [
        {
          id: "1",
          time: "08:00 - 17:00",
          customer: "Mrs. Johnson",
          address: "45 Oak Avenue, Reading, RG1 3BD",
          type: "Kitchen Extension",
          status: "in_progress",
          materialsNeeded: ["Plasterboard (12x sheets)", "Cement (3x bags)", "Insulation"],
          notes: "Customer working from home - park in driveway"
        }
      ]
    },
    {
      date: "Tuesday, 16 Jan",
      jobs: [
        {
          id: "2",
          time: "08:00 - 12:00",
          customer: "Mr. Patel",
          address: "12 Victoria Road, Henley, RG9 1HE",
          type: "Bathroom Refit",
          status: "scheduled",
          materialsNeeded: ["Tile Adhesive", "Grout (White)", "Silicone Sealant"],
          notes: "Access code: 4521 - customer at work"
        },
        {
          id: "3",
          time: "13:00 - 17:00",
          customer: "The Smiths",
          address: "89 High Street, Caversham, RG4 8DN",
          type: "Loft Conversion - First Fix",
          status: "scheduled",
          materialsNeeded: ["Timber (4x2)", "Screws", "Cable (Twin & Earth)"],
          notes: "Scaffolding already in place"
        }
      ]
    },
    {
      date: "Wednesday, 17 Jan",
      jobs: [
        {
          id: "4",
          time: "08:00 - 17:00",
          customer: "Mrs. Thompson",
          address: "67 Park Lane, Woodley, RG5 4QT",
          type: "Side Extension",
          status: "scheduled",
          materialsNeeded: ["Bricks (500x)", "Sand", "Cement", "Lintels (2x)"],
          notes: "Concrete pour scheduled for 9am - mixer arriving"
        }
      ]
    },
    {
      date: "Thursday, 18 Jan",
      jobs: [
        {
          id: "1",
          time: "08:00 - 17:00",
          customer: "Mrs. Johnson",
          address: "45 Oak Avenue, Reading, RG1 3BD",
          type: "Kitchen Extension - Continue",
          status: "scheduled",
          materialsNeeded: ["Copper Pipe", "Radiator Valves", "Floor Levelling Compound"],
          notes: "Plumber joining on site at 10am"
        }
      ]
    },
    {
      date: "Friday, 19 Jan",
      jobs: [
        {
          id: "5",
          time: "08:00 - 14:00",
          customer: "Mr. Davies",
          address: "23 Church Road, Earley, RG6 7EY",
          type: "Garage Conversion",
          status: "scheduled",
          materialsNeeded: ["Plasterboard", "Insulation", "Vapour Barrier"],
          notes: "Final inspection - keep site tidy"
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-gray-100 text-gray-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <SEO 
        title="My Week - Job Schedule"
        description="Your weekly job schedule and daily assignments"
      />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Week</h1>
          <p className="text-gray-600 mt-2">Your jobs for the week of 15th - 19th January 2026</p>
        </div>

        <div className="space-y-6">
          {weekSchedule.map((day) => (
            <Card key={day.date}>
              <CardHeader className="bg-blue-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-900" />
                    {day.date}
                  </CardTitle>
                  <Badge variant="outline">{day.jobs.length} {day.jobs.length === 1 ? "Job" : "Jobs"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {day.jobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.replace("_", " ")}
                          </Badge>
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.time}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.type}</h3>
                          <p className="text-sm text-gray-600">{job.customer}</p>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{job.address}</span>
                        </div>
                        <MapLauncher address={job.address} variant="outline" size="sm" />
                      </div>
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>

                    {job.materialsNeeded.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 mt-0.5 text-amber-700 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 mb-1">Materials Needed:</p>
                            <ul className="text-sm text-amber-800 space-y-0.5">
                              {job.materialsNeeded.map((material, idx) => (
                                <li key={idx}>• {material}</li>
                              ))}
                            </ul>
                            <Link href="/inventory">
                              <Button variant="link" className="h-auto p-0 mt-2 text-amber-900 hover:text-amber-700">
                                Check Stock Availability →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {job.notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                          <span className="font-medium">Note:</span> {job.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}