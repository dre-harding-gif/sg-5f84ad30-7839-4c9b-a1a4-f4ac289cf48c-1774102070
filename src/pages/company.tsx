import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, ShieldCheck, Receipt, Download, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function CompanyAssetsPage() {
  const fleet = [
    { id: "VN01", reg: "HG72 XMC", type: "Ford Transit Custom", driver: "John Smith", motDue: "2026-10-15", insuranceDue: "2026-08-01", status: "Active" },
    { id: "VN02", reg: "BT21 YTR", type: "VW Transporter", driver: "Mike Johnson", motDue: "2026-04-10", insuranceDue: "2026-08-01", status: "Warning" }, // Warning for close MOT
    { id: "VN03", reg: "LM68 PQA", type: "Ford Transit Tipper", driver: "Pool", motDue: "2026-11-20", insuranceDue: "2026-08-01", status: "Active" },
  ];

  const insurances = [
    { type: "Public Liability", provider: "AXA Business", cover: "£5,000,000", policyNo: "AX-9923847", expiry: "2026-12-31" },
    { type: "Employers Liability", provider: "AXA Business", cover: "£10,000,000", policyNo: "AX-9923847", expiry: "2026-12-31" },
    { type: "Contractors All Risk", provider: "Hiscox", cover: "£500,000", policyNo: "HX-558211", expiry: "2026-06-15" },
    { type: "Fleet Insurance", provider: "Direct Line", cover: "Fully Comp", policyNo: "DL-FLEET-90", expiry: "2026-08-01" },
  ];

  const bills = [
    { name: "Checkatrade Subscription", amount: "£120.00", frequency: "Monthly", nextPayment: "2026-03-20", category: "Marketing" },
    { name: "Unit 4 Rent", amount: "£850.00", frequency: "Monthly", nextPayment: "2026-04-01", category: "Facilities" },
    { name: "Tool Station Trade Account", amount: "£1,450.20", frequency: "Monthly Balance", nextPayment: "2026-03-28", category: "Materials" },
    { name: "Public Liability Installment", amount: "£85.50", frequency: "Monthly", nextPayment: "2026-04-05", category: "Insurance" },
  ];

  return (
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
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fleet.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <p className="font-bold text-primary">{vehicle.reg}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.type}</p>
                        </TableCell>
                        <TableCell>{vehicle.driver}</TableCell>
                        <TableCell>{new Date(vehicle.motDue).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>{new Date(vehicle.insuranceDue).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell>
                          {vehicle.status === "Warning" ? (
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
                  {insurances.map((policy, idx) => (
                    <div key={idx} className="border rounded-lg p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-primary">{policy.type}</h3>
                          <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                        </div>
                        <p className="text-sm"><strong>Provider:</strong> {policy.provider}</p>
                        <p className="text-sm"><strong>Policy No:</strong> {policy.policyNo}</p>
                        <p className="text-sm"><strong>Cover:</strong> {policy.cover}</p>
                        <p className="text-sm text-muted-foreground mt-2">Expires: {new Date(policy.expiry).toLocaleDateString('en-GB')}</p>
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
                    {bills.map((bill, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{bill.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">{bill.category}</Badge>
                        </TableCell>
                        <TableCell>{bill.frequency}</TableCell>
                        <TableCell>{new Date(bill.nextPayment).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell className="text-right font-bold">{bill.amount}</TableCell>
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