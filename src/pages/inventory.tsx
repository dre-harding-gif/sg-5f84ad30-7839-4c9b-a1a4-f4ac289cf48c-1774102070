import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Wrench, AlertTriangle, Plus, Search, Hand } from "lucide-react";

export default function InventoryPage() {
  // Mock Data
  const materials = [
    { id: "M01", name: "Cement (25kg bags)", location: "Unit 1 - A2", inStock: 45, reorderLevel: 20, status: "Good" },
    { id: "M02", name: "Plasterboard (12.5mm)", location: "Unit 1 - B1", inStock: 8, reorderLevel: 15, status: "Low" },
    { id: "M03", name: "Copper Pipe (15mm x 3m)", location: "Unit 2 - Rack 3", inStock: 50, reorderLevel: 10, status: "Good" },
    { id: "M04", name: "Tile Adhesive (20kg)", location: "Unit 1 - A4", inStock: 2, reorderLevel: 10, status: "Critical" },
  ];

  const tools = [
    { id: "T01", name: "Makita SDS Drill", assetNo: "HH-T-001", assignedTo: "Unit 1 (Stock)", status: "Available" },
    { id: "T02", name: "DeWalt Combi Drill", assetNo: "HH-T-005", assignedTo: "John Smith (Job: Mitchell)", status: "In Use" },
    { id: "T03", name: "Laser Level", assetNo: "HH-T-012", assignedTo: "Mike Johnson", status: "In Use" },
    { id: "T04", name: "Tile Cutter (Large)", assetNo: "HH-T-020", assignedTo: "Unit 1 (Stock)", status: "Available" },
  ];

  return (
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
              <Input type="search" placeholder="Search inventory..." className="pl-9" />
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
                    {materials.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.location}</TableCell>
                        <TableCell>
                          <span className="font-bold">{item.inStock}</span> 
                          <span className="text-xs text-muted-foreground ml-1">(Min: {item.reorderLevel})</span>
                        </TableCell>
                        <TableCell>
                          {item.status === "Good" && <Badge className="bg-green-100 text-green-800">In Stock</Badge>}
                          {item.status === "Low" && <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Low Stock</Badge>}
                          {item.status === "Critical" && (
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
                      <TableHead>Asset No.</TableHead>
                      <TableHead>Current Location / Assigned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tools.map((tool) => (
                      <TableRow key={tool.id}>
                        <TableCell className="font-medium">{tool.name}</TableCell>
                        <TableCell className="text-muted-foreground">{tool.assetNo}</TableCell>
                        <TableCell>{tool.assignedTo}</TableCell>
                        <TableCell>
                          {tool.status === "Available" ? (
                            <Badge className="bg-green-100 text-green-800">Available</Badge>
                          ) : (
                            <Badge variant="secondary">Checked Out</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {tool.status === "Available" ? (
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
  );
}