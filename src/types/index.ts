// ==================== Common ====================

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  [key: string]: string | number | boolean | undefined;
}

// ==================== User ====================

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Auth ====================

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface IVerifyEmailPayload {
  email: string;
  otp: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IVerifyResetOtpPayload {
  email: string;
  otp: string;
}

export interface IResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export interface IResendOtpPayload {
  email: string;
  type: "email_verification" | "password_reset";
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

// ==================== Category ====================

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCategoryPayload {
  name: string;
  description?: string;
}

export interface IUpdateCategoryPayload {
  name?: string;
  description?: string;
}

// ==================== Book ====================

export interface IBook {
  _id: string;
  title: string;
  isbn: string;
  authors: string[];
  publisher?: string;
  publishedYear?: number;
  category: ICategory | string;
  language: string;
  pages?: number;
  totalCopies: number;
  availableCopies: number;
  shelfLocation?: string;
  coverImage?: string;
  description?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateBookPayload {
  title: string;
  isbn: string;
  authors: string[];
  publisher?: string;
  publishedYear?: number;
  category: string;
  language?: string;
  pages?: number;
  totalCopies: number;
  shelfLocation?: string;
  description?: string;
}

export interface IUpdateBookPayload extends Partial<ICreateBookPayload> {}

// ==================== Member ====================

export interface IMember {
  _id: string;
  user: IUser | string;
  membershipId: string;
  membershipType: "standard" | "premium" | "student";
  phone?: string;
  address?: string;
  maxBooksAllowed: number;
  currentBorrowed: number;
  membershipExpiry: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateMemberPayload {
  user: string;
  membershipType?: "standard" | "premium" | "student";
  membershipExpiry: string;
  phone?: string;
  address?: string;
}

export interface IUpdateMemberPayload {
  membershipType?: "standard" | "premium" | "student";
  phone?: string;
  address?: string;
  maxBooksAllowed?: number;
  membershipExpiry?: string;
  isActive?: boolean;
}

// ==================== Borrow ====================

export interface IBorrowRecord {
  _id: string;
  book: IBook | string;
  member: IMember | string;
  issuedBy: IUser | string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  returnedTo?: IUser | string;
  status: "borrowed" | "returned" | "overdue" | "lost";
  renewCount: number;
  maxRenewals: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBorrowBookPayload {
  book: string;
  member: string;
  dueDate: string;
  notes?: string;
}

export interface IReturnBookPayload {
  notes?: string;
}

export interface IRenewBookPayload {
  newDueDate: string;
}

// ==================== Fine ====================

export interface IFine {
  _id: string;
  member: IMember | string;
  borrowRecord: IBorrowRecord | string;
  amount: number;
  reason: string;
  status: "pending" | "paid" | "waived";
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Reservation ====================

export interface IReservation {
  _id: string;
  book: IBook | string;
  member: IMember | string;
  status: "pending" | "ready" | "fulfilled" | "cancelled" | "expired";
  reservedAt: string;
  notifiedAt?: string;
  fulfilledAt?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateReservationPayload {
  book: string;
}

// ==================== Payment ====================

export interface IPayment {
  _id: string;
  fine: IFine | string;
  member: IMember | string;
  amount: number;
  method: "stripe" | "cash" | "card";
  status: "pending" | "completed" | "failed" | "refunded";
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  transactionId: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateStripePaymentPayload {
  fineId: string;
}

export interface IRecordManualPaymentPayload {
  fineId: string;
  method: "cash" | "card";
}

// ==================== Reports ====================

export interface IDashboardStats {
  totalBooks: number;
  totalMembers: number;
  totalBorrows: number;
  totalFines: number;
  overdueBooks: number;
  activeReservations: number;
  recentBorrows: IBorrowRecord[];
  recentReturns: IBorrowRecord[];
}

export interface IPopularBook {
  book: IBook;
  borrowCount: number;
}

export interface IActiveMember {
  member: IMember;
  borrowCount: number;
}

export interface ICategoryDistribution {
  category: string;
  count: number;
}

export interface IBorrowTrend {
  date: string;
  count: number;
}

export interface IRevenueReport {
  totalRevenue: number;
  paidFines: number;
  pendingFines: number;
  waivedFines: number;
}

export interface IOverdueReport {
  totalOverdue: number;
  records: IBorrowRecord[];
}
