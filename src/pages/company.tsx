import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { Car, Shield, CreditCard, Plus, Edit, Trash2, AlertCircle, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface FleetVehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  mot_expiry: string;
  insurance_expiry: string;
  status?: string;
  mileage: number;
  notes: string | null;
  assigned_driver: string | null;
}

interface InsurancePolicy {
  id: string;
  policy_type: string;
  provider: string;
  policy_number: string;
  coverage_amount: number | string;
  annual_premium: number;
  start_date: string;
  renewal_date: string;
  status: string;
  notes: string | null;
}

interface CompanyBill {
  id: string;
  bill_name: string;
  category: string;
  provider: string;
  amount: number;
  frequency: string;
  due_date: string;
  last_paid: string;
  status: string;
  notes: string | null;
}

const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

export default function CompanyPage() {
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [insurance, setInsurance] = useState<InsurancePolicy[]>([]);
  const [bills, setBills] = useState<CompanyBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const [fleetData, insuranceData, billsData] = await Promise.all([
        supabase.from("company_fleet").select("*").order("registration"),
        supabase.from("insurance_policies").select("*").order("renewal_date"),
        supabase.from("company_bills").select("*").order("due_date")
      ]);

      if (fleetData.data) setFleet(fleetData.data as any[]);
      if (insuranceData.data) setInsurance(insuranceData.data as any[]);
      if (billsData.data) setBills(billsData.data);
    } catch (error) {
      console.error("Error fetching company data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { variant: "destructive" as const, text: "Expired", days: daysUntilExpiry };
    if (daysUntilExpiry <= 30) return { variant: "destructive" as const, text: `${daysUntilExpiry} days`, days: daysUntilExpiry };
    if (daysUntilExpiry <= 60) return { variant: "default" as const, text: `${daysUntilExpiry} days`, days: daysUntilExpiry };
    return { variant: "secondary" as const, text: `${daysUntilExpiry} days`, days: daysUntilExpiry };
  };

  // Financial Analytics Data
  const monthlyExpenses = [
    { month: "Oct", total: 4285, recurring: 3500, oneTime: 785 },
    { month: "Nov", total: 4650, recurring: 3500, oneTime: 1150 },
    { month: "Dec", total: 5200, recurring: 3500, oneTime: 1700 },
    { month: "Jan", total: 4450, recurring: 3500, oneTime: 950 },
    { month: "Feb", total: 4285, recurring: 3500, oneTime: 785 },
    { month: "Mar", total: 4800, recurring: 3500, oneTime: 1300 },
  ];

  const expensesByCategory = bills.reduce((acc, bill) => {
    const existing = acc.find(item => item.name === bill.category);
    if (existing) {
      existing.value += bill.amount;
    } else {
      acc.push({ name: bill.category, value: bill.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const insuranceBreakdown = insurance.map(policy => ({
    name: policy.policy_type,
    value: policy.annual_premium
  }));

  const totalMonthlyExpenses = bills.reduce((sum, bill) => {
    if (bill.frequency === "monthly") return sum + bill.amount;
    if (bill.frequency === "quarterly") return sum + (bill.amount / 3);
    if (bill.frequency === "annual") return sum + (bill.amount / 12);
    return sum;
  }, 0);

  const totalAnnualExpenses = bills.reduce((sum, bill) => {
    if (bill.frequency === "monthly") return sum + (bill.amount * 12);
    if (bill.frequency === "quarterly") return sum + (bill.amount * 4);
    if (bill.frequency === "annual") return sum + bill.amount;
    return sum;
  }, 0);

  return (
    <PermissionGate require="view_company" fallback={<div className="p-8 text-center">Access Denied</div>}>
      <DashboardLayout>
        <SEO 
          title="Company Hub - Harding Homes"
          description="Manage company fleet, insurance, bills, and financial analytics"
        />
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Company Hub</h1>
            <p className="text-muted-foreground">Manage fleet, insurance, bills, and view financial analytics</p>
          </div>

          {/* Financial Overview Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Monthly Expenses</CardDescription>
                <CardTitle className="text-3xl">£{totalMonthlyExpenses.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Recurring costs per month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Annual Expenses</CardDescription>
                <CardTitle className="text-3xl">£{(totalAnnualExpenses / 1000).toFixed(1)}k</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Total yearly overhead</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Policies</CardDescription>
                <CardTitle className="text-3xl">{insurance.filter(p => p.status === "active").length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Insurance policies</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Fleet Vehicles</CardDescription>
                <CardTitle className="text-3xl">{fleet.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{fleet.filter(v => v.status === "Available").length} available</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Trend Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Expense Trends
                </CardTitle>
                <CardDescription>Last 6 months breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyExpenses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#1e3a8a" strokeWidth={2} name="Total" />
                    <Line type="monotone" dataKey="recurring" stroke="#3b82f6" strokeWidth={2} name="Recurring" />
                    <Line type="monotone" dataKey="oneTime" stroke="#93c5fd" strokeWidth={2} name="One-time" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Expenses by Category
                </CardTitle>
                <CardDescription>Monthly breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="fleet" className="space-y-4">
            <TabsList>
              <TabsTrigger value="fleet" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Fleet Management
              </TabsTrigger>
              <TabsTrigger value="insurance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Insurance
              </TabsTrigger>
              <TabsTrigger value="bills" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Bills & Payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fleet" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Company Fleet</CardTitle>
                      <CardDescription>Track all company vehicles, MOT dates, and insurance</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading fleet data...</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Registration</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>MOT Expiry</TableHead>
                          <TableHead>Insurance Expiry</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Mileage</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fleet.map((vehicle) => {
                          const motStatus = getExpiryStatus(vehicle.mot_expiry);
                          const insuranceStatus = getExpiryStatus(vehicle.insurance_expiry);
                          
                          return (
                            <TableRow key={vehicle.id}>
                              <TableCell className="font-medium">{vehicle.registration}</TableCell>
                              <TableCell>{vehicle.year} {vehicle.make} {vehicle.model}</TableCell>
                              <TableCell>
                                <Badge variant={motStatus.variant}>
                                  {motStatus.text}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={insuranceStatus.variant}>
                                  {insuranceStatus.text}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={vehicle.status === "Available" ? "secondary" : "default"}>
                                  {vehicle.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{vehicle.mileage.toLocaleString()} miles</TableCell>
                              <TableCell>{vehicle.assigned_driver || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insurance" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Insurance Premium Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={insuranceBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#1e3a8a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Total Annual Premium</CardTitle>
                    <CardDescription>All active policies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-900">
                      £{insurance.reduce((sum, p) => sum + p.annual_premium, 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Across {insurance.length} active policies
                    </p>
                    <div className="mt-4 space-y-2">
                      {insurance.slice(0, 3).map(policy => (
                        <div key={policy.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{policy.policy_type}</span>
                          <span className="font-medium">£{policy.annual_premium.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Insurance Policies</CardTitle>
                      <CardDescription>All company insurance policies and coverage</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Policy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading insurance data...</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Policy Type</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Policy Number</TableHead>
                          <TableHead>Coverage</TableHead>
                          <TableHead>Premium</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {insurance.map((policy) => {
                          const expiryStatus = getExpiryStatus(policy.renewal_date);
                          
                          return (
                            <TableRow key={policy.id}>
                              <TableCell className="font-medium">{policy.policy_type}</TableCell>
                              <TableCell>{policy.provider}</TableCell>
                              <TableCell className="font-mono text-sm">{policy.policy_number}</TableCell>
                              <TableCell>{policy.coverage_amount}</TableCell>
                              <TableCell>£{policy.annual_premium.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={expiryStatus.variant}>
                                  {expiryStatus.text}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={policy.status === "active" ? "secondary" : "default"}>
                                  {policy.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bills" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Bills & Recurring Payments</CardTitle>
                      <CardDescription>Track all company expenses and payment schedules</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bill
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading bills data...</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Next Due</TableHead>
                          <TableHead>Last Paid</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bills.map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell className="font-medium">{bill.bill_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{bill.category}</Badge>
                            </TableCell>
                            <TableCell>{bill.provider}</TableCell>
                            <TableCell className="capitalize">{bill.frequency}</TableCell>
                            <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(bill.last_paid).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right font-bold">£{bill.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={bill.status === "active" ? "secondary" : "default"}>
                                {bill.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </PermissionGate>
  );
}