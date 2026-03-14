import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  FileText, 
  ShoppingCart,
  BarChart3,
  Settings
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Job Sheets", href: "/job-sheets", icon: FileText },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Navigation() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 h-screen w-64 bg-primary text-primary-foreground p-6 hidden lg:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Harding Homes</h1>
        <p className="text-sm text-primary-foreground/70 mt-1">Job Management</p>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary-foreground/10 text-primary-foreground font-medium" 
                    : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}