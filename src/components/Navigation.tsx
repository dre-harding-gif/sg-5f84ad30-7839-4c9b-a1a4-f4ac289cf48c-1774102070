import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getCurrentUserPermissions, getCurrentUserRole, UserPermissions, UserRole } from "@/services/roleService";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Users,
  UserCircle,
  Package,
  PoundSterling,
  Building,
  ClipboardList,
  Settings,
  CalendarDays
} from "lucide-react";

const allNavItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: "view_dashboard" as keyof UserPermissions },
  { name: "My Week", href: "/my-week", icon: CalendarDays, roles: ["builder", "site_manager"] },
  { name: "Leads", href: "/leads", icon: ClipboardList, permission: "view_leads" as keyof UserPermissions },
  { name: "Jobs", href: "/jobs", icon: Briefcase, permission: "view_jobs" as keyof UserPermissions },
  { name: "Customers", href: "/customers", icon: UserCircle, permission: "view_customers" as keyof UserPermissions },
  { name: "Team", href: "/team", icon: Users, permission: "view_team" as keyof UserPermissions },
  { name: "Schedule", href: "/schedule", icon: Calendar, permission: "view_schedule" as keyof UserPermissions },
  { name: "Inventory", href: "/inventory", icon: Package, permission: "view_inventory" as keyof UserPermissions },
  { name: "Pricing", href: "/pricing", icon: PoundSterling, permission: "view_pricing" as keyof UserPermissions },
  { name: "Company", href: "/company", icon: Building, permission: "view_company" as keyof UserPermissions },
  { name: "Reports", href: "/reports", icon: ClipboardList, permission: "view_reports" as keyof UserPermissions },
  { name: "Settings", href: "/settings", icon: Settings, permission: "view_settings" as keyof UserPermissions },
];

export function Navigation() {
  const router = useRouter();
  const [navItems, setNavItems] = useState(allNavItems);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    async function filterNavigation() {
      const permissions = await getCurrentUserPermissions();
      const role = await getCurrentUserRole();
      setUserRole(role);

      if (!permissions) {
        setNavItems([]);
        return;
      }

      const filtered = allNavItems.filter(item => {
        // Check role-specific items (like My Week for builders)
        if (item.roles) {
          return role && item.roles.includes(role);
        }
        // Check permission-based items
        if (item.permission) {
          return permissions[item.permission];
        }
        return true;
      });

      setNavItems(filtered);
    }

    filterNavigation();
  }, []);

  return (
    <nav className="bg-white border-r border-gray-200 w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-blue-900">Harding Homes</h2>
        {userRole && (
          <p className="text-xs text-gray-500 mt-1 capitalize">
            {userRole.replace("_", " ")} Portal
          </p>
        )}
      </div>
      <div className="space-y-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}