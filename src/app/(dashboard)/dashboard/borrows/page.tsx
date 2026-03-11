"use client";

import { useState } from "react";
import { BookCopy, Plus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { usePagination } from "@/hooks/usePagination";
import { useRequireAuth } from "@/hooks/useAuth";
import {
  useGetBorrowsQuery,
  useGetOverdueBorrowsQuery,
  useBorrowBookMutation,
  useReturnBookMutation,
  useRenewBookMutation,
  useMarkLostMutation,
} from "@/store/api/borrowApi";
import { useGetBooksQuery } from "@/store/api/bookApi";
import { useGetMembersQuery } from "@/store/api/memberApi";
import {
  borrowBookSchema,
  renewBookSchema,
  type BorrowBookFormData,
  type RenewBookFormData,
} from "@/lib/validations";
import { formatDate } from "@/lib/utils";
import type { IBook, IMember, IBorrowRecord, IUser } from "@/types";

export default function BorrowsPage() {
  useRequireAuth("admin");
  const { page, limit, search, setPage, setSearch } = usePagination();
  const { data, isLoading } = useGetBorrowsQuery({ page, limit, search });
  const { data: overdueData } = useGetOverdueBorrowsQuery();
  const [returnBook, { isLoading: isReturning }] = useReturnBookMutation();
  const [markLost, { isLoading: isMarkingLost }] = useMarkLostMutation();
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [renewRecord, setRenewRecord] = useState<IBorrowRecord | null>(null);
  const [returnId, setReturnId] = useState<string | null>(null);
  const [lostId, setLostId] = useState<string | null>(null);

  const handleReturn = async () => {
    if (!returnId) return;
    try {
      await returnBook({ id: returnId }).unwrap();
      toast.success("Book returned successfully");
      setReturnId(null);
    } catch {
      toast.error("Failed to return book");
    }
  };

  const handleMarkLost = async () => {
    if (!lostId) return;
    try {
      await markLost(lostId).unwrap();
      toast.success("Book marked as lost");
      setLostId(null);
    } catch {
      toast.error("Failed to mark as lost");
    }
  };

  if (isLoading) return <PageLoader />;

  const borrows = data?.data || [];
  const overdue = overdueData?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Borrows"
        description="Manage book borrowing records"
        icon={BookCopy}
        actions={
          <Button onClick={() => setBorrowOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Issue Book
          </Button>
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Borrows</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search borrows..."
          />
          <BorrowTable
            borrows={borrows}
            onReturn={setReturnId}
            onRenew={setRenewRecord}
            onMarkLost={setLostId}
          />
          {meta && <DataPagination meta={meta} onPageChange={setPage} />}
        </TabsContent>

        <TabsContent value="overdue">
          <BorrowTable
            borrows={overdue}
            onReturn={setReturnId}
            onRenew={setRenewRecord}
            onMarkLost={setLostId}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={borrowOpen} onOpenChange={setBorrowOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue a Book</DialogTitle>
          </DialogHeader>
          <BorrowForm onSuccess={() => setBorrowOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!renewRecord}
        onOpenChange={(open) => !open && setRenewRecord(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Borrow</DialogTitle>
          </DialogHeader>
          {renewRecord && (
            <RenewForm
              record={renewRecord}
              onSuccess={() => setRenewRecord(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!returnId}
        onOpenChange={(open) => !open && setReturnId(null)}
        title="Return Book"
        description="Mark this book as returned?"
        onConfirm={handleReturn}
        confirmText="Return"
        loading={isReturning}
        variant="default"
      />

      <ConfirmDialog
        open={!!lostId}
        onOpenChange={(open) => !open && setLostId(null)}
        title="Mark as Lost"
        description="Mark this book as lost? A fine may be generated."
        onConfirm={handleMarkLost}
        confirmText="Mark Lost"
        loading={isMarkingLost}
      />
    </div>
  );
}

function BorrowTable({
  borrows,
  onReturn,
  onRenew,
  onMarkLost,
}: {
  borrows: IBorrowRecord[];
  onReturn: (id: string) => void;
  onRenew: (record: IBorrowRecord) => void;
  onMarkLost: (id: string) => void;
}) {
  if (borrows.length === 0) return <EmptyState title="No borrow records" />;

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book</TableHead>
              <TableHead>Member</TableHead>
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
                <TableCell>
                  {(b.member as IMember)?.membershipId || "—"}
                </TableCell>
                <TableCell>{formatDate(b.borrowDate)}</TableCell>
                <TableCell>{formatDate(b.dueDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={b.status} />
                </TableCell>
                <TableCell className="text-right">
                  {b.status === "borrowed" || b.status === "overdue" ? (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReturn(b._id)}
                      >
                        Return
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRenew(b)}
                      >
                        Renew
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onMarkLost(b._id)}
                      >
                        Lost
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
      </CardContent>
    </Card>
  );
}

function BorrowForm({ onSuccess }: { onSuccess: () => void }) {
  const [borrowBook, { isLoading }] = useBorrowBookMutation();
  const { data: booksData } = useGetBooksQuery();
  const { data: membersData } = useGetMembersQuery();
  const books = (booksData?.data || []).filter((b) => b.availableCopies > 0);
  const members = (membersData?.data || []).filter((m) => m.isActive);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BorrowBookFormData>({
    resolver: zodResolver(borrowBookSchema),
  });

  const onSubmit = async (data: BorrowBookFormData) => {
    try {
      await borrowBook(data).unwrap();
      toast.success("Book issued successfully");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to issue book");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Book *</Label>
        <Select onValueChange={(val) => setValue("book", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select book" />
          </SelectTrigger>
          <SelectContent>
            {books.map((b) => (
              <SelectItem key={b._id} value={b._id}>
                {b.title} ({b.availableCopies} available)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.book && (
          <p className="text-sm text-destructive">{errors.book.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Member *</Label>
        <Select onValueChange={(val) => setValue("member", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select member" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m._id} value={m._id}>
                {m.membershipId} — {(m.user as IUser)?.name || "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.member && (
          <p className="text-sm text-destructive">{errors.member.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Due Date *</Label>
        <Input type="date" {...register("dueDate")} />
        {errors.dueDate && (
          <p className="text-sm text-destructive">{errors.dueDate.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea rows={2} {...register("notes")} />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Issue Book
      </Button>
    </form>
  );
}

function RenewForm({
  record,
  onSuccess,
}: {
  record: IBorrowRecord;
  onSuccess: () => void;
}) {
  const [renewBook, { isLoading }] = useRenewBookMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RenewBookFormData>({
    resolver: zodResolver(renewBookSchema),
  });

  const onSubmit = async (data: RenewBookFormData) => {
    try {
      await renewBook({ id: record._id, body: data }).unwrap();
      toast.success("Borrow renewed");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to renew");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Current due date: {formatDate(record.dueDate)} (Renewed{" "}
        {record.renewCount}/{record.maxRenewals} times)
      </p>
      <div className="space-y-2">
        <Label>New Due Date *</Label>
        <Input type="date" {...register("newDueDate")} />
        {errors.newDueDate && (
          <p className="text-sm text-destructive">
            {errors.newDueDate.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Renew
      </Button>
    </form>
  );
}
