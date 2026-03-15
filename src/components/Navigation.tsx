import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Users, Briefcase, Calendar, 
  FileText, Settings, TrendingUp, Building, 
  Package, Clock, DollarSign
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: TrendingUp },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Team", href: "/team", icon: Users },
  { name: "My Week", href: "/my-week", icon: Clock },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Company", href: "/company", icon: Building },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Pricing", href: "/pricing", icon: DollarSign },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Navigation() {
  const router = useRouter();

  return (
    <nav className="w-64 bg-secondary flex-shrink-0 border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-lg text-foreground">Harding Homes</h1>
            <p className="text-xs text-muted-foreground">Job Management</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href} passHref legacyBehavior>
              <a>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  asChild
                >
                  <span>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </span>
                </Button>
              </a>
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p className="font-semibold text-foreground mb-1">Harding Homes Ltd</p>
          <p>Building Excellence Since 2010</p>
        </div>
      </div>
    </nav>
  );
}