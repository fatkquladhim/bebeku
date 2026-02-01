"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Users, Skull, Egg, TrendingUp, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  skull: Skull,
  egg: Egg,
  trendingUp: TrendingUp,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  iconName: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  alert?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  iconName,
  trend,
  className,
  alert,
}: StatsCardProps) {
  const Icon = iconMap[iconName] || Users;

  return (
    <Card className={cn(alert && "border-red-500 bg-red-50/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon
          className={cn(
            "h-4 w-4",
            alert ? "text-red-500" : "text-muted-foreground"
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">vs kemarin</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
