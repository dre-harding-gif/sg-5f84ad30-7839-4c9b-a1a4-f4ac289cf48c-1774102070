import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Wrench, AlertTriangle, Plus, Search, Hand } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InventoryItem {
  id: string;
  item_type: string;
  name: string;
  category: string;
  current_quantity: number;
  unit: string;
  location: string;
  reorder_level: number;
  unit_cost: number;
  supplier: string;
  notes: string;
  assigned_to?: string;
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<InventoryItem[]>([]);
  const [tools, setTools] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name");

      if (error) throw error;

      const materialsData = (data || []).filter(item => item.item_type === "material");
      const toolsData = (data || []).filter(item => item.item_type === "tool");

      setMaterials(materialsData as InventoryItem[]);
      setTools(toolsData as InventoryItem[]);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_quantity === 0) return "critical";
    if (item.current_quantity <= item.reorder_level) return "low";
    return "good";
  };

  const filteredMaterials = materials.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTools = tools.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <PermissionGate require="view_inventory">
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
          </div>
        </DashboardLayout>
      </PermissionGate>
    );
  }

  return (
    <PermissionGate require="view_inventory">
      <DashboardLayout>
        <SEO title="Inventory & Stock - Harding Homes" />
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Inventory & Stock</h1>
              <p className="text-muted-foreground mt-1">Manage materials, tool assignments, and reordering.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search inventory..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          <Tabs defaultValue="materials" className="space-y-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="materials" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Package className="w-4 h-4 mr-2" />
                Materials
              </TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Wrench className="w-4 h-4 mr-2" />
                Tools & Equipment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materials">
              <Card>
                <CardHeader>
                  <CardTitle>Stocked Materials</CardTitle>
                  <CardDescription>Track items in the lock-up to prevent duplicate ordering for jobs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>In Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMaterials.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-muted-foreground">{item.location}</TableCell>
                          <TableCell>
                            <span className="font-bold">{item.current_quantity}</span> {item.unit}
                            <span className="text-xs text-muted-foreground ml-1">(Min: {item.reorder_level})</span>
                          </TableCell>
                          <TableCell>
                            {getStockStatus(item) === "good" && <Badge className="bg-green-100 text-green-800">In Stock</Badge>}
                            {getStockStatus(item) === "low" && <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Low Stock</Badge>}
                            {getStockStatus(item) === "critical" && (
                              <Badge variant="destructive" className="flex items-center w-fit gap-1">
                                <AlertTriangle className="w-3 h-3" /> Restock Needed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">Update Qty</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools">
              <Card>
                <CardHeader>
                  <CardTitle>Tools & Asset Register</CardTitle>
                  <CardDescription>Track who has which tools and when they are returned.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tool / Equipment</TableHead>
                        <TableHead>Asset Location</TableHead>
                        <TableHead>Current Location / Assigned</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTools.map((tool) => (
                        <TableRow key={tool.id}>
                          <TableCell className="font-medium">{tool.name}</TableCell>
                          <TableCell className="text-muted-foreground">{tool.location}</TableCell>
                          <TableCell>{tool.assigned_to || "In Stock"}</TableCell>
                          <TableCell>
                            {tool.assigned_to ? (
                              <Badge variant="secondary">Checked Out</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">Available</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!tool.assigned_to ? (
                              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                <Hand className="w-4 h-4 mr-1" /> Assign Tool
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                                Mark Returned
                              </Button>
                            )}
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
      </DashboardLayout>
    </PermissionGate>
  );
}