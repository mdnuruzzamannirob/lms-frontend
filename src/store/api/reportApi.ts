import { apiSlice } from "./apiSlice";
import type {
  ApiResponse,
  IDashboardStats,
  IPopularBook,
  IActiveMember,
  ICategoryDistribution,
  IBorrowTrend,
  IRevenueReport,
  IOverdueReport,
} from "@/types";

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<IDashboardStats>, void>({
      query: () => "/reports/dashboard",
      providesTags: [{ type: "Report", id: "DASHBOARD" }],
    }),
    getPopularBooks: builder.query<ApiResponse<IPopularBook[]>, void>({
      query: () => "/reports/popular-books",
      providesTags: [{ type: "Report", id: "POPULAR" }],
    }),
    getActiveMembers: builder.query<ApiResponse<IActiveMember[]>, void>({
      query: () => "/reports/active-members",
      providesTags: [{ type: "Report", id: "ACTIVE_MEMBERS" }],
    }),
    getCategoryDistribution: builder.query<
      ApiResponse<ICategoryDistribution[]>,
      void
    >({
      query: () => "/reports/category-distribution",
      providesTags: [{ type: "Report", id: "CATEGORY_DIST" }],
    }),
    getBorrowTrends: builder.query<ApiResponse<IBorrowTrend[]>, void>({
      query: () => "/reports/borrow-trends",
      providesTags: [{ type: "Report", id: "TRENDS" }],
    }),
    getRevenueReport: builder.query<ApiResponse<IRevenueReport>, void>({
      query: () => "/reports/revenue",
      providesTags: [{ type: "Report", id: "REVENUE" }],
    }),
    getOverdueReport: builder.query<ApiResponse<IOverdueReport>, void>({
      query: () => "/reports/overdue",
      providesTags: [{ type: "Report", id: "OVERDUE" }],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetPopularBooksQuery,
  useGetActiveMembersQuery,
  useGetCategoryDistributionQuery,
  useGetBorrowTrendsQuery,
  useGetRevenueReportQuery,
  useGetOverdueReportQuery,
} = reportApi;
