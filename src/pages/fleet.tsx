import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, AlertTriangle, Wrench, Calendar, Plus, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PermissionGate } from "@/components/PermissionGate";

interface Vehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  status: string;
  assigned_to?: string;
  mot_due?: string;
  service_due?: string;
  notes?: string;
}

interface FleetIssue {
  id: string;
  vehicle_id: string;
  vehicle_registration: string;
  issue_type: string;
  description: string;
  reported_by: string;
  reporter_name: string;
  status: string;
  priority: string;
  reported_date: string;
  resolved_date?: string;
}

interface ServiceBooking {
  id: string;
  vehicle_id: string;
  vehicle_registration: string;
  booking_type: string;
  start_date: string;
  end_date: string;
  notes?: string;
  booked_by: string;
  booker_name: string;
  status: string;
}

export default function FleetManagementPage() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fleetIssues, setFleetIssues] = useState<FleetIssue[]>([]);
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  
  // Dialog states
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  
  // Form states
  const [newIssue, setNewIssue] = useState({
    vehicle_id: "",
    issue_type: "mechanical",
    description: "",
    priority: "medium"
  });

  const [newBooking, setNewBooking] = useState({
    vehicle_id: "",
    booking_type: "service",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  useEffect(() => {
    loadUserRole();
    loadFleetData();
  }, []);

  async function loadUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error("Error loading user role:", error);
    }
  }

  async function loadFleetData() {
    try {
      setLoading(true);

      // Load vehicles
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("*")
        .order("registration", { ascending: true });

      // Load fleet issues with reporter names
      const { data: issuesData } = await supabase
        .from("fleet_issues")
        .select(`
          *,
          vehicles!fleet_issues_vehicle_id_fkey(registration),
          profiles!fleet_issues_reported_by_fkey(full_name)
        `)
        .order("reported_date", { ascending: false });

      // Load service bookings with booker names
      const { data: bookingsData } = await supabase
        .from("fleet_service_bookings")
        .select(`
          *,
          vehicles!fleet_service_bookings_vehicle_id_fkey(registration),
          profiles!fleet_service_bookings_booked_by_fkey(full_name)
        `)
        .order("start_date", { ascending: false });

      setVehicles(vehiclesData || []);
      
      setFleetIssues((issuesData || []).map((issue: any) => ({
        id: issue.id,
        vehicle_id: issue.vehicle_id,
        vehicle_registration: issue.vehicles?.registration || 'Unknown',
        issue_type: issue.issue_type,
        description: issue.description,
        reported_by: issue.reported_by,
        reporter_name: issue.profiles?.full_name || 'Unknown',
        status: issue.status,
        priority: issue.priority,
        reported_date: issue.reported_date,
        resolved_date: issue.resolved_date
      })));

      setServiceBookings((bookingsData || []).map((booking: any) => ({
        id: booking.id,
        vehicle_id: booking.vehicle_id,
        vehicle_registration: booking.vehicles?.registration || 'Unknown',
        booking_type: booking.booking_type,
        start_date: booking.start_date,
        end_date: booking.end_date,
        notes: booking.notes,
        booked_by: booking.booked_by,
        booker_name: booking.profiles?.full_name || 'Unknown',
        status: booking.status
      })));

    } catch (error) {
      console.error("Error loading fleet data:", error);
      toast({
        title: "Error Loading Fleet Data",
        description: "Failed to load fleet information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleReportIssue() {
    if (!newIssue.vehicle_id || !newIssue.description) {
      toast({
        title: "Missing Information",
        description: "Please select a vehicle and describe the issue",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("fleet_issues")
        .insert([{
          vehicle_id: newIssue.vehicle_id,
          issue_type: newIssue.issue_type,
          description: newIssue.description,
          priority: newIssue.priority,
          reported_by: userId,
          status: "open"
        }]);

      if (error) throw error;

      toast({
        title: "✅ Issue Reported",
        description: "Fleet issue has been logged successfully"
      });

      setIssueDialogOpen(false);
      setNewIssue({
        vehicle_id: "",
        issue_type: "mechanical",
        description: "",
        priority: "medium"
      });
      loadFleetData();
    } catch (error) {
      console.error("Error reporting issue:", error);
      toast({
        title: "Error",
        description: "Failed to report issue",
        variant: "destructive"
      });
    }
  }

  async function handleBookService() {
    if (!newBooking.vehicle_id || !newBooking.start_date || !newBooking.end_date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("fleet_service_bookings")
        .insert([{
          vehicle_id: newBooking.vehicle_id,
          booking_type: newBooking.booking_type,
          start_date: newBooking.start_date,
          end_date: newBooking.end_date,
          notes: newBooking.notes,
          booked_by: userId,
          status: "scheduled"
        }]);

      if (error) throw error;

      toast({
        title: "✅ Service Booked",
        description: "Vehicle has been scheduled successfully"
      });

      setServiceDialogOpen(false);
      setNewBooking({
        vehicle_id: "",
        booking_type: "service",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        notes: ""
      });
      loadFleetData();
    } catch (error) {
      console.error("Error booking service:", error);
      toast({
        title: "Error",
        description: "Failed to book service",
        variant: "destructive"
      });
    }
  }

  async function resolveIssue(issueId: string) {
    try {
      const { error } = await supabase
        .from("fleet_issues")
        .update({ 
          status: "resolved",
          resolved_date: new Date().toISOString()
        })
        .eq("id", issueId);

      if (error) throw error;

      toast({
        title: "✅ Issue Resolved",
        description: "Issue marked as resolved"
      });

      loadFleetData();
    } catch (error) {
      console.error("Error resolving issue:", error);
    }
  }

  async function completeBooking(bookingId: string) {
    try {
      const { error } = await supabase
        .from("fleet_service_bookings")
        .update({ status: "completed" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "✅ Service Completed",
        description: "Booking marked as completed"
      });

      loadFleetData();
    } catch (error) {
      console.error("Error completing booking:", error);
    }
  }

  async function cancelBooking(bookingId: string) {
    try {
      const { error } = await supabase
        .from("fleet_service_bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Service booking has been cancelled"
      });

      loadFleetData();
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  }

  const getVehicleStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      available: "bg-green-100 text-green-800",
      in_use: "bg-blue-100 text-blue-800",
      maintenance: "bg-orange-100 text-orange-800",
      out_of_service: "bg-red-100 text-red-800"
    };
    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: { [key: string]: string } = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-orange-100 text-orange-800 border-orange-200",
      low: "bg-green-100 text-green-800 border-green-200"
    };
    return (
      <Badge variant="outline" className={colors[priority] || "bg-gray-100 text-gray-800"}>
        {priority}
      </Badge>
    );
  };

  const getIssueStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      open: "bg-red-100 text-red-800",
      in_progress: "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800"
    };
    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getBookingTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      service: "bg-blue-100 text-blue-800",
      mot: "bg-purple-100 text-purple-800",
      repair: "bg-red-100 text-red-800",
      cleaning: "bg-green-100 text-green-800",
      organisation: "bg-orange-100 text-orange-800"
    };
    return (
      <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  const canManageFleet = ["manager", "office", "admin"].includes(userRole);

  if (loading) {
    return (
      <DashboardLayout>
        <SEO title="Fleet Management - Harding Homes" />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading fleet data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEO title="Fleet Management - Harding Homes" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Fleet Management</h1>
            <p className="text-muted-foreground">Manage vehicles, report issues, and schedule services</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Fleet Issue</DialogTitle>
                  <DialogDescription>
                    Report a problem with a vehicle
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue-vehicle">Vehicle *</Label>
                    <Select 
                      value={newIssue.vehicle_id}
                      onValueChange={(value) => setNewIssue({ ...newIssue, vehicle_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.registration} - {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue-type">Issue Type</Label>
                    <Select
                      value={newIssue.issue_type}
                      onValueChange={(value) => setNewIssue({ ...newIssue, issue_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mechanical">Mechanical</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="body_damage">Body Damage</SelectItem>
                        <SelectItem value="tire">Tire/Wheel</SelectItem>
                        <SelectItem value="safety">Safety Concern</SelectItem>
                        <SelectItem value="cleanliness">Cleanliness</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newIssue.priority}
                      onValueChange={(value) => setNewIssue({ ...newIssue, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Can wait</SelectItem>
                        <SelectItem value="medium">Medium - Should fix soon</SelectItem>
                        <SelectItem value="high">High - Urgent/Safety issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue-description">Description *</Label>
                    <Textarea
                      id="issue-description"
                      placeholder="Describe the issue in detail..."
                      value={newIssue.description}
                      onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleReportIssue} className="bg-red-500 hover:bg-red-600">
                      Report Issue
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {canManageFleet && (
              <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book Vehicle Service</DialogTitle>
                    <DialogDescription>
                      Schedule a vehicle for service, repair, cleaning, or organisation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="booking-vehicle">Vehicle *</Label>
                      <Select
                        value={newBooking.vehicle_id}
                        onValueChange={(value) => setNewBooking({ ...newBooking, vehicle_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.registration} - {vehicle.make} {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="booking-type">Booking Type</Label>
                      <Select
                        value={newBooking.booking_type}
                        onValueChange={(value) => setNewBooking({ ...newBooking, booking_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="mot">MOT</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="organisation">Organisation Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date *</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={newBooking.start_date}
                          onChange={(e) => setNewBooking({ ...newBooking, start_date: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end-date">End Date *</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={newBooking.end_date}
                          onChange={(e) => setNewBooking({ ...newBooking, end_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="booking-notes">Notes (Optional)</Label>
                      <Textarea
                        id="booking-notes"
                        placeholder="Additional details about the booking..."
                        value={newBooking.notes}
                        onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                      <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBookService} className="bg-orange-500 hover:bg-orange-600">
                        Book Service
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Fleet Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Fleet Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fleetIssues.filter(i => i.status !== "resolved").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
                <p>No open issues - fleet is running smoothly!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    {canManageFleet && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleetIssues.filter(i => i.status !== "resolved").map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.vehicle_registration}</TableCell>
                      <TableCell className="capitalize">{issue.issue_type.replace('_', ' ')}</TableCell>
                      <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                      <TableCell>{getPriorityBadge(issue.priority)}</TableCell>
                      <TableCell>{issue.reporter_name}</TableCell>
                      <TableCell>{getIssueStatusBadge(issue.status)}</TableCell>
                      <TableCell>{new Date(issue.reported_date).toLocaleDateString()}</TableCell>
                      {canManageFleet && (
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveIssue(issue.id)}
                            className="text-green-600 border-green-500 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Service Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              Service Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviceBookings.filter(b => b.status !== "completed" && b.status !== "cancelled").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming service bookings</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Booked By</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    {canManageFleet && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceBookings.filter(b => b.status !== "completed" && b.status !== "cancelled").map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.vehicle_registration}</TableCell>
                      <TableCell>{getBookingTypeBadge(booking.booking_type)}</TableCell>
                      <TableCell>{new Date(booking.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(booking.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>{booking.booker_name}</TableCell>
                      <TableCell className="max-w-xs truncate">{booking.notes || '-'}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">{booking.status}</Badge>
                      </TableCell>
                      {canManageFleet && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => completeBooking(booking.id)}
                              className="text-green-600 border-green-500 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelBooking(booking.id)}
                              className="text-red-600 border-red-500 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-500" />
              Vehicle Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Make & Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>MOT Due</TableHead>
                  <TableHead>Service Due</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.registration}</TableCell>
                    <TableCell>{vehicle.make} {vehicle.model}</TableCell>
                    <TableCell>{getVehicleStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>{vehicle.assigned_to || 'Unassigned'}</TableCell>
                    <TableCell>{vehicle.mot_due ? new Date(vehicle.mot_due).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{vehicle.service_due ? new Date(vehicle.service_due).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{vehicle.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}