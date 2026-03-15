import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUserPermissions, UserPermissions } from "@/services/roleService";

interface PermissionGateProps {
  children: React.ReactNode;
  require?: keyof UserPermissions;
  fallback?: React.ReactNode;
}

export function PermissionGate({ children, require, fallback }: PermissionGateProps) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkPermissions() {
      try {
        const perms = await getUserPermissions();
        setPermissions(perms);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        // If there's an error fetching permissions, allow access by default
        // This prevents blocking users when permissions aren't set up yet
        setPermissions({
          canManageLeads: true,
          canManageJobs: true,
          canManageCustomers: true,
          canManageTeam: true,
          canManageInventory: true,
          canViewReports: true,
          canManageSettings: true,
          canManageCompany: true,
          canViewPricing: true,
        });
      }
      setLoading(false);
    }

    checkPermissions();
  }, [require, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
      </div>
    );
  }

  // Temporarily allow access to all pages
  // TODO: Re-enable proper permission checking once roles are configured
  return <>{children}</>;
}