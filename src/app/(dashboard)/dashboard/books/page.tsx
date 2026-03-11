"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/hooks/useAuth";
import {
  useGetBooksQuery,
  useCreateBookMutation,
  useDeleteBookMutation,
} from "@/store/api/bookApi";
import { BookForm } from "./BookForm";
import type { ICategory } from "@/types";

export default function BooksPage() {
  const { isAdmin } = useAuth();
  const { page, limit, search, setPage, setSearch } = usePagination();
  const { data, isLoading } = useGetBooksQuery({ page, limit, search });
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBook(deleteId).unwrap();
      toast.success("Book deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete book");
    }
  };

  if (isLoading) return <PageLoader />;

  const books = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Books"
        description="Manage your library's book collection"
        icon={BookOpen}
        actions={
          isAdmin && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                </DialogHeader>
                <BookForm onSuccess={() => setCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="flex items-center gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search books..."
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {books.length === 0 ? (
            <EmptyState
              title="No books found"
              description="Start by adding books to your library"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Authors</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Available</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book._id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.isbn}</TableCell>
                    <TableCell>{book.authors.join(", ")}</TableCell>
                    <TableCell>
                      {(book.category as ICategory)?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          book.availableCopies > 0 ? "default" : "destructive"
                        }
                      >
                        {book.availableCopies}/{book.totalCopies}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.location.assign(
                                `/dashboard/books/${book._id}`
                              )
                            }
                          >
                            View
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(book._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {meta && <DataPagination meta={meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Book"
        description="Are you sure you want to delete this book? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        loading={isDeleting}
      />
    </div>
  );
}
