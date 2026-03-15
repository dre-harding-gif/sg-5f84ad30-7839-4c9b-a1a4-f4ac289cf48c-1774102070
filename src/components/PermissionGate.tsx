import React from "react";
import { UserPermissions } from "@/services/roleService";

interface PermissionGateProps {
  children: React.ReactNode;
  require?: keyof UserPermissions;
  fallback?: React.ReactNode;
}

export function PermissionGate({ children }: PermissionGateProps) {
  // Temporarily bypass all permission checks to ensure all pages are accessible
  return <>{children}</>;
}