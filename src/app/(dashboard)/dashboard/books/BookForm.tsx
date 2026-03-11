"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  useCreateBookMutation,
  useUpdateBookMutation,
} from "@/store/api/bookApi";
import { useGetCategoriesQuery } from "@/store/api/categoryApi";
import { createBookSchema, type CreateBookFormData } from "@/lib/validations";
import type { IBook, ICategory } from "@/types";

interface BookFormProps {
  book?: IBook;
  onSuccess: () => void;
}

export function BookForm({ book, onSuccess }: BookFormProps) {
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateBookFormData>({
    resolver: zodResolver(createBookSchema),
    defaultValues: book
      ? {
          title: book.title,
          isbn: book.isbn,
          authors: book.authors,
          publisher: book.publisher || "",
          publishedYear: book.publishedYear,
          category:
            typeof book.category === "string"
              ? book.category
              : book.category._id,
          language: book.language,
          pages: book.pages,
          totalCopies: book.totalCopies,
          shelfLocation: book.shelfLocation || "",
          description: book.description || "",
        }
      : {
          authors: [""],
          language: "English",
          totalCopies: 1,
        },
  });

  const onSubmit = async (data: CreateBookFormData) => {
    try {
      if (book) {
        await updateBook({ id: book._id, body: data }).unwrap();
        toast.success("Book updated successfully");
      } else {
        await createBook(data).unwrap();
        toast.success("Book created successfully");
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Operation failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="isbn">ISBN *</Label>
          <Input id="isbn" {...register("isbn")} />
          {errors.isbn && (
            <p className="text-sm text-destructive">{errors.isbn.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="authors">Authors * (comma-separated)</Label>
        <Input
          id="authors"
          defaultValue={book?.authors.join(", ") || ""}
          onChange={(e) => {
            const authors = e.target.value
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean);
            setValue("authors", authors.length > 0 ? authors : [""]);
          }}
        />
        {errors.authors && (
          <p className="text-sm text-destructive">{errors.authors.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            defaultValue={
              book
                ? typeof book.category === "string"
                  ? book.category
                  : book.category._id
                : undefined
            }
            onValueChange={(val) => setValue("category", val as string)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalCopies">Total Copies *</Label>
          <Input
            id="totalCopies"
            type="number"
            min={1}
            {...register("totalCopies", { valueAsNumber: true })}
          />
          {errors.totalCopies && (
            <p className="text-sm text-destructive">
              {errors.totalCopies.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="publisher">Publisher</Label>
          <Input id="publisher" {...register("publisher")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publishedYear">Published Year</Label>
          <Input
            id="publishedYear"
            type="number"
            {...register("publishedYear", {
              setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input id="language" {...register("language")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pages">Pages</Label>
          <Input
            id="pages"
            type="number"
            {...register("pages", {
              setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shelfLocation">Shelf Location</Label>
          <Input id="shelfLocation" {...register("shelfLocation")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {book ? "Update Book" : "Add Book"}
      </Button>
    </form>
  );
}
