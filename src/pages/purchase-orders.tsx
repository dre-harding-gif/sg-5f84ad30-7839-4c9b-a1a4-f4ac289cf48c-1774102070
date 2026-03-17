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
import { Plus, FileText, DollarSign, Calendar, Trash2, Edit } from "lucide-react";

interface PurchaseOrder {
  id: string;
  po_number: string;
  job_id: string;
  supplier: string;
  total_amount: number;
  status: string;
  order_date: string;
  notes?: string;
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
  const [jobs, setJobs] = useState<any[]>([]);
  const [newPO, setNewPO] = useState({
    job_id: "",
    supplier: "",
    total_amount: "",
    notes: ""
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

      setPurchaseOrders(Array.isArray(poData) ? poData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePO() {
    if (!newPO.job_id || !newPO.supplier || !newPO.total_amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
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

      // Insert the purchase order
      const { error: insertError } = await supabase
        .from("purchase_orders")
        .insert([{
          po_number: poNumber,
          job_id: newPO.job_id,
          supplier: newPO.supplier,
          total_amount: parseFloat(newPO.total_amount),
          notes: newPO.notes || null,
          status: "pending"
        }]);

      if (insertError) throw insertError;

      toast({
        title: "PO Created",
        description: `Purchase order ${poNumber} created successfully`,
      });

      setDialogOpen(false);
      setNewPO({
        job_id: "",
        supplier: "",
        total_amount: "",
        notes: ""
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
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
        title: "PO Deleted",
        description: "Purchase order removed"
      });
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-orange-100 text-orange-800",
      ordered: "bg-blue-100 text-blue-800",
      received: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
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
            New PO
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total POs</CardTitle>
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
              <CardTitle className="text-sm font-medium">Received</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {purchaseOrders.filter(p => p.status === "received").length}
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
                  Create First PO
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
                        <p className="text-lg font-bold">£{po.total_amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(po.order_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Supplier:</span> {po.supplier}</p>
                      {po.notes && (
                        <p><span className="font-medium">Notes:</span> {po.notes}</p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/jobs/${po.job_id}`)}
                      >
                        View Job
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

      {/* Create PO Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              A PO number will be automatically generated for tracking
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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

            <div className="space-y-2">
              <Label htmlFor="total_amount">Amount (£) *</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newPO.total_amount}
                onChange={(e) => setNewPO({ ...newPO, total_amount: e.target.value })}
              />
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePO}>
                Create Purchase Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}