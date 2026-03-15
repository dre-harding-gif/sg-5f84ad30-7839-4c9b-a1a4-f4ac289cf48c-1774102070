import { ReactNode } from "react";

interface PermissionGateProps {
  children: ReactNode;
  require?: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showMessage?: boolean;
}

/**
 * PermissionGate Component
 * 
 * TEMPORARILY DISABLED - All users have full access
 * This allows the owner to access all features while setting up the system
 * 
 * To re-enable: Uncomment the permission checking logic below
 */
export function PermissionGate({ children }: PermissionGateProps) {
  // All users have full access - no permission checks
  return <>{children}</>;
}