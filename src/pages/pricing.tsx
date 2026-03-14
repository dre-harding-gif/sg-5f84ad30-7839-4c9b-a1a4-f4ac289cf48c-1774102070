import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const pricingData = [
  {
    category: "Extensions & Conversions",
    items: [
      { name: "Single Story Extension (3m x 5m)", range: "£45,000 - £60,000", time: "8-12 weeks", notes: "Depends on roof type (flat vs pitched) and finishes" },
      { name: "Double Story Extension", range: "£75,000 - £100,000+", time: "12-16 weeks", notes: "Requires full planning permission" },
      { name: "Loft Conversion (Dormer)", range: "£40,000 - £55,000", time: "6-8 weeks", notes: "Includes standard stairs and 1 en-suite" },
      { name: "Garage Conversion", range: "£15,000 - £25,000", time: "3-5 weeks", notes: "Standard single garage, basic finish" }
    ]
  },
  {
    category: "Kitchens & Bathrooms",
    items: [
      { name: "Full Kitchen Refit (Labour only)", range: "£3,500 - £6,000", time: "2-3 weeks", notes: "Excludes kitchen units and appliances" },
      { name: "Bathroom Refit (Standard)", range: "£4,500 - £7,000", time: "1-2 weeks", notes: "Includes basic suite and tiling" },
      { name: "Wet Room Conversion", range: "£6,000 - £9,000", time: "2 weeks", notes: "Includes waterproofing and drainage adjustments" }
    ]
  },
  {
    category: "General Labour & Callouts",
    items: [
      { name: "General Builder (Daily Rate)", range: "£250 - £300 / day", time: "1 day", notes: "Standard 8-hour day" },
      { name: "Electrician / Plumber (Daily Rate)", range: "£300 - £350 / day", time: "1 day", notes: "Certified trades" },
      { name: "Emergency Callout", range: "£120 for 1st hour", time: "N/A", notes: "£60 per hour thereafter. Materials extra." }
    ]
  }
];

export default function PricingPage() {
  return (
    <DashboardLayout>
      <SEO title="General Pricing - Harding Homes" />
      
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">General Pricing Guide</h1>
            <p className="text-muted-foreground mt-1">Quick reference for office staff handling customer inquiries.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search prices..." className="pl-9" />
          </div>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Important:</strong> These are estimated guide prices only. Always inform the customer that a formal, fixed quote will be provided after a site survey. Prices listed are ex-VAT unless stated otherwise.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {pricingData.map((category) => (
            <Card key={category.category}>
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="text-xl text-primary">{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Service / Job</TableHead>
                      <TableHead className="w-[25%]">Estimated Cost</TableHead>
                      <TableHead className="w-[15%]">Est. Time</TableHead>
                      <TableHead className="w-[30%]">Notes / Caveats</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-semibold text-orange-600">{item.range}</TableCell>
                        <TableCell>{item.time}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}