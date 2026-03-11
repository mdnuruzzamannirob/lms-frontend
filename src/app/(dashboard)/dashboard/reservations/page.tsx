"use client";

import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { usePagination } from "@/hooks/usePagination";
import { useRequireAuth } from "@/hooks/useAuth";
import {
  useGetReservationsQuery,
  useCancelReservationMutation,
} from "@/store/api/reservationApi";
import { formatDate } from "@/lib/utils";
import type { IBook, IMember, IUser } from "@/types";

export default function ReservationsPage() {
  useRequireAuth("admin");
  const { page, limit, search, setPage, setSearch } = usePagination();
  const { data, isLoading } = useGetReservationsQuery({
    page,
    limit,
    search,
  });
  const [cancelReservation] = useCancelReservationMutation();

  const handleCancel = async (id: string) => {
    try {
      await cancelReservation(id).unwrap();
      toast.success("Reservation cancelled");
    } catch {
      toast.error("Failed to cancel reservation");
    }
  };

  if (isLoading) return <PageLoader />;

  const reservations = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        description="Manage book reservations"
        icon={CalendarClock}
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search reservations..."
      />

      <Card>
        <CardContent className="p-0">
          {reservations.length === 0 ? (
            <EmptyState title="No reservations found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Reserved</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((res) => (
                  <TableRow key={res._id}>
                    <TableCell className="font-medium">
                      {(res.book as IBook)?.title || "—"}
                    </TableCell>
                    <TableCell>
                      {((res.member as IMember)?.user as IUser)?.name ||
                        (res.member as IMember)?.membershipId ||
                        "—"}
                    </TableCell>
                    <TableCell>#{res.position}</TableCell>
                    <TableCell>{formatDate(res.reservedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={res.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {res.status === "pending" || res.status === "ready" ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancel(res._id)}
                        >
                          Cancel
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {meta && <DataPagination meta={meta} onPageChange={setPage} />}
    </div>
  );
}
