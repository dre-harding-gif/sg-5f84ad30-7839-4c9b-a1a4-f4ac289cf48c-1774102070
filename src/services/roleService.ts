import { supabase } from "@/integrations/supabase/client";

export type UserRole = "owner" | "office_manager" | "site_manager" | "builder" | "customer";

export interface UserPermissions {
  view_dashboard: boolean;
  view_jobs: boolean;
  edit_jobs: boolean;
  view_schedule: boolean;
  edit_schedule: boolean;
  view_team: boolean;
  edit_team: boolean;
  view_customers: boolean;
  edit_customers: boolean;
  view_leads: boolean;
  edit_leads: boolean;
  view_inventory: boolean;
  edit_inventory: boolean;
  view_pricing: boolean;
  edit_pricing: boolean;
  view_company: boolean;
  edit_company: boolean;
  view_reports: boolean;
  view_settings: boolean;
  edit_settings: boolean;
}

export async function getCurrentUserPermissions(): Promise<UserPermissions | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_permissions")
      .select("permissions")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data.permissions as UserPermissions;
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return null;
  }
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return data.role as UserRole;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    return false;
  }
}

export async function canAccessPage(pageName: string): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  if (!permissions) return false;

  const pagePermissionMap: Record<string, keyof UserPermissions> = {
    "/": "view_dashboard",
    "/jobs": "view_jobs",
    "/schedule": "view_schedule",
    "/team": "view_team",
    "/customers": "view_customers",
    "/leads": "view_leads",
    "/inventory": "view_inventory",
    "/pricing": "view_pricing",
    "/company": "view_company",
    "/reports": "view_reports",
    "/settings": "view_settings",
  };

  const requiredPermission = pagePermissionMap[pageName];
  return requiredPermission ? permissions[requiredPermission] : false;
}