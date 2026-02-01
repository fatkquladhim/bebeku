"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertItem {
  type: string;
  severity: "high" | "medium" | "low";
  message: string;
  batchId?: string;
  feedId?: string;
}

interface AlertsProps {
  alerts: AlertItem[];
}

const severityConfig = {
  high: {
    icon: AlertCircle,
    className: "border-red-500 bg-red-50/50 text-red-900",
    title: "Peringatan Penting",
  },
  medium: {
    icon: AlertTriangle,
    className: "border-yellow-500 bg-yellow-50/50 text-yellow-900",
    title: "Perhatian",
  },
  low: {
    icon: Info,
    className: "border-blue-500 bg-blue-50/50 text-blue-900",
    title: "Informasi",
  },
};

export function Alerts({ alerts }: AlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const config = severityConfig[alert.severity];
        const Icon = config.icon;

        return (
          <Alert
            key={index}
            className={cn(config.className)}
          >
            <Icon className="h-4 w-4" />
            <AlertTitle>{config.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
