"use client";

import { useAuth } from "@/hooks/useAuth";
import { useGetDashboardStatsQuery } from "@/store/api/reportApi";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Users,
  BookCopy,
  CircleDollarSign,
  AlertTriangle,
  CalendarClock,
  LayoutDashboard,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { IBook, IMember } from "@/types";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { data, isLoading } = useGetDashboardStatsQuery(undefined, {
    skip: !isAdmin,
  });

  if (!isAdmin) {
    return <UserDashboard />;
  }

  if (isLoading) return <PageLoader />;

  const stats = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your library system"
        icon={LayoutDashboard}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total Books"
          value={stats?.totalBooks ?? 0}
          icon={BookOpen}
        />
        <StatsCard
          title="Total Members"
          value={stats?.totalMembers ?? 0}
          icon={Users}
        />
        <StatsCard
          title="Active Borrows"
          value={stats?.totalBorrows ?? 0}
          icon={BookCopy}
        />
        <StatsCard
          title="Pending Fines"
          value={stats?.totalFines ?? 0}
          icon={CircleDollarSign}
        />
        <StatsCard
          title="Overdue Books"
          value={stats?.overdueBooks ?? 0}
          icon={AlertTriangle}
        />
        <StatsCard
          title="Reservations"
          value={stats?.activeReservations ?? 0}
          icon={CalendarClock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Borrows</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentBorrows && stats.recentBorrows.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentBorrows.map((borrow) => (
                    <TableRow key={borrow._id}>
                      <TableCell className="font-medium">
                        {(borrow.book as IBook)?.title || "N/A"}
                      </TableCell>
                      <TableCell>
                        {(borrow.member as IMember)?.membershipId || "N/A"}
                      </TableCell>
                      <TableCell>{formatDate(borrow.dueDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={borrow.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent borrows
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Returns</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentReturns && stats.recentReturns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Returned</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentReturns.map((borrow) => (
                    <TableRow key={borrow._id}>
                      <TableCell className="font-medium">
                        {(borrow.book as IBook)?.title || "N/A"}
                      </TableCell>
                      <TableCell>
                        {(borrow.member as IMember)?.membershipId || "N/A"}
                      </TableCell>
                      <TableCell>
                        {borrow.returnDate
                          ? formatDate(borrow.returnDate)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={borrow.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent returns
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UserDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to LibraHub"
        icon={LayoutDashboard}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Browse Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Explore our collection of books and reserve your favourites.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookCopy className="h-5 w-5" />
              My Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View your borrows, reservations, and fines from the sidebar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
