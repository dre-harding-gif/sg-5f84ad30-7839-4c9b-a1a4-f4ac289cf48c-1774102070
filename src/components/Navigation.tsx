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
    <nav className="w-64 bg-secondary text-white flex-shrink-0 border-r border-white/10">
      <div className="p-4 space-y-1">
        <div className="mb-6 pb-4 border-b border-white/10">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Main Menu
          </p>
        </div>
        
        {navigation.map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive 
                    ? "bg-primary text-white hover:bg-primary/90" 
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-secondary">
        <div className="text-xs text-white/60 text-center">
          <p className="font-semibold text-white mb-1">Harding Homes Ltd</p>
          <p>Building Excellence Since 2010</p>
        </div>
      </div>
    </nav>
  );
}