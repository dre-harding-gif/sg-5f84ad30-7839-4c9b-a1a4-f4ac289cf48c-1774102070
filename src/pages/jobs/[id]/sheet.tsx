import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer, MapPin, Calendar, Users, Phone, Mail } from "lucide-react";

export default function JobSheetPage() {
  const router = useRouter();
  const { id } = router.query;

  // Mock job data
  const job = {
    jobNumber: "JOB-2024-001",
    customer: {
      name: "Sarah Mitchell",
      email: "sarah.mitchell@email.com",
      phone: "07123 456789",
    },
    title: "Kitchen Extension - Mitchell Residence",
    description: "Complete kitchen extension with bi-fold doors, new flooring, and modern fixtures",
    address: "45 Oak Avenue, Manchester",
    postcode: "M20 2RQ",
    startDate: new Date("2026-03-01"),
    assignedTeam: [
      { name: "John Smith", role: "Lead Builder" },
      { name: "Mike Johnson", role: "Electrician" },
    ],
    materials: [
      { name: "Bi-fold doors (3m)", quantity: 1, unit: "set", supplier: "Window World" },
      { name: "Floor tiles", quantity: 25, unit: "sqm", supplier: "Tile Direct" },
      { name: "Kitchen units", quantity: 12, unit: "units", supplier: "IKEA" },
    ],
    specifications: [
      "Install 3m bi-fold door system",
      "Lay 25sqm of porcelain floor tiles",
      "Fit 12 kitchen units with worktops",
      "Install electrical outlets (8 sockets)",
      "Plumbing for sink and dishwasher",
    ],
    safetyNotes: [
      "Wear PPE at all times",
      "Ensure proper ventilation during adhesive work",
      "Turn off electricity before electrical work",
    ],
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <h1 className="text-2xl font-heading font-bold">Job Sheet</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8">
            {/* Header */}
            <div className="mb-8 pb-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold mb-1">Harding Homes Ltd</h2>
                  <p className="text-sm text-muted-foreground">Professional Building Services</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Job Number</p>
                  <p className="text-xl font-bold font-mono">#{job.jobNumber}</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold">{job.title}</h3>
            </div>

            {/* Customer & Location */}
            <div className="grid grid-cols-2 gap-6 mb-8 pb-6 border-b">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Customer Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{job.customer.name}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {job.customer.phone}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {job.customer.email}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Job Location
                </h4>
                <div className="space-y-1 text-sm">
                  <p>{job.address}</p>
                  <p className="font-medium">{job.postcode}</p>
                  <p className="flex items-center gap-2 text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3" />
                    Start: {job.startDate.toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Team */}
            <div className="mb-8 pb-6 border-b">
              <h4 className="font-semibold mb-3">Assigned Team</h4>
              <div className="space-y-2">
                {job.assignedTeam.map((member, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-8 pb-6 border-b">
              <h4 className="font-semibold mb-3">Job Description</h4>
              <p className="text-sm text-muted-foreground">{job.description}</p>
            </div>

            {/* Materials Required */}
            <div className="mb-8 pb-6 border-b">
              <h4 className="font-semibold mb-3">Materials Required</h4>
              <div className="space-y-2">
                {job.materials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{material.name}</p>
                      {material.supplier && (
                        <p className="text-xs text-muted-foreground">Supplier: {material.supplier}</p>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {material.quantity} {material.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Specifications */}
            <div className="mb-8 pb-6 border-b">
              <h4 className="font-semibold mb-3">Work Specifications</h4>
              <ul className="space-y-2">
                {job.specifications.map((spec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-semibold mt-0.5">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety Notes */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3 text-orange-600">Health & Safety</h4>
              <ul className="space-y-2">
                {job.safetyNotes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-600 font-semibold mt-0.5">⚠</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sign-off Section */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-4">Team Leader Signature</p>
                <div className="border-b border-gray-300 pb-1"></div>
                <p className="text-xs text-muted-foreground mt-2">Date: __________</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-4">Customer Signature</p>
                <div className="border-b border-gray-300 pb-1"></div>
                <p className="text-xs text-muted-foreground mt-2">Date: __________</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}