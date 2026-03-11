export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export const MEMBERSHIP_TYPES = {
  STANDARD: "standard",
  PREMIUM: "premium",
  STUDENT: "student",
} as const;

export const BORROW_STATUS = {
  BORROWED: "borrowed",
  RETURNED: "returned",
  OVERDUE: "overdue",
  LOST: "lost",
} as const;

export const FINE_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  WAIVED: "waived",
} as const;

export const RESERVATION_STATUS = {
  PENDING: "pending",
  READY: "ready",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export const PAYMENT_METHODS = {
  STRIPE: "stripe",
  CASH: "cash",
  CARD: "card",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const ITEMS_PER_PAGE = 10;

export const NAV_ITEMS = {
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Books", href: "/dashboard/books", icon: "BookOpen" },
    { label: "Categories", href: "/dashboard/categories", icon: "Tags" },
    { label: "Members", href: "/dashboard/members", icon: "Users" },
    { label: "Borrows", href: "/dashboard/borrows", icon: "BookCopy" },
    { label: "Fines", href: "/dashboard/fines", icon: "CircleDollarSign" },
    { label: "Reservations", href: "/dashboard/reservations", icon: "CalendarClock" },
    { label: "Payments", href: "/dashboard/payments", icon: "CreditCard" },
    { label: "Users", href: "/dashboard/users", icon: "UserCog" },
    { label: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
  ],
  user: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Books", href: "/dashboard/books", icon: "BookOpen" },
    { label: "My Borrows", href: "/dashboard/my-borrows", icon: "BookCopy" },
    { label: "My Reservations", href: "/dashboard/my-reservations", icon: "CalendarClock" },
    { label: "My Fines", href: "/dashboard/my-fines", icon: "CircleDollarSign" },
    { label: "My Payments", href: "/dashboard/my-payments", icon: "CreditCard" },
  ],
} as const;
