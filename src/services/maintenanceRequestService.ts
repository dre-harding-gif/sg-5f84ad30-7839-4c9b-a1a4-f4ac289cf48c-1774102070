import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MaintenanceRequest = Database["public"]["Tables"]["maintenance_requests"]["Row"];
type MaintenanceRequestInsert = Database["public"]["Tables"]["maintenance_requests"]["Insert"];

export const maintenanceRequestService = {
  // Get all maintenance requests for a customer
  async getCustomerRequests(customerId: string) {
    const { data, error } = await supabase
      .from("maintenance_requests")
      .select(`
        *,
        jobs!maintenance_requests_job_id_fkey(
          id,
          job_name,
          address
        )
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    console.log("Get customer maintenance requests:", { data, error });
    if (error) console.error("Error fetching customer requests:", error);
    return { data: data || [], error };
  },

  // Get all maintenance requests for staff (with filters)
  async getAllRequests(filters?: {
    status?: string;
    priority?: string;
    jobId?: string;
  }) {
    let query = supabase
      .from("maintenance_requests")
      .select(`
        *,
        jobs!maintenance_requests_job_id_fkey(
          id,
          job_name,
          address
        ),
        customers!maintenance_requests_customer_id_fkey(
          id,
          name,
          email,
          phone
        )
      `);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }
    if (filters?.jobId) {
      query = query.eq("job_id", filters.jobId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    console.log("Get all maintenance requests:", { data, error });
    if (error) console.error("Error fetching all requests:", error);
    return { data: data || [], error };
  },

  // Create a new maintenance request
  async createRequest(request: MaintenanceRequestInsert) {
    const { data, error } = await supabase
      .from("maintenance_requests")
      .insert(request)
      .select()
      .single();

    console.log("Create maintenance request:", { data, error });
    if (error) console.error("Error creating maintenance request:", error);
    return { data, error };
  },

  // Update a maintenance request (staff only)
  async updateRequest(id: string, updates: Partial<MaintenanceRequestInsert>) {
    const { data, error } = await supabase
      .from("maintenance_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    console.log("Update maintenance request:", { data, error });
    if (error) console.error("Error updating maintenance request:", error);
    return { data, error };
  },

  // Add staff notes to a request
  async addStaffNotes(id: string, notes: string) {
    return this.updateRequest(id, { staff_notes: notes });
  },

  // Change request status
  async updateStatus(id: string, status: string) {
    return this.updateRequest(id, { status });
  },

  // Delete a maintenance request
  async deleteRequest(id: string) {
    const { error } = await supabase
      .from("maintenance_requests")
      .delete()
      .eq("id", id);

    console.log("Delete maintenance request:", { error });
    if (error) console.error("Error deleting maintenance request:", error);
    return { error };
  }
};