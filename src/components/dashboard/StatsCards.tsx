import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Briefcase, Calendar, DollarSign } from "lucide-react";

const stats = [
  {
    label: "Active Jobs",
    value: "12",
    change: "+2 from last week",
    trend: "up",
    icon: Briefcase,
    color: "text-info"
  },
  {
    label: "New Leads",
    value: "8",
    change: "+3 from last week",
    trend: "up",
    icon: Users,
    color: "text-success"
  },
  {
    label: "Scheduled This Week",
    value: "15",
    change: "2 jobs today",
    trend: "neutral",
    icon: Calendar,
    color: "text-warning"
  },
  {
    label: "Revenue This Month",
    value: "£24,500",
    change: "+12% from last month",
    trend: "up",
    icon: DollarSign,
    color: "text-accent"
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
        
        return (
          <Card key={stat.label} className="p-6 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend !== "neutral" && (
                    <TrendIcon className={`w-4 h-4 ${stat.trend === "up" ? "text-success" : "text-destructive"}`} />
                  )}
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}