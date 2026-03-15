import Link from "next/link";
import { useRouter } from "next/router";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  LayoutDashboard, Users, Briefcase, Calendar, 
  FileText, Settings, TrendingUp, Building, 
  Package, Clock, DollarSign, Home, UserPlus, Shield, CalendarDays, Building2, BarChart3, Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/leads", label: "Leads", icon: UserPlus },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/team", label: "Team", icon: Users },
  { href: "/user-roles", label: "User Roles", icon: Shield },
  { href: "/my-week", label: "My Week", icon: CalendarDays },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/company", label: "Company", icon: Building2 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/pricing", label: "Pricing", icon: Calculator },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface NavigationProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function NavigationContent({ onItemClick }: { onItemClick?: () => void }) {
  const router = useRouter();

  return (
    <>
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
        {menuItems.map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive 
                  ? "bg-primary text-primary-foreground font-medium" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
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
    </>
  );
}

export function Navigation({ mobileOpen, onMobileClose }: NavigationProps) {
  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <nav className="hidden lg:flex w-64 bg-secondary flex-shrink-0 border-r border-border flex-col">
        <NavigationContent />
      </nav>

      {/* Mobile Navigation - Drawer */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <NavigationContent onItemClick={onMobileClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}