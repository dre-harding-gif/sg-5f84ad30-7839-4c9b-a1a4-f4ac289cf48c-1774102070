import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Receipt, Download, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InvoiceGeneratorProps {
  quoteId?: string;
  jobId?: string;
  onInvoiceSaved?: (invoiceId: string) => void;
}

export function InvoiceGenerator({ quoteId, jobId, onInvoiceSaved }: InvoiceGeneratorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    invoice_number: `INV-${Date.now()}`,
    payment_status: "unpaid" as "unpaid" | "partial" | "paid",
    payment_method: "",
    amount_paid: 0,
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const generateInvoicePDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF();
    
    // Company header
    doc.setFontSize(20);
    doc.text("HARDING HOMES", 20, 20);
    doc.setFontSize(10);
    doc.text("Professional Building Services", 20, 27);
    doc.text("Tel: 01234 567890 | Email: accounts@hardinghomes.co.uk", 20, 32);
    
    // Invoice title
    doc.setFontSize(16);
    doc.setTextColor(220, 53, 69);
    doc.text("INVOICE", 20, 45);
    doc.setTextColor(0, 0, 0);
    
    // Invoice details
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoiceData.invoice_number}`, 20, 55);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Due Date: ${new Date(invoiceData.due_date).toLocaleDateString()}`, 20, 65);
    
    // Payment status badge
    const status = invoiceData.payment_status.toUpperCase();
    doc.setFontSize(12);
    if (invoiceData.payment_status === "paid") {
      doc.setTextColor(34, 197, 94);
    } else if (invoiceData.payment_status === "partial") {
      doc.setTextColor(234, 179, 8);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    doc.text(status, 170, 55);
    doc.setTextColor(0, 0, 0);
    
    return doc;
  };

  const saveInvoice = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceData.invoice_number,
          quote_id: quoteId,
          job_id: jobId,
          payment_status: invoiceData.payment_status,
          payment_method: invoiceData.payment_method || null,
          amount_paid: invoiceData.amount_paid,
          due_date: invoiceData.due_date,
          created_by: sessionData.session.user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Invoice Saved",
        description: `Invoice ${invoiceData.invoice_number} has been created.`
      });

      if (onInvoiceSaved && data) {
        onInvoiceSaved(data.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    const doc = await generateInvoicePDF();
    doc.save(`Invoice-${invoiceData.invoice_number}.pdf`);
    
    toast({
      title: "Invoice Downloaded",
      description: "PDF has been downloaded successfully."
    });
  };

  const markAsPaid = async () => {
    setInvoiceData({
      ...invoiceData,
      payment_status: "paid",
      amount_paid: 0 // Would be total from quote
    });
    
    toast({
      title: "Payment Recorded",
      description: "Invoice has been marked as paid."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Invoice Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Invoice Number</Label>
            <Input
              value={invoiceData.invoice_number}
              onChange={(e) => setInvoiceData({ ...invoiceData, invoice_number: e.target.value })}
            />
          </div>
          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={invoiceData.due_date}
              onChange={(e) => setInvoiceData({ ...invoiceData, due_date: e.target.value })}
            />
          </div>
          <div>
            <Label>Payment Status</Label>
            <Select
              value={invoiceData.payment_status}
              onValueChange={(value: any) => setInvoiceData({ ...invoiceData, payment_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment Method</Label>
            <Select
              value={invoiceData.payment_method}
              onValueChange={(value) => setInvoiceData({ ...invoiceData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card Payment</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveInvoice} disabled={loading} variant="outline">
            Save Invoice
          </Button>
          <Button onClick={downloadInvoice} disabled={loading} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={markAsPaid} disabled={loading} variant="default">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Paid
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}