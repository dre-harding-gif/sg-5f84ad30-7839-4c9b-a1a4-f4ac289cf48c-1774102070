import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp, 
  UserCircle,
  BarChart3,
  Settings,
  PoundSterling,
  Package,
  Building
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: TrendingUp },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Team", href: "/team", icon: UserCircle },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Company Hub", href: "/company", icon: Building },
  { name: "Pricing Guide", href: "/pricing", icon: PoundSterling },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Navigation() {
  const router = useRouter();

  return (
    <nav className="w-64 bg-primary text-white flex-shrink-0 hidden lg:block">
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <h1 className="text-xl font-heading font-bold">Harding Homes</h1>
        </div>

        <ul className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}