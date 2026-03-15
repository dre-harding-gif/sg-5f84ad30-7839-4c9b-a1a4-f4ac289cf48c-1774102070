import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type UserRole = "owner" | "office_manager" | "site_manager" | "builder" | "customer";

export interface UserPermissions {
  role: UserRole;
  // Dashboard & Core
  view_dashboard: boolean;
  view_analytics: boolean;
  
  // Leads Management
  view_leads: boolean;
  manage_leads: boolean;
  convert_leads: boolean;
  
  // Jobs Management
  view_jobs: boolean;
  create_jobs: boolean;
  edit_jobs: boolean;
  delete_jobs: boolean;
  assign_jobs: boolean;
  
  // Customer Management
  view_customers: boolean;
  manage_customers: boolean;
  
  // Schedule & Team
  view_schedule: boolean;
  manage_schedule: boolean;
  view_team: boolean;
  manage_team: boolean;
  
  // Inventory
  view_inventory: boolean;
  manage_inventory: boolean;
  checkout_tools: boolean;
  
  // Financial
  view_pricing: boolean;
  manage_pricing: boolean;
  create_quotes: boolean;
  create_invoices: boolean;
  view_reports: boolean;
  
  // Company Settings
  view_company: boolean;
  manage_company: boolean;
  manage_settings: boolean;
}

// Permission templates for each role
const rolePermissions: Record<UserRole, Partial<UserPermissions>> = {
  owner: {
    // Full access to everything
    view_dashboard: true,
    view_analytics: true,
    view_leads: true,
    manage_leads: true,
    convert_leads: true,
    view_jobs: true,
    create_jobs: true,
    edit_jobs: true,
    delete_jobs: true,
    assign_jobs: true,
    view_customers: true,
    manage_customers: true,
    view_schedule: true,
    manage_schedule: true,
    view_team: true,
    manage_team: true,
    view_inventory: true,
    manage_inventory: true,
    checkout_tools: true,
    view_pricing: true,
    manage_pricing: true,
    create_quotes: true,
    create_invoices: true,
    view_reports: true,
    view_company: true,
    manage_company: true,
    manage_settings: true,
  },
  office_manager: {
    // Office operations, scheduling, customer management
    view_dashboard: true,
    view_analytics: true,
    view_leads: true,
    manage_leads: true,
    convert_leads: true,
    view_jobs: true,
    create_jobs: true,
    edit_jobs: true,
    assign_jobs: true,
    view_customers: true,
    manage_customers: true,
    view_schedule: true,
    manage_schedule: true,
    view_team: true,
    view_inventory: true,
    manage_inventory: true,
    view_pricing: true,
    create_quotes: true,
    create_invoices: true,
    view_reports: true,
    view_company: true,
    delete_jobs: false,
    manage_team: false,
    manage_pricing: false,
    manage_company: false,
    manage_settings: false,
    checkout_tools: true,
  },
  site_manager: {
    // Job management, team coordination, inventory
    view_dashboard: true,
    view_analytics: false,
    view_leads: false,
    view_jobs: true,
    create_jobs: true,
    edit_jobs: true,
    assign_jobs: true,
    view_customers: true,
    view_schedule: true,
    manage_schedule: true,
    view_team: true,
    view_inventory: true,
    manage_inventory: true,
    checkout_tools: true,
    view_pricing: true,
    create_quotes: false,
    view_reports: false,
    view_company: false,
    manage_leads: false,
    convert_leads: false,
    delete_jobs: false,
    manage_customers: false,
    manage_team: false,
    manage_pricing: false,
    create_invoices: false,
    manage_company: false,
    manage_settings: false,
  },
  builder: {
    // View assigned jobs, check inventory, track time
    view_dashboard: true,
    view_jobs: true,
    view_schedule: true,
    view_inventory: true,
    checkout_tools: true,
    view_customers: false,
    view_analytics: false,
    view_leads: false,
    manage_leads: false,
    convert_leads: false,
    create_jobs: false,
    edit_jobs: false,
    delete_jobs: false,
    assign_jobs: false,
    manage_customers: false,
    manage_schedule: false,
    view_team: false,
    manage_team: false,
    manage_inventory: false,
    view_pricing: false,
    manage_pricing: false,
    create_quotes: false,
    create_invoices: false,
    view_reports: false,
    view_company: false,
    manage_company: false,
    manage_settings: false,
  },
  customer: {
    // Portal access only - view their own jobs
    view_dashboard: false,
    view_jobs: true, // Only their own jobs
    view_analytics: false,
    view_leads: false,
    manage_leads: false,
    convert_leads: false,
    create_jobs: false,
    edit_jobs: false,
    delete_jobs: false,
    assign_jobs: false,
    view_customers: false,
    manage_customers: false,
    view_schedule: false,
    manage_schedule: false,
    view_team: false,
    manage_team: false,
    view_inventory: false,
    manage_inventory: false,
    checkout_tools: false,
    view_pricing: false,
    manage_pricing: false,
    create_quotes: false,
    create_invoices: false,
    view_reports: false,
    view_company: false,
    manage_company: false,
    manage_settings: false,
  },
};

export async function getUserPermissions(userId?: string): Promise<UserPermissions> {
  try {
    let targetUserId = userId;
    
    if (!targetUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { role: "builder", ...rolePermissions.builder } as UserPermissions;
      }
      targetUserId = session.user.id;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role, permissions")
      .eq("id", targetUserId)
      .single();

    if (error || !data) {
      console.error("Error fetching permissions:", error);
      return { role: "builder", ...rolePermissions.builder } as UserPermissions;
    }

    const role = (data.role || "builder") as UserRole;
    const basePermissions = rolePermissions[role] || rolePermissions.builder;
    
    // Merge role permissions with any custom permissions
    const customPermissions = data.permissions || {};
    
    return {
      role,
      ...basePermissions,
      ...customPermissions,
    } as UserPermissions;
  } catch (error) {
    console.error("Error in getUserPermissions:", error);
    return { role: "builder", ...rolePermissions.builder } as UserPermissions;
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
  try {
    const permissions = rolePermissions[role];
    
    const { error } = await supabase
      .from("profiles")
      .update({ 
        role,
        permissions,
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user role:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function updateCustomPermissions(
  userId: string, 
  permissions: Partial<UserPermissions>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ permissions })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update permissions" };
  }
}

export async function getAllUsers(): Promise<Tables<"profiles">[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return [];
  }
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    owner: "Owner",
    office_manager: "Office Manager",
    site_manager: "Site Manager",
    builder: "Builder",
    customer: "Customer",
  };
  return displayNames[role] || role;
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    owner: "bg-purple-100 text-purple-800",
    office_manager: "bg-blue-100 text-blue-800",
    site_manager: "bg-green-100 text-green-800",
    builder: "bg-orange-100 text-orange-800",
    customer: "bg-gray-100 text-gray-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
}