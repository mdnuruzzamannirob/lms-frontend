"use client";

import {
  BookCopy,
  CalendarClock,
  CircleDollarSign,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRequireAuth } from "@/hooks/useAuth";
import {
  useGetMyBorrowsQuery,
  useRenewBookMutation,
} from "@/store/api/borrowApi";
import { useGetMyFinesQuery } from "@/store/api/fineApi";
import {
  useGetMyReservationsQuery,
  useCreateReservationMutation,
  useCancelReservationMutation,
} from "@/store/api/reservationApi";
import {
  useGetMyPaymentsQuery,
  useCreateStripePaymentMutation,
} from "@/store/api/paymentApi";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  IBook,
  IMember,
  IUser,
  IBorrowRecord,
  IFine,
  IReservation,
  IPayment,
} from "@/types";

export default function MyLibraryPage() {
  useRequireAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Library"
        description="View your borrows, reservations, fines and payments"
        icon={BookCopy}
      />

      <Tabs defaultValue="borrows">
        <TabsList>
          <TabsTrigger value="borrows">
            <BookCopy className="mr-1.5 h-4 w-4" />
            Borrows
          </TabsTrigger>
          <TabsTrigger value="reservations">
            <CalendarClock className="mr-1.5 h-4 w-4" />
            Reservations
          </TabsTrigger>
          <TabsTrigger value="fines">
            <CircleDollarSign className="mr-1.5 h-4 w-4" />
            Fines
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-1.5 h-4 w-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="borrows">
          <MyBorrows />
        </TabsContent>
        <TabsContent value="reservations">
          <MyReservations />
        </TabsContent>
        <TabsContent value="fines">
          <MyFines />
        </TabsContent>
        <TabsContent value="payments">
          <MyPayments />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MyBorrows() {
  const { data, isLoading } = useGetMyBorrowsQuery();
  const [renewBook] = useRenewBookMutation();

  const handleRenew = async (id: string) => {
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 14);
    try {
      await renewBook({
        id,
        body: { newDueDate: newDueDate.toISOString().split("T")[0] },
      }).unwrap();
      toast.success("Book renewed for 14 days");
    } catch {
      toast.error("Failed to renew book");
    }
  };

  if (isLoading) return <PageLoader />;

  const borrows = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Borrow History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {borrows.length === 0 ? (
          <EmptyState title="No borrows yet" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Borrow Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrows.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">
                    {(b.book as IBook)?.title || "—"}
                  </TableCell>
                  <TableCell>{formatDate(b.borrowDate)}</TableCell>
                  <TableCell>{formatDate(b.dueDate)}</TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {(b.status === "borrowed" || b.status === "overdue") &&
                    b.renewCount < b.maxRenewals ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRenew(b._id)}
                      >
                        Renew
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function MyReservations() {
  const { data, isLoading } = useGetMyReservationsQuery();
  const [cancelReservation] = useCancelReservationMutation();

  const handleCancel = async (id: string) => {
    try {
      await cancelReservation(id).unwrap();
      toast.success("Reservation cancelled");
    } catch {
      toast.error("Failed to cancel");
    }
  };

  if (isLoading) return <PageLoader />;

  const reservations = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reservations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {reservations.length === 0 ? (
          <EmptyState title="No reservations" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
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
                  <TableCell>#{res.position}</TableCell>
                  <TableCell>{formatDate(res.reservedAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={res.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {(res.status === "pending" || res.status === "ready") && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(res._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function MyFines() {
  const { data, isLoading } = useGetMyFinesQuery();
  const [createStripePayment] = useCreateStripePaymentMutation();

  const handlePay = async (fineId: string) => {
    try {
      const result = await createStripePayment({ fineId }).unwrap();
      const payment = result.data;
      if (payment?.stripeClientSecret) {
        toast.info("Stripe payment initiated — redirect not yet implemented");
      }
    } catch {
      toast.error("Failed to initiate payment");
    }
  };

  if (isLoading) return <PageLoader />;

  const fines = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Fines</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {fines.length === 0 ? (
          <EmptyState title="No fines" description="You're all clear!" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fines.map((fine) => (
                <TableRow key={fine._id}>
                  <TableCell className="font-medium">
                    {formatCurrency(fine.amount)}
                  </TableCell>
                  <TableCell>{fine.reason}</TableCell>
                  <TableCell>
                    <StatusBadge status={fine.status} />
                  </TableCell>
                  <TableCell>{formatDate(fine.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {fine.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePay(fine._id)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function MyPayments() {
  const { data, isLoading } = useGetMyPaymentsQuery();

  if (isLoading) return <PageLoader />;

  const payments = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Payments</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {payments.length === 0 ? (
          <EmptyState title="No payments" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
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
                  <TableCell className="font-medium">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="capitalize">{payment.method}</TableCell>
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
  );
}
