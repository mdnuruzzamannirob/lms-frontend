"use client";

import { CircleDollarSign } from "lucide-react";
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
  useGetFinesQuery,
  usePayFineMutation,
  useWaiveFineMutation,
} from "@/store/api/fineApi";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { IMember, IUser } from "@/types";

export default function FinesPage() {
  useRequireAuth("admin");
  const { page, limit, search, setPage, setSearch } = usePagination();
  const { data, isLoading } = useGetFinesQuery({ page, limit, search });
  const [payFine] = usePayFineMutation();
  const [waiveFine] = useWaiveFineMutation();

  const handlePay = async (id: string) => {
    try {
      await payFine(id).unwrap();
      toast.success("Fine marked as paid");
    } catch {
      toast.error("Failed to mark fine as paid");
    }
  };

  const handleWaive = async (id: string) => {
    try {
      await waiveFine(id).unwrap();
      toast.success("Fine waived");
    } catch {
      toast.error("Failed to waive fine");
    }
  };

  if (isLoading) return <PageLoader />;

  const fines = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fines"
        description="Manage member fines"
        icon={CircleDollarSign}
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search fines..."
      />

      <Card>
        <CardContent className="p-0">
          {fines.length === 0 ? (
            <EmptyState title="No fines found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fines.map((fine) => (
                  <TableRow key={fine._id}>
                    <TableCell>
                      {((fine.member as IMember)?.user as IUser)?.name ||
                        (fine.member as IMember)?.membershipId ||
                        "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(fine.amount)}
                    </TableCell>
                    <TableCell>{fine.reason}</TableCell>
                    <TableCell>
                      <StatusBadge status={fine.status} />
                    </TableCell>
                    <TableCell>{formatDate(fine.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {fine.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePay(fine._id)}
                          >
                            Mark Paid
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleWaive(fine._id)}
                          >
                            Waive
                          </Button>
                        </div>
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
