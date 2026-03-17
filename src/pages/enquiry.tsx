import { useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Phone, Mail, MapPin, Loader2 } from "lucide-react";

export default function EnquiryForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    postcode: "",
    service_type: "",
    message: "",
    source: "direct"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save enquiry to database
      const { data, error } = await supabase
        .from("public_enquiries")
        .insert([{
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          postcode: formData.postcode,
          service_type: formData.service_type,
          message: formData.message,
          enquiry_source: formData.source,
          status: "new"
        }])
        .select()
        .single();

      if (error) throw error;

      // Trigger AI auto-response (fire and forget - don't wait)
      supabase.functions.invoke('ai-enquiry-response', {
        body: {
          enquiryId: data.id,
          customerName: formData.name,
          customerEmail: formData.email,
          serviceType: formData.service_type,
          message: formData.message
        }
      }).catch(err => {
        console.error("AI response failed:", err);
        // Don't show error to user - AI is optional enhancement
      });

      setSubmitted(true);
    } catch (error: any) {
      alert("Failed to submit enquiry. Please try again or call us directly.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <SEO title="Thank You - Harding Homes" />
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your enquiry has been received. We'll contact you within 24 hours to discuss your project.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Need urgent help? Call us: 01234 567890</span>
              </p>
              <p className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@hardinghomes.co.uk</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <SEO 
        title="Get a Quote - Harding Homes" 
        description="Request a free quote for your building project in Berkshire"
      />
      
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Get Your Free Quote</h1>
          <p className="text-lg text-muted-foreground">
            Tell us about your project and we'll get back to you within 24 hours
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Fill in the form below and we'll contact you to discuss your building needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="07123 456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Project Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Project Location</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Property Address *</Label>
                  <Input
                    id="address"
                    required
                    placeholder="123 High Street, Reading"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    required
                    placeholder="RG1 1AA"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  />
                </div>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="service_type">Type of Work Required</Label>
                <select
                  id="service_type"
                  className="w-full p-2 border rounded-md"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                >
                  <option value="">Select a service...</option>
                  <option value="extension">Extension</option>
                  <option value="renovation">Renovation</option>
                  <option value="new_build">New Build</option>
                  <option value="roofing">Roofing</option>
                  <option value="groundworks">Groundworks</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Project Description */}
              <div className="space-y-2">
                <Label htmlFor="message">Tell Us About Your Project *</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Please describe what you'd like us to help with, including any specific requirements or timescales..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {/* Source tracking */}
              <div className="space-y-2">
                <Label htmlFor="source">How did you hear about us?</Label>
                <select
                  id="source"
                  className="w-full p-2 border rounded-md"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  <option value="direct">Direct (Website)</option>
                  <option value="checkatrade">Checkatrade</option>
                  <option value="google">Google Search</option>
                  <option value="referral">Friend/Family Referral</option>
                  <option value="social_media">Social Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Enquiry"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By submitting this form, you agree to be contacted regarding your enquiry.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Trust signals */}
        <div className="mt-8 grid gap-4 md:grid-cols-3 text-center">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="font-semibold text-blue-600">24 Hour Response</div>
            <div className="text-sm text-muted-foreground">We'll get back to you quickly</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="font-semibold text-blue-600">Free Quotes</div>
            <div className="text-sm text-muted-foreground">No obligation estimates</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="font-semibold text-blue-600">Berkshire Based</div>
            <div className="text-sm text-muted-foreground">Local trusted builders</div>
          </div>
        </div>
      </div>
    </div>
  );
}