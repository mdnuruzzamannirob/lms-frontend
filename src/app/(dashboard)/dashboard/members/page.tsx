"use client";

import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { usePagination } from "@/hooks/usePagination";
import { useRequireAuth } from "@/hooks/useAuth";
import {
  useGetMembersQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
} from "@/store/api/memberApi";
import { useGetUsersQuery } from "@/store/api/userApi";
import {
  createMemberSchema,
  updateMemberSchema,
  type CreateMemberFormData,
  type UpdateMemberFormData,
} from "@/lib/validations";
import { formatDate } from "@/lib/utils";
import type { IMember, IUser } from "@/types";

export default function MembersPage() {
  useRequireAuth("admin");
  const { page, limit, search, setPage, setSearch } = usePagination();
  const { data, isLoading } = useGetMembersQuery({ page, limit, search });
  const [deleteMember, { isLoading: isDeleting }] = useDeleteMemberMutation();
  const [createOpen, setCreateOpen] = useState(false);
  const [editMember, setEditMember] = useState<IMember | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMember(deleteId).unwrap();
      toast.success("Member deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete member");
    }
  };

  if (isLoading) return <PageLoader />;

  const members = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage library memberships"
        icon={Users}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search members..."
      />

      <Card>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <EmptyState title="No members found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Books Borrowed</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell className="font-medium">
                      {member.membershipId}
                    </TableCell>
                    <TableCell>{(member.user as IUser)?.name || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={member.membershipType} />
                    </TableCell>
                    <TableCell>
                      {member.currentBorrowed}/{member.maxBooksAllowed}
                    </TableCell>
                    <TableCell>{formatDate(member.membershipExpiry)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={member.isActive ? "active" : "inactive"}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditMember(member)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(member._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {meta && <DataPagination meta={meta} onPageChange={setPage} />}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <CreateMemberForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editMember}
        onOpenChange={(open) => !open && setEditMember(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          {editMember && (
            <EditMemberForm
              member={editMember}
              onSuccess={() => setEditMember(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Member"
        description="This will delete the membership permanently."
        onConfirm={handleDelete}
        confirmText="Delete"
        loading={isDeleting}
      />
    </div>
  );
}

function CreateMemberForm({ onSuccess }: { onSuccess: () => void }) {
  const [createMember, { isLoading }] = useCreateMemberMutation();
  const { data: usersData } = useGetUsersQuery();
  const users = usersData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
  });

  const onSubmit = async (data: CreateMemberFormData) => {
    try {
      await createMember(data).unwrap();
      toast.success("Member created");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to create member");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>User *</Label>
        <Select onValueChange={(val) => setValue("user", val as string)}>
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u._id} value={u._id}>
                {u.name} ({u.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.user && (
          <p className="text-sm text-destructive">{errors.user.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Membership Type</Label>
        <Select
          defaultValue="standard"
          onValueChange={(val) =>
            setValue(
              "membershipType",
              val as "standard" | "premium" | "student",
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Membership Expiry *</Label>
        <Input type="date" {...register("membershipExpiry")} />
        {errors.membershipExpiry && (
          <p className="text-sm text-destructive">
            {errors.membershipExpiry.message}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input {...register("address")} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Member
      </Button>
    </form>
  );
}

function EditMemberForm({
  member,
  onSuccess,
}: {
  member: IMember;
  onSuccess: () => void;
}) {
  const [updateMember, { isLoading }] = useUpdateMemberMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateMemberFormData>({
    resolver: zodResolver(updateMemberSchema),
    defaultValues: {
      membershipType: member.membershipType,
      phone: member.phone || "",
      address: member.address || "",
      maxBooksAllowed: member.maxBooksAllowed,
      isActive: member.isActive,
    },
  });

  const onSubmit = async (data: UpdateMemberFormData) => {
    try {
      await updateMember({ id: member._id, body: data }).unwrap();
      toast.success("Member updated");
      onSuccess();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to update");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Membership Type</Label>
        <Select
          defaultValue={member.membershipType}
          onValueChange={(val) =>
            setValue(
              "membershipType",
              val as "standard" | "premium" | "student",
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input {...register("address")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Max Books Allowed</Label>
        <Input type="number" {...register("maxBooksAllowed", { setValueAs: (v: string) => v === "" ? undefined : Number(v) })} />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Member
      </Button>
    </form>
  );
}
