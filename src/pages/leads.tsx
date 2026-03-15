import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Phone, Mail, MapPin, Clock, TrendingUp, Search, Plus } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string;
  source: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  service_requested: string;
  message: string;
  budget_range: string;
  urgency: string;
  status: string;
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      new: { variant: "default", label: "New" },
      contacted: { variant: "secondary", label: "Contacted" },
      quoted: { variant: "outline", label: "Quoted" },
      won: { variant: "default", label: "Won" },
      lost: { variant: "destructive", label: "Lost" }
    };
    const config = variants[status] || variants.new;
    return <Badge variant={config.variant as any} className={status === 'won' ? 'bg-green-600 text-white' : ''}>{config.label}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === 'high') return <Badge variant="destructive">High Priority</Badge>;
    return null;
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.service_requested.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.postcode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && lead.status === activeTab;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    quoted: leads.filter(l => l.status === 'quoted').length,
    won: leads.filter(l => l.status === 'won').length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'won').length / leads.length) * 100).toFixed(1) : '0'
  };

  if (loading) {
    return (
      <PermissionGate require="view_leads">
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
          </div>
        </DashboardLayout>
      </PermissionGate>
    );
  }

  return (
    <PermissionGate require="view_leads">
      <DashboardLayout>
        <SEO title="Lead Management - Harding Homes" />
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Lead Management</h1>
              <p className="text-muted-foreground mt-1">Track inquiries from Checkatrade, website, and referrals</p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead Manually
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Leads</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>New</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{stats.new}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Awaiting contact</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Contacted</CardDescription>
                <CardTitle className="text-3xl">{stats.contacted}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Quoted</CardDescription>
                <CardTitle className="text-3xl">{stats.quoted}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Awaiting decision</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Won</CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.won}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Converted</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Conversion Rate</CardDescription>
                <CardTitle className="text-3xl">{stats.conversionRate}%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Performance
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search leads by name, service, or postcode..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="new">New ({stats.new})</TabsTrigger>
              <TabsTrigger value="contacted">Contacted ({stats.contacted})</TabsTrigger>
              <TabsTrigger value="quoted">Quoted ({stats.quoted})</TabsTrigger>
              <TabsTrigger value="won">Won ({stats.won})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {activeTab === 'all' ? 'All Leads' : 
                     activeTab === 'new' ? 'New Leads - Action Required' :
                     activeTab === 'contacted' ? 'Contacted Leads - Follow Up' :
                     activeTab === 'quoted' ? 'Quoted Leads - Awaiting Response' :
                     'Won Leads - Convert to Jobs'}
                  </CardTitle>
                  <CardDescription>
                    {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div className="font-medium">{lead.customer_name}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                            {lead.email && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{lead.service_requested}</div>
                            {lead.urgency === 'high' && getUrgencyBadge(lead.urgency)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {lead.postcode}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{lead.budget_range}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{lead.source}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(lead.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(lead.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {lead.status === 'new' && (
                                <Button size="sm" variant="outline">Contact</Button>
                              )}
                              {lead.status === 'contacted' && (
                                <Button size="sm" variant="outline">Send Quote</Button>
                              )}
                              {lead.status === 'won' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Convert to Job
                                </Button>
                              )}
                              <Button size="sm" variant="ghost">View</Button>
                            </div>
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