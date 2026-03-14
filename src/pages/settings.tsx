import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Bell, Link as LinkIcon, Shield, Users } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your company settings and integrations</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue="Harding Homes Ltd" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input id="company-email" type="email" defaultValue="info@hardinghomesltd.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input id="company-phone" defaultValue="07123 456789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Address</Label>
                    <Input id="company-address" defaultValue="Manchester, UK" />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                      <SettingsIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline">Upload Logo</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <Input id="primary-color" type="color" defaultValue="#1e3a8a" className="w-24 h-10" />
                    <Input defaultValue="#1e3a8a" className="flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Checkatrade Integration</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Automatically import leads from Checkatrade
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkatrade-api">API Key</Label>
                    <Input 
                      id="checkatrade-api" 
                      type="password" 
                      placeholder="Enter your Checkatrade API key"
                    />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <LinkIcon className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      Connect to automatically sync new leads and customer enquiries
                    </p>
                  </div>
                  <Button>Connect Checkatrade</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Google Maps Integration</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enable map navigation for job locations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Shield className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800">
                      Connected - Team can navigate to job sites via Google/Apple Maps
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Email Notifications</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Send automated emails to customers
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" placeholder="smtp.gmail.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">Port</Label>
                      <Input id="smtp-port" placeholder="587" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-username">Username</Label>
                      <Input id="smtp-username" type="email" />
                    </div>
                  </div>
                  <Button>Test Connection</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "New Lead Received", description: "Get notified when a new lead comes in" },
                  { label: "Job Status Updates", description: "Alerts when job status changes" },
                  { label: "Team Check-in", description: "When team members check in/out of sites" },
                  { label: "Customer Messages", description: "New messages from customer portal" },
                  { label: "Payment Reminders", description: "Upcoming payment due dates" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage team member permissions and access levels
                </p>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Invite Team Member
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}