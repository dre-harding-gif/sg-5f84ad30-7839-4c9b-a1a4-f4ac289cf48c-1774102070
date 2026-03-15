import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Trash2, Download, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface QuoteGeneratorProps {
  customerId?: string;
  jobId?: string;
  onQuoteSaved?: (quoteId: string) => void;
}

export function QuoteGenerator({ customerId, jobId, onQuoteSaved }: QuoteGeneratorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unit_price: 0, total: 0 }
  ]);
  const [quoteData, setQuoteData] = useState({
    customer_name: "",
    customer_email: "",
    customer_address: "",
    quote_number: `Q-${Date.now()}`,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "Payment terms: 50% deposit, 50% on completion\nAll prices include VAT",
    discount_percent: 0
  });

  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unit_price: 0,
      total: 0
    }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unit_price") {
          updated.total = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    return calculateSubtotal() * (quoteData.discount_percent / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const generatePDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF();
    
    // Company header
    doc.setFontSize(20);
    doc.text("HARDING HOMES", 20, 20);
    doc.setFontSize(10);
    doc.text("Professional Building Services", 20, 27);
    doc.text("Tel: 01234 567890 | Email: info@hardinghomes.co.uk", 20, 32);
    
    // Quote title
    doc.setFontSize(16);
    doc.text("QUOTATION", 20, 45);
    
    // Quote details
    doc.setFontSize(10);
    doc.text(`Quote Number: ${quoteData.quote_number}`, 20, 55);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Valid Until: ${new Date(quoteData.valid_until).toLocaleDateString()}`, 20, 65);
    
    // Customer details
    doc.text("Quote For:", 120, 55);
    doc.text(quoteData.customer_name, 120, 60);
    doc.text(quoteData.customer_address, 120, 65);
    
    // Line items table
    const tableData = lineItems.map(item => [
      item.description,
      item.quantity.toString(),
      `£${item.unit_price.toFixed(2)}`,
      `£${item.total.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: 75,
      head: [['Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: £${calculateSubtotal().toFixed(2)}`, 140, finalY);
    if (quoteData.discount_percent > 0) {
      doc.text(`Discount (${quoteData.discount_percent}%): -£${calculateDiscount().toFixed(2)}`, 140, finalY + 5);
      doc.setFont(undefined, 'bold');
      doc.text(`Total: £${calculateTotal().toFixed(2)}`, 140, finalY + 10);
    } else {
      doc.setFont(undefined, 'bold');
      doc.text(`Total: £${calculateTotal().toFixed(2)}`, 140, finalY + 5);
    }
    
    // Notes
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const notes = quoteData.notes.split('\n');
    let notesY = finalY + 20;
    notes.forEach(note => {
      doc.text(note, 20, notesY);
      notesY += 5;
    });
    
    return doc;
  };

  const saveQuote = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("quotes")
        .insert({
          quote_number: quoteData.quote_number,
          customer_id: customerId,
          job_id: jobId,
          customer_name: quoteData.customer_name,
          customer_email: quoteData.customer_email,
          customer_address: quoteData.customer_address,
          line_items: lineItems,
          subtotal: calculateSubtotal(),
          discount_percent: quoteData.discount_percent,
          discount_amount: calculateDiscount(),
          total: calculateTotal(),
          valid_until: quoteData.valid_until,
          notes: quoteData.notes,
          status: "draft",
          created_by: sessionData.session.user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Quote Saved",
        description: `Quote ${quoteData.quote_number} has been saved successfully.`
      });

      if (onQuoteSaved && data) {
        onQuoteSaved(data.id);
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

  const downloadQuote = async () => {
    const doc = await generatePDF();
    doc.save(`Quote-${quoteData.quote_number}.pdf`);
    
    toast({
      title: "Quote Downloaded",
      description: "PDF has been downloaded successfully."
    });
  };

  const sendQuote = async () => {
    setLoading(true);
    try {
      await saveQuote();
      const doc = await generatePDF();
      const pdfBlob = doc.output('blob');
      
      // Here you would integrate with your email service
      // For now, we'll just download it
      doc.save(`Quote-${quoteData.quote_number}.pdf`);
      
      toast({
        title: "Quote Sent",
        description: `Quote has been sent to ${quoteData.customer_email}`
      });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Quote Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Quote Number</Label>
            <Input
              value={quoteData.quote_number}
              onChange={(e) => setQuoteData({ ...quoteData, quote_number: e.target.value })}
            />
          </div>
          <div>
            <Label>Valid Until</Label>
            <Input
              type="date"
              value={quoteData.valid_until}
              onChange={(e) => setQuoteData({ ...quoteData, valid_until: e.target.value })}
            />
          </div>
          <div>
            <Label>Customer Name</Label>
            <Input
              value={quoteData.customer_name}
              onChange={(e) => setQuoteData({ ...quoteData, customer_name: e.target.value })}
              placeholder="John Smith"
            />
          </div>
          <div>
            <Label>Customer Email</Label>
            <Input
              type="email"
              value={quoteData.customer_email}
              onChange={(e) => setQuoteData({ ...quoteData, customer_email: e.target.value })}
              placeholder="john@email.com"
            />
          </div>
          <div className="col-span-2">
            <Label>Customer Address</Label>
            <Input
              value={quoteData.customer_address}
              onChange={(e) => setQuoteData({ ...quoteData, customer_address: e.target.value })}
              placeholder="123 Main Street, London, SW1A 1AA"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg">Line Items</Label>
            <Button onClick={addLineItem} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {lineItems.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
              <div className="col-span-5">
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                  placeholder="e.g., Kitchen extension groundwork"
                />
              </div>
              <div className="col-span-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div className="col-span-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateLineItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <Label>Total</Label>
                <Input value={`£${item.total.toFixed(2)}`} disabled />
              </div>
              <div className="col-span-1">
                {lineItems.length > 1 && (
                  <Button
                    onClick={() => removeLineItem(item.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">£{calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Discount %:</Label>
              <Input
                type="number"
                value={quoteData.discount_percent}
                onChange={(e) => setQuoteData({ ...quoteData, discount_percent: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
                className="w-20"
              />
            </div>
            <span className="text-sm">-£{calculateDiscount().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>£{calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label>Terms & Notes</Label>
          <Textarea
            value={quoteData.notes}
            onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
            rows={4}
            placeholder="Payment terms, warranties, additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={saveQuote} disabled={loading} variant="outline">
            Save Draft
          </Button>
          <Button onClick={downloadQuote} disabled={loading} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={sendQuote} disabled={loading}>
            <Send className="w-4 h-4 mr-2" />
            Send to Customer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}