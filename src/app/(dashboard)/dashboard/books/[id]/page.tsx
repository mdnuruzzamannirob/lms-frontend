"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Edit, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetBookByIdQuery,
  useUploadBookCoverMutation,
} from "@/store/api/bookApi";
import { BookForm } from "../BookForm";
import type { ICategory } from "@/types";

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { data, isLoading } = useGetBookByIdQuery(id);
  const [uploadCover, { isLoading: isUploading }] =
    useUploadBookCoverMutation();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <PageLoader />;

  const book = data?.data;
  if (!book) return <p>Book not found</p>;

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      await uploadCover({ id: book._id, formData }).unwrap();
      toast.success("Cover image updated");
    } catch {
      toast.error("Failed to upload cover image");
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="mb-4 h-64 w-44 rounded-lg object-cover shadow-md"
              />
            ) : (
              <div className="mb-4 flex h-64 w-44 items-center justify-center rounded-lg bg-muted">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {isAdmin && (
              <div className="w-full">
                <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                    disabled={isUploading}
                  />
                  <Upload className="h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload Cover"}
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">{book.title}</CardTitle>
            {isAdmin && (
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Book</DialogTitle>
                  </DialogHeader>
                  <BookForm book={book} onSuccess={() => setEditOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  ISBN
                </dt>
                <dd className="text-sm">{book.isbn}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Authors
                </dt>
                <dd className="text-sm">{book.authors.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Category
                </dt>
                <dd className="text-sm">
                  {(book.category as ICategory)?.name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Language
                </dt>
                <dd className="text-sm">{book.language}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Publisher
                </dt>
                <dd className="text-sm">{book.publisher || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Published Year
                </dt>
                <dd className="text-sm">{book.publishedYear || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Pages
                </dt>
                <dd className="text-sm">{book.pages || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Shelf Location
                </dt>
                <dd className="text-sm">{book.shelfLocation || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Availability
                </dt>
                <dd>
                  <Badge
                    variant={
                      book.availableCopies > 0 ? "default" : "destructive"
                    }
                  >
                    {book.availableCopies} / {book.totalCopies} available
                  </Badge>
                </dd>
              </div>
            </dl>
            {book.description && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <p className="mt-1 text-sm">{book.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
