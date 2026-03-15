import { useEffect, useState, ReactNode } from "react";
import { getUserPermissions, type UserPermissions } from "@/services/roleService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

interface PermissionGateProps {
  children: ReactNode;
  require?: keyof UserPermissions | (keyof UserPermissions)[];
  requireAll?: boolean; // If true, user must have ALL specified permissions. If false, ANY permission is enough.
  fallback?: ReactNode;
  showMessage?: boolean;
}

export function PermissionGate({ 
  children, 
  require,
  requireAll = false,
  fallback,
  showMessage = true,
}: PermissionGateProps) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      const perms = await getUserPermissions();
      setPermissions(perms);
      setLoading(false);
    }
    loadPermissions();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!permissions || !require) {
    return <>{children}</>;
  }

  const requiredPermissions = Array.isArray(require) ? require : [require];
  
  const hasAccess = requireAll
    ? requiredPermissions.every(perm => permissions[perm] === true)
    : requiredPermissions.some(perm => permissions[perm] === true);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showMessage) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <Alert className="max-w-md">
            <Lock className="h-4 w-4" />
            <AlertDescription className="ml-2">
              You don&apos;t have permission to access this feature. Please contact your administrator.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}