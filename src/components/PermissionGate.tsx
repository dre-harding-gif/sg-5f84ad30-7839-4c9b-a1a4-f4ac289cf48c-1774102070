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
      const perms = await getUserPermissions();
      setPermissions(perms);
      setLoading(false);

      if (require && perms && !perms[require]) {
        router.push("/");
      }
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

  if (!permissions || (require && !permissions[require])) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}