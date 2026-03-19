import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, DollarSign, Calendar, Trash2, Edit, Package, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  job_id: string;
  supplier: string;
  total_amount: number;
  status: string;
  order_date: string;
  notes?: string;
  items?: LineItem[];
  jobs?: {
    title: string;
    job_number: string;
  };
}

export default function PurchaseOrders() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [newPO, setNewPO] = useState({
    job_id: "",
    supplier: "",
    notes: ""
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [newLineItem, setNewLineItem] = useState({
    description: "",
    quantity: "",
    unit_price: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load all purchase orders
      const { data: poData } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          jobs!purchase_orders_job_id_fkey(title, job_number)
        `)
        .order("order_date", { ascending: false });

      // Load active jobs for dropdown
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, title, job_number, status")
        .neq("status", "completed")
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });

      setPurchaseOrders(Array.isArray(poData) ? poData.map((po: any) => ({
        ...po,
        items: Array.isArray(po.items) ? po.items : []
      })) : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  }

  function addLineItem() {
    if (!newLineItem.description || !newLineItem.quantity || !newLineItem.unit_price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all line item fields",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseFloat(newLineItem.quantity);
    const unitPrice = parseFloat(newLineItem.unit_price);
    const total = quantity * unitPrice;

    const item: LineItem = {
      id: Date.now().toString(),
      description: newLineItem.description,
      quantity,
      unit_price: unitPrice,
      total
    };

    setLineItems([...lineItems, item]);
    setNewLineItem({ description: "", quantity: "", unit_price: "" });
  }

  function removeLineItem(id: string) {
    setLineItems(lineItems.filter(item => item.id !== id));
  }

  function calculateTotal() {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  }

  async function handleCreatePO() {
    if (!newPO.job_id || !newPO.supplier) {
      toast({
        title: "Missing Information",
        description: "Please select a job and supplier",
        variant: "destructive"
      });
      return;
    }

    if (lineItems.length === 0) {
      toast({
        title: "No Line Items",
        description: "Please add at least one line item",
        variant: "destructive"
      });
      return;
    }

    try {
      // Call the generate_po_number function
      const { data: poNumberData, error: poError } = await supabase
        .rpc("generate_po_number");

      if (poError) throw poError;

      const poNumber = poNumberData;
      const totalAmount = calculateTotal();

      // Insert the purchase order
      const { error: insertError } = await supabase
        .from("purchase_orders")
        .insert([{
          po_number: poNumber,
          job_id: newPO.job_id,
          supplier: newPO.supplier,
          total_amount: totalAmount,
          notes: newPO.notes || null,
          status: "pending",
          items: lineItems as any
        }]);

      if (insertError) throw insertError;

      toast({
        title: "P/O Created",
        description: `Purchase order ${poNumber} created successfully with ${lineItems.length} line items`,
      });

      setDialogOpen(false);
      setNewPO({
        job_id: "",
        supplier: "",
        notes: ""
      });
      setLineItems([]);
      loadData();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function handleUpdatePO() {
    if (!selectedPO) return;

    if (lineItems.length === 0) {
      toast({
        title: "No Line Items",
        description: "Please add at least one line item",
        variant: "destructive"
      });
      return;
    }

    try {
      const totalAmount = calculateTotal();

      const { error } = await supabase
        .from("purchase_orders")
        .update({
          supplier: selectedPO.supplier,
          notes: selectedPO.notes,
          items: lineItems as any,
          total_amount: totalAmount
        })
        .eq("id", selectedPO.id);

      if (error) throw error;

      toast({
        title: "P/O Updated",
        description: "Purchase order updated successfully"
      });

      setEditDialogOpen(false);
      setSelectedPO(null);
      setLineItems([]);
      loadData();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  function openEditDialog(po: PurchaseOrder) {
    setSelectedPO(po);
    setLineItems(Array.isArray(po.items) ? po.items : []);
    setEditDialogOpen(true);
  }

  async function deletePO(id: string) {
    if (!confirm("Delete this purchase order?")) return;

    const { error } = await supabase
      .from("purchase_orders")
      .delete()
      .eq("id", id);

    if (!error) {
      setPurchaseOrders(pos => pos.filter(p => p.id !== id));
      toast({
        title: "P/O Deleted",
        description: "Purchase order removed"
      });
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("purchase_orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setPurchaseOrders(pos => 
        pos.map(p => p.id === id ? { ...p, status: newStatus } : p)
      );
      toast({
        title: "Status Updated",
        description: `P/O marked as ${newStatus}`
      });
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-orange-100 text-orange-800",
      ordered: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      invoiced: "bg-purple-100 text-purple-800",
      paid: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <SEO title="Purchase Orders - Harding Homes" />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading purchase orders...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEO title="Purchase Orders - Harding Homes" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">Track materials and supplier orders by job</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New P/O
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P/Os</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchaseOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {purchaseOrders.filter(p => p.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{purchaseOrders.reduce((sum, po) => sum + (po.total_amount || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {purchaseOrders.filter(p => p.status === "delivered").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>All Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {purchaseOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No purchase orders yet</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First P/O
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {purchaseOrders.map((po) => (
                  <div 
                    key={po.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{po.po_number}</h3>
                          <Badge variant="outline" className={getStatusColor(po.status)}>
                            {po.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {po.jobs?.title} ({po.jobs?.job_number})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">£{po.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(po.order_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Supplier:</span> {po.supplier}</p>
                      
                      {/* Line Items Summary */}
                      {po.items && Array.isArray(po.items) && po.items.length > 0 && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">Line Items ({po.items.length})</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            {po.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.description} (×{item.quantity})</span>
                                <span className="font-medium">£{item.total.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {po.notes && (
                        <p><span className="font-medium">Notes:</span> {po.notes}</p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <select
                        className="text-sm border rounded px-2 py-1"
                        value={po.status}
                        onChange={(e) => updateStatus(po.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="ordered">Ordered</option>
                        <option value="delivered">Delivered</option>
                        <option value="invoiced">Invoiced</option>
                        <option value="paid">Paid</option>
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/jobs/${po.job_id}`)}
                      >
                        View Job
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(po)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePO(po.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create P/O Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              A P/O number will be automatically generated. Add line items for materials/products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_id">Job *</Label>
                <select
                  id="job_id"
                  className="w-full p-2 border rounded-md"
                  value={newPO.job_id}
                  onChange={(e) => setNewPO({ ...newPO, job_id: e.target.value })}
                >
                  <option value="">Select a job...</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.job_number} - {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier Name *</Label>
                <Input
                  id="supplier"
                  placeholder="e.g., Jewsons, Travis Perkins"
                  value={newPO.supplier}
                  onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional information..."
                value={newPO.notes}
                onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Line Items</h3>
              
              {/* Add Line Item Form */}
              <div className="grid grid-cols-12 gap-2 mb-4">
                <div className="col-span-5">
                  <Input
                    placeholder="Description (e.g., 2x4 Timber)"
                    value={newLineItem.description}
                    onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                    value={newLineItem.quantity}
                    onChange={(e) => setNewLineItem({ ...newLineItem, quantity: e.target.value })}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Unit Price (£)"
                    value={newLineItem.unit_price}
                    onChange={(e) => setNewLineItem({ ...newLineItem, unit_price: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Button onClick={addLineItem} className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Line Items Table */}
              {lineItems.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">£{item.unit_price.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">£{item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeLineItem(item.id)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={3} className="text-right">Total Amount:</TableCell>
                        <TableCell className="text-right">£{calculateTotal().toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg bg-muted/30">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No line items added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add materials/products using the form above</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setLineItems([]);
                  setNewLineItem({ description: "", quantity: "", unit_price: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePO} disabled={lineItems.length === 0}>
                Create Purchase Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit P/O Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Order</DialogTitle>
            <DialogDescription>
              Update supplier information and line items for {selectedPO?.po_number}
            </DialogDescription>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>P/O Number</Label>
                  <Input value={selectedPO.po_number} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Job</Label>
                  <Input value={`${selectedPO.jobs?.job_number} - ${selectedPO.jobs?.title}`} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_supplier">Supplier Name</Label>
                <Input
                  id="edit_supplier"
                  value={selectedPO.supplier}
                  onChange={(e) => setSelectedPO({ ...selectedPO, supplier: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={selectedPO.notes || ""}
                  onChange={(e) => setSelectedPO({ ...selectedPO, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Line Items</h3>
                
                {/* Add Line Item Form */}
                <div className="grid grid-cols-12 gap-2 mb-4">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      value={newLineItem.description}
                      onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Qty"
                      value={newLineItem.quantity}
                      onChange={(e) => setNewLineItem({ ...newLineItem, quantity: e.target.value })}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      value={newLineItem.unit_price}
                      onChange={(e) => setNewLineItem({ ...newLineItem, unit_price: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button onClick={addLineItem} className="w-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Line Items Table */}
                {lineItems.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">£{item.unit_price.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">£{item.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeLineItem(item.id)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-semibold">
                          <TableCell colSpan={3} className="text-right">Total Amount:</TableCell>
                          <TableCell className="text-right">£{calculateTotal().toFixed(2)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-muted/30">
                    <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground">No line items</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setSelectedPO(null);
                    setLineItems([]);
                    setNewLineItem({ description: "", quantity: "", unit_price: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdatePO} disabled={lineItems.length === 0}>
                  Update Purchase Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}