import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, ShieldCheck, Receipt, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FleetVehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  mot_expiry: string;
  insurance_expiry: string;
  assigned_to: string;
  status: string;
  mileage: number;
  notes: string;
}

interface Insurance {
  id: string;
  policy_type: string;
  provider: string;
  policy_number: string;
  coverage_amount: string;
  premium_annual: number;
  start_date: string;
  end_date: string;
  status: string;
  notes: string;
}

interface Bill {
  id: string;
  bill_name: string;
  category: string;
  provider: string;
  amount: number;
  frequency: string;
  next_payment: string;
  last_payment: string;
  status: string;
  notes: string;
}

export default function CompanyAssetsPage() {
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  async function fetchCompanyData() {
    try {
      const [fleetRes, insuranceRes, billsRes] = await Promise.all([
        supabase.from("company_fleet").select("*").order("registration"),
        supabase.from("insurance_policies").select("*").order("policy_type"),
        supabase.from("company_bills").select("*").order("category")
      ]);

      if (fleetRes.data) setFleet(fleetRes.data);
      if (insuranceRes.data) setInsurances(insuranceRes.data);
      if (billsRes.data) setBills(billsRes.data);
    } catch (error) {
      console.error("Error fetching company data:", error);
    } finally {
      setLoading(false);
    }
  }

  const getFleetStatus = (vehicle: FleetVehicle) => {
    const motDate = new Date(vehicle.mot_expiry);
    const insDate = new Date(vehicle.insurance_expiry);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (motDate < thirtyDaysFromNow || insDate < thirtyDaysFromNow) {
      return "warning";
    }
    return "compliant";
  };

  if (loading) {
    return (
      <PermissionGate require="view_company">
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
          </div>
        </DashboardLayout>
      </PermissionGate>
    );
  }

  return (
    <PermissionGate require="view_company">
      <DashboardLayout>
        <SEO title="Company Hub - Harding Homes" />
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Company Hub</h1>
            <p className="text-muted-foreground mt-1">Manage fleet, insurances, and company overheads.</p>
          </div>

          <Tabs defaultValue="fleet" className="space-y-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="fleet" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Truck className="w-4 h-4 mr-2" />
                Fleet & Vehicles
              </TabsTrigger>
              <TabsTrigger value="insurance" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Insurances
              </TabsTrigger>
              <TabsTrigger value="bills" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Receipt className="w-4 h-4 mr-2" />
                Bills & Payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fleet">
              <Card>
                <CardHeader>
                  <CardTitle>Company Vehicles</CardTitle>
                  <CardDescription>Track MOT, Insurance, and vehicle assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle / Reg</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>MOT Expiry</TableHead>
                        <TableHead>Ins. Expiry</TableHead>
                        <TableHead>Mileage</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fleet.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <p className="font-bold text-primary">{vehicle.registration}</p>
                            <p className="text-xs text-muted-foreground">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          </TableCell>
                          <TableCell>{vehicle.assigned_to}</TableCell>
                          <TableCell>{new Date(vehicle.mot_expiry).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>{new Date(vehicle.insurance_expiry).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>{vehicle.mileage.toLocaleString()} mi</TableCell>
                          <TableCell>
                            {getFleetStatus(vehicle) === "warning" ? (
                              <Badge variant="destructive" className="flex items-center w-fit gap-1">
                                <AlertTriangle className="w-3 h-3" /> Action Needed
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center w-fit gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Compliant
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insurance">
              <Card>
                <CardHeader>
                  <CardTitle>Company Insurances</CardTitle>
                  <CardDescription>Active policies and documentation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insurances.map((policy) => (
                      <div key={policy.id} className="border rounded-lg p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-primary">{policy.policy_type}</h3>
                            <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                          </div>
                          <p className="text-sm"><strong>Provider:</strong> {policy.provider}</p>
                          <p className="text-sm"><strong>Policy No:</strong> {policy.policy_number}</p>
                          <p className="text-sm"><strong>Cover:</strong> {policy.coverage_amount}</p>
                          <p className="text-sm"><strong>Premium:</strong> £{policy.premium_annual.toLocaleString()}/year</p>
                          <p className="text-sm text-muted-foreground mt-2">Expires: {new Date(policy.end_date).toLocaleDateString('en-GB')}</p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-4 w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download Certificate
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bills">
              <Card>
                <CardHeader>
                  <CardTitle>Recurring Bills & Accounts</CardTitle>
                  <CardDescription>Track monthly outgoings and trade accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier / Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Next Payment</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">{bill.bill_name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">{bill.category}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{bill.frequency}</TableCell>
                          <TableCell>{new Date(bill.next_payment).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell className="text-right font-bold">£{bill.amount.toFixed(2)}</TableCell>
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