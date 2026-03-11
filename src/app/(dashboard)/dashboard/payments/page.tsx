"use client";

import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { usePagination } from "@/hooks/usePagination";
import { useRequireAuth } from "@/hooks/useAuth";
import {
  useGetPaymentsQuery,
  useRecordManualPaymentMutation,
} from "@/store/api/paymentApi";
import { useGetFinesQuery } from "@/store/api/fineApi";
import { manualPaymentSchema, type ManualPaymentFormData } from "@/lib/validations";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { IMember, IFine, IUser } from "@/types";

export default function PaymentsPage() {
  useRequireAuth("admin");
  const { page, limit, search, setPage, setSearch } = usePagination();
  const { data, isLoading } = useGetPaymentsQuery({ page, limit, search });
  const [manualOpen, setManualOpen] = useState(false);

  if (isLoading) return <PageLoader />;

  const payments = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="View and manage payment records"
        icon={CreditCard}
        actions={
          <Button onClick={() => setManualOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search payments..."
      />

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <EmptyState title="No payments found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-mono text-xs">
                      {payment.transactionId}
                    </TableCell>
                    <TableCell>
                      {((payment.member as IMember)?.user as IUser)?.name ||
                        (payment.member as IMember)?.membershipId ||
                        "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.method}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>
                      {payment.paidAt
                        ? formatDate(payment.paidAt)
                        : formatDate(payment.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {meta && <DataPagination meta={meta} onPageChange={setPage} />}

      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Manual Payment</DialogTitle>
          </DialogHeader>
          <ManualPaymentForm onSuccess={() => setManualOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ManualPaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const [recordPayment, { isLoading }] = useRecordManualPaymentMutation();
  const { data: finesData } = useGetFinesQuery({ status: "pending" } as Record<string, string>);
  const pendingFines = (finesData?.data || []).filter(
    (f) => f.status === "pending"
  );

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ManualPaymentFormData>({
    resolver: zodResolver(manualPaymentSchema),
  });

  const onSubmit = async (data: ManualPaymentFormData) => {
    try {
      await recordPayment(data).unwrap();
      toast.success("Payment recorded");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to record payment");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Pending Fine *</Label>
        <Select onValueChange={(val) => setValue("fineId", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select fine" />
          </SelectTrigger>
          <SelectContent>
            {pendingFines.map((f) => (
              <SelectItem key={f._id} value={f._id}>
                {formatCurrency(f.amount)} — {f.reason}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.fineId && (
          <p className="text-sm text-destructive">{errors.fineId.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Payment Method *</Label>
        <Select onValueChange={(val) => setValue("method", val as "cash" | "card")}>
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
        {errors.method && (
          <p className="text-sm text-destructive">{errors.method.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Record Payment
      </Button>
    </form>
  );
}
