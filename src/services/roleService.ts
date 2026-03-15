import { supabase } from "@/integrations/supabase/client";

export type UserRole = "owner" | "office_manager" | "site_manager" | "builder";

export interface UserPermissions {
  role: UserRole;
  view_dashboard: boolean;
  view_jobs: boolean;
  view_schedule: boolean;
  view_team: boolean;
  view_company: boolean;
  view_inventory: boolean;
  view_reports: boolean;
  manage_team: boolean;
  view_customers: boolean;
  view_leads: boolean;
  view_pricing: boolean;
}

const defaultPermissions: UserPermissions = {
  role: "builder",
  view_dashboard: true,
  view_jobs: false,
  view_schedule: false,
  view_team: false,
  view_company: false,
  view_inventory: true,
  view_reports: false,
  manage_team: false,
  view_customers: false,
  view_leads: false,
  view_pricing: false,
};

export async function getUserPermissions(): Promise<UserPermissions> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return defaultPermissions;

    const { data } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (data && data.permissions) {
       const perms = typeof data.permissions === 'object' ? data.permissions : {};
       return {
         role: data.role as UserRole,
         ...perms
       } as unknown as UserPermissions;
    }
    return defaultPermissions;
  } catch (error) {
    return defaultPermissions;
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    return !error;
  } catch (error) {
    return false;
  }
}