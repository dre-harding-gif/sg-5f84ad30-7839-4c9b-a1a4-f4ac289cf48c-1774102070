import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PermissionGate } from "@/components/PermissionGate";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PricingItem {
  id: string;
  category: string;
  service_name: string;
  price_min: number;
  price_max: number;
  unit: string;
  estimated_time: string;
  notes: string;
}

export default function PricingPage() {
  const [pricingData, setPricingData] = useState<Record<string, PricingItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPricingData();
  }, []);

  async function fetchPricingData() {
    try {
      const { data, error } = await supabase
        .from("pricing_guide")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // Group by category
      const grouped = (data || []).reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, PricingItem[]>);

      setPricingData(grouped);
    } catch (error) {
      console.error("Error fetching pricing data:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredData = Object.entries(pricingData).reduce((acc, [category, items]) => {
    const filtered = items.filter(item =>
      item.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, PricingItem[]>);

  const formatPrice = (min: number, max: number) => {
    if (min === max) {
      return `£${min.toLocaleString()}`;
    }
    return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
  };

  return (
    <PermissionGate require="view_pricing">
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
              <Input 
                type="search" 
                placeholder="Search prices..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Important:</strong> These are estimated guide prices only. Always inform the customer that a formal, fixed quote will be provided after a site survey. Prices listed are ex-VAT unless stated otherwise.
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(filteredData).map(([category, items]) => (
                <Card key={category}>
                  <CardHeader className="bg-gray-50/50 border-b">
                    <CardTitle className="text-xl text-primary">{category}</CardTitle>
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
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.service_name}</TableCell>
                            <TableCell className="font-semibold text-orange-600">
                              {formatPrice(item.price_min, item.price_max)} {item.unit}
                            </TableCell>
                            <TableCell>{item.estimated_time}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </PermissionGate>
  );
}