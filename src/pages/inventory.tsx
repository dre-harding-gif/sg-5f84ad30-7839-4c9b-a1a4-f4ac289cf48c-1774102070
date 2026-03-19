import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Wrench, AlertTriangle, Plus, Search, Hand, TrendingDown, BarChart3 } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

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
  condition?: string;
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

  const { toast } = useToast();

  async function handleConditionChange(toolId: string, newCondition: string) {
    try {
      const { error } = await supabase
        .from("inventory_items")
        .update({ condition: newCondition })
        .eq("id", toolId);

      if (error) throw error;

      // Update local state
      setTools(prev => prev.map(tool => 
        tool.id === toolId ? { ...tool, condition: newCondition } : tool
      ));

      toast({
        title: "Condition Updated",
        description: "Tool condition has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating condition:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update tool condition. Please try again.",
        variant: "destructive",
      });
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_quantity === 0) return "critical";
    if (item.current_quantity <= item.reorder_level) return "low";
    return "good";
  };

  const getConditionBadge = (condition?: string) => {
    if (!condition) condition = "good";
    
    const config = {
      excellent: { label: "Excellent", className: "bg-green-100 text-green-800 border-green-300" },
      good: { label: "Good", className: "bg-green-100 text-green-800 border-green-300" },
      fair: { label: "Fair", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      poor: { label: "Poor", className: "bg-orange-100 text-orange-800 border-orange-300" },
      needs_repair: { label: "Needs Repair", className: "bg-red-100 text-red-800 border-red-300" }
    };

    const { label, className } = config[condition as keyof typeof config] || config.good;
    
    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    );
  };

  const filteredMaterials = materials.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTools = tools.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analytics data
  const stockValueByCategory = materials.reduce((acc, item) => {
    const existing = acc.find(x => x.name === item.category);
    const value = item.current_quantity * item.unit_cost;
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: item.category, value });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const lowStockItems = materials.filter(item => 
    item.current_quantity <= item.reorder_level && item.current_quantity > 0
  ).length;

  const outOfStockItems = materials.filter(item => item.current_quantity === 0).length;

  const toolsInUse = tools.filter(item => item.assigned_to).length;

  const topValueMaterials = materials
    .map(item => ({
      name: item.name,
      value: item.current_quantity * item.unit_cost
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

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

          {/* Analytics Dashboard */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Stock Value</CardDescription>
                <CardTitle className="text-3xl">
                  £{stockValueByCategory.reduce((sum, cat) => sum + cat.value, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Across {materials.length} materials</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Low Stock Items</CardDescription>
                <CardTitle className="text-3xl text-orange-600">{lowStockItems}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Need reordering soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Out of Stock</CardDescription>
                <CardTitle className="text-3xl text-red-600">{outOfStockItems}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Critical restock needed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tools In Use</CardDescription>
                <CardTitle className="text-3xl">{toolsInUse}/{tools.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Currently checked out</p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Stock Value by Category
                </CardTitle>
                <CardDescription>Total value of materials in each category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stockValueByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `£${Number(value).toFixed(0)}`} />
                    <Bar dataKey="value" fill="#1e3a8a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Top 5 Materials by Value
                </CardTitle>
                <CardDescription>Highest value inventory items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topValueMaterials.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm font-bold text-blue-900">£{item.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                        <TableHead>Condition Report</TableHead>
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
                          <TableCell>
                            <Select
                              value={tool.condition || "good"}
                              onValueChange={(value) => handleConditionChange(tool.id, value)}
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue>
                                  {getConditionBadge(tool.condition)}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excellent">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Excellent
                                  </div>
                                </SelectItem>
                                <SelectItem value="good">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Good
                                  </div>
                                </SelectItem>
                                <SelectItem value="fair">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    Fair
                                  </div>
                                </SelectItem>
                                <SelectItem value="poor">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    Poor
                                  </div>
                                </SelectItem>
                                <SelectItem value="needs_repair">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    Needs Repair
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
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