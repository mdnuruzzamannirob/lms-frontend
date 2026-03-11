import { z } from "zod";

// ==================== Auth Schemas ====================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a digit"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyResetOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a digit"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a digit"),
});

// ==================== Book Schemas ====================

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  isbn: z
    .string()
    .min(10, "ISBN must be 10-13 characters")
    .max(13, "ISBN must be 10-13 characters"),
  authors: z.array(z.string().min(1)).min(1, "At least one author is required"),
  publisher: z.string().optional(),
  publishedYear: z.coerce.number().optional(),
  category: z.string().min(1, "Category is required"),
  language: z.string().optional(),
  pages: z.coerce.number().optional(),
  totalCopies: z.coerce.number().min(1, "At least 1 copy required"),
  shelfLocation: z.string().optional(),
  description: z.string().optional(),
});

export const updateBookSchema = createBookSchema.partial();

// ==================== Category Schemas ====================

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ==================== Member Schemas ====================

export const createMemberSchema = z.object({
  user: z.string().min(1, "User is required"),
  membershipType: z.enum(["standard", "premium", "student"]).optional(),
  membershipExpiry: z.string().min(1, "Membership expiry is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const updateMemberSchema = z.object({
  membershipType: z.enum(["standard", "premium", "student"]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  maxBooksAllowed: z.coerce.number().optional(),
  membershipExpiry: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ==================== Borrow Schemas ====================

export const borrowBookSchema = z.object({
  book: z.string().min(1, "Book is required"),
  member: z.string().min(1, "Member is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

export const renewBookSchema = z.object({
  newDueDate: z.string().min(1, "New due date is required"),
});

// ==================== User Schemas ====================

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a digit"),
  role: z.enum(["user", "admin"]).optional(),
});

// ==================== Payment Schemas ====================

export const manualPaymentSchema = z.object({
  fineId: z.string().min(1, "Fine is required"),
  method: z.enum(["cash", "card"]),
});

// ==================== Type exports ====================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetOtpFormData = z.infer<typeof verifyResetOtpSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type CreateBookFormData = z.infer<typeof createBookSchema>;
export type UpdateBookFormData = z.infer<typeof updateBookSchema>;
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
export type CreateMemberFormData = z.infer<typeof createMemberSchema>;
export type UpdateMemberFormData = z.infer<typeof updateMemberSchema>;
export type BorrowBookFormData = z.infer<typeof borrowBookSchema>;
export type RenewBookFormData = z.infer<typeof renewBookSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type ManualPaymentFormData = z.infer<typeof manualPaymentSchema>;
