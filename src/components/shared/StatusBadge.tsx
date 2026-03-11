"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "destructive" | "secondary" | "default";

const statusMap: Record<string, StatusVariant> = {
  // Borrow statuses
  borrowed: "default",
  returned: "success",
  overdue: "destructive",
  lost: "destructive",
  // Fine statuses
  pending: "warning",
  paid: "success",
  waived: "secondary",
  // Reservation statuses
  ready: "success",
  fulfilled: "success",
  cancelled: "secondary",
  expired: "destructive",
  // Payment statuses
  completed: "success",
  failed: "destructive",
  refunded: "secondary",
  // Member/User statuses
  active: "success",
  inactive: "destructive",
  // Membership types
  standard: "default",
  premium: "success",
  student: "secondary",
};

const variantClasses: Record<StatusVariant, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  default: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusMap[status.toLowerCase()] || "default";

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent font-medium capitalize",
        variantClasses[variant],
        className
      )}
    >
      {status}
    </Badge>
  );
}
