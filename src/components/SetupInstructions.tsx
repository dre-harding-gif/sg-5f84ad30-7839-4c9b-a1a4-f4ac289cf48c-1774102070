import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import QRCode from "qrcode.react";
import { 
  Smartphone, Monitor, Download, CheckCircle, Copy, 
  Share2, Users, FileText, QrCode, Apple, Chrome 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SetupInstructions() {
  const { toast } = useToast();
  const [appUrl, setAppUrl] = useState("");
  const [companyName, setCompanyName] = useState("Harding Homes");

  useEffect(() => {
    // Get the current URL or Vercel URL
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin);
    }
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "app-qr-code.png";
      link.href = url;
      link.click();
      toast({
        title: "QR Code Downloaded",
        description: "QR code saved to your downloads folder",
      });
    }
  };

  const printInstructions = () => {
    window.print();
    toast({
      title: "Print Dialog Opened",
      description: "Ready to print setup instructions",
    });
  };

  return (
    <div className="space-y-6">
      {/* QR Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code for Easy Access
          </CardTitle>
          <CardDescription>
            Team members can scan this QR code with their phone camera to instantly access the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0 bg-white p-6 rounded-lg border-2 border-dashed">
              <QRCode
                id="qr-code"
                value={appUrl || "https://your-app.vercel.app"}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="app-url">App URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="app-url"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    placeholder="https://your-app.vercel.app"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(appUrl, "App URL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This is your live app URL. Update it after deploying to Vercel.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={downloadQRCode} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
                <Button onClick={() => copyToClipboard(appUrl, "App URL")} variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Setup Instructions for Team Members</CardTitle>
              <CardDescription>
                Step-by-step guides for installing and using the app
              </CardDescription>
            </div>
            <Button onClick={printInstructions} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Print Instructions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="iphone" className="space-y-4">
            <TabsList className="grid grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="iphone">
                <Apple className="h-4 w-4 mr-2" />
                iPhone
              </TabsTrigger>
              <TabsTrigger value="android">
                <Chrome className="h-4 w-4 mr-2" />
                Android
              </TabsTrigger>
              <TabsTrigger value="desktop">
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </TabsTrigger>
            </TabsList>

            {/* iPhone Instructions */}
            <TabsContent value="iphone" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">1</Badge>
                  <div>
                    <h3 className="font-semibold">Open Safari Browser</h3>
                    <p className="text-sm text-muted-foreground">
                      Open Safari and navigate to: <code className="bg-muted px-2 py-1 rounded">{appUrl}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">2</Badge>
                  <div>
                    <h3 className="font-semibold">Tap the Share Button</h3>
                    <p className="text-sm text-muted-foreground">
                      Tap the Share icon (square with arrow pointing up) at the bottom of the screen
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">3</Badge>
                  <div>
                    <h3 className="font-semibold">Add to Home Screen</h3>
                    <p className="text-sm text-muted-foreground">
                      Scroll down and tap "Add to Home Screen"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">4</Badge>
                  <div>
                    <h3 className="font-semibold">Name the App</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter "{companyName}" or your preferred name, then tap "Add"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3" />
                  </Badge>
                  <div>
                    <h3 className="font-semibold text-green-600">Done!</h3>
                    <p className="text-sm text-muted-foreground">
                      The app icon now appears on your home screen. Tap it to open the app!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-blue-800">
                  The app works offline! Once installed, you can view job details and customer information even without internet connection. Changes sync automatically when you're back online.
                </p>
              </div>
            </TabsContent>

            {/* Android Instructions */}
            <TabsContent value="android" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">1</Badge>
                  <div>
                    <h3 className="font-semibold">Open Chrome Browser</h3>
                    <p className="text-sm text-muted-foreground">
                      Open Chrome and navigate to: <code className="bg-muted px-2 py-1 rounded">{appUrl}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">2</Badge>
                  <div>
                    <h3 className="font-semibold">Open Menu</h3>
                    <p className="text-sm text-muted-foreground">
                      Tap the three dots menu (⋮) in the top-right corner
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">3</Badge>
                  <div>
                    <h3 className="font-semibold">Install App</h3>
                    <p className="text-sm text-muted-foreground">
                      Tap "Add to Home Screen" or "Install App"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">4</Badge>
                  <div>
                    <h3 className="font-semibold">Confirm Installation</h3>
                    <p className="text-sm text-muted-foreground">
                      Tap "Install" or "Add" to confirm
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3" />
                  </Badge>
                  <div>
                    <h3 className="font-semibold text-green-600">Done!</h3>
                    <p className="text-sm text-muted-foreground">
                      The app icon now appears on your home screen and app drawer!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">📱 Alternative Method</h4>
                <p className="text-sm text-blue-800">
                  Some Android phones show an "Install" banner at the bottom of the screen when you first visit the app. You can tap this banner to install instantly!
                </p>
              </div>
            </TabsContent>

            {/* Desktop Instructions */}
            <TabsContent value="desktop" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">1</Badge>
                  <div>
                    <h3 className="font-semibold">Open Your Browser</h3>
                    <p className="text-sm text-muted-foreground">
                      Open Chrome, Edge, or Firefox and navigate to: <code className="bg-muted px-2 py-1 rounded">{appUrl}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">2</Badge>
                  <div>
                    <h3 className="font-semibold">Bookmark for Quick Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Press <kbd className="bg-muted px-2 py-1 rounded">Ctrl+D</kbd> (Windows) or <kbd className="bg-muted px-2 py-1 rounded">⌘+D</kbd> (Mac) to bookmark
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-primary text-white">3</Badge>
                  <div>
                    <h3 className="font-semibold">Optional: Install as Desktop App</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      In Chrome: Click the install icon (⊕) in the address bar, or go to Menu → Install {companyName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This creates a standalone app window without browser tabs!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-1 bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3" />
                  </Badge>
                  <div>
                    <h3 className="font-semibold text-green-600">Done!</h3>
                    <p className="text-sm text-muted-foreground">
                      Access the app anytime from your browser or desktop!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">💻 Best for Office Staff</h4>
                <p className="text-sm text-blue-800">
                  Desktop version is perfect for office managers handling leads, creating quotes, and managing schedules with a full keyboard and large screen.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quick Start Guide for Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">For Builders & Site Staff</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>View your assigned jobs for the day/week</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Tap addresses to open in Google/Apple Maps for navigation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Upload job photos directly from your phone</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Log work hours and update job status</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>View customer contact info and job specifications</span>
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">For Office Staff</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Manage leads from Checkatrade and other sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Create and send professional quotes and invoices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Schedule jobs and assign team members</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Track job progress and completion rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Manage inventory and purchase orders</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">🔐 First Time Login</h4>
            <p className="text-sm text-amber-800 mb-2">
              After creating your account, wait for the admin to assign your role. You'll then have access to features relevant to your position.
            </p>
            <p className="text-sm text-amber-800">
              <strong>Default password:</strong> Change it immediately after first login in Settings → Security
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share These Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => copyToClipboard(appUrl, "App URL")}>
              <Copy className="h-4 w-4 mr-2" />
              Copy App Link
            </Button>
            <Button onClick={downloadQRCode} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
            <Button onClick={printInstructions} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Print Instructions
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Send the app link or QR code to your team via email, WhatsApp, or print these instructions for your office.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}