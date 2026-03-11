"use client";

import { useState } from "react";
import { Tags, Plus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataPagination } from "@/components/shared/DataPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { usePagination } from "@/hooks/usePagination";
import { useRequireAuth } from "@/hooks/useAuth";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/store/api/categoryApi";
import {
  createCategorySchema,
  type CreateCategoryFormData,
} from "@/lib/validations";
import { formatDate } from "@/lib/utils";
import type { ICategory } from "@/types";

export default function CategoriesPage() {
  useRequireAuth("admin");
  const { page, limit, search, setPage, setSearch } = usePagination();
  const { data, isLoading } = useGetCategoriesQuery({ page, limit, search });
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<ICategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId).unwrap();
      toast.success("Category deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete category");
    }
  };

  if (isLoading) return <PageLoader />;

  const categories = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage book categories"
        icon={Tags}
        actions={
          <Button
            onClick={() => {
              setEditCategory(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search categories..."
      />

      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <EmptyState title="No categories found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {cat.description || "—"}
                    </TableCell>
                    <TableCell>{formatDate(cat.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditCategory(cat);
                            setDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(cat._id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editCategory}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Category"
        description="This will delete the category permanently."
        onConfirm={handleDelete}
        confirmText="Delete"
        loading={isDeleting}
      />
    </div>
  );
}

function CategoryForm({
  category,
  onSuccess,
}: {
  category: ICategory | null;
  onSuccess: () => void;
}) {
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const loading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: category
      ? { name: category.name, description: category.description || "" }
      : {},
  });

  const onSubmit = async (data: CreateCategoryFormData) => {
    try {
      if (category) {
        await updateCategory({ id: category._id, body: data }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory(data).unwrap();
        toast.success("Category created");
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {category ? "Update" : "Create"}
      </Button>
    </form>
  );
}
