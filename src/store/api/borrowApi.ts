import { apiSlice } from "./apiSlice";
import type {
  ApiResponse,
  IBorrowRecord,
  IBorrowBookPayload,
  IReturnBookPayload,
  IRenewBookPayload,
  QueryParams,
} from "@/types";

export const borrowApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyBorrows: builder.query<
      ApiResponse<IBorrowRecord[]>,
      QueryParams | void
    >({
      query: (params) => ({
        url: "/borrows/my-history",
        params: params || {},
      }),
      providesTags: [{ type: "Borrow", id: "MY" }],
    }),
    getBorrows: builder.query<ApiResponse<IBorrowRecord[]>, QueryParams | void>(
      {
        query: (params) => ({
          url: "/borrows",
          params: params || {},
        }),
        providesTags: (result) =>
          result?.data
            ? [
                ...result.data.map(({ _id }) => ({
                  type: "Borrow" as const,
                  id: _id,
                })),
                { type: "Borrow", id: "LIST" },
              ]
            : [{ type: "Borrow", id: "LIST" }],
      },
    ),
    getOverdueBorrows: builder.query<
      ApiResponse<IBorrowRecord[]>,
      QueryParams | void
    >({
      query: (params) => ({
        url: "/borrows/overdue",
        params: params || {},
      }),
      providesTags: [{ type: "Borrow", id: "OVERDUE" }],
    }),
    getBorrowById: builder.query<ApiResponse<IBorrowRecord>, string>({
      query: (id) => `/borrows/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Borrow", id }],
    }),
    borrowBook: builder.mutation<
      ApiResponse<IBorrowRecord>,
      IBorrowBookPayload
    >({
      query: (body) => ({ url: "/borrows", method: "POST", body }),
      invalidatesTags: [
        { type: "Borrow", id: "LIST" },
        { type: "Book", id: "LIST" },
        { type: "Member", id: "LIST" },
      ],
    }),
    returnBook: builder.mutation<
      ApiResponse<IBorrowRecord>,
      { id: string; body?: IReturnBookPayload }
    >({
      query: ({ id, body }) => ({
        url: `/borrows/${id}/return`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Borrow", id },
        { type: "Borrow", id: "LIST" },
        { type: "Book", id: "LIST" },
        { type: "Member", id: "LIST" },
      ],
    }),
    renewBook: builder.mutation<
      ApiResponse<IBorrowRecord>,
      { id: string; body: IRenewBookPayload }
    >({
      query: ({ id, body }) => ({
        url: `/borrows/${id}/renew`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Borrow", id },
        { type: "Borrow", id: "LIST" },
      ],
    }),
    markLost: builder.mutation<ApiResponse<IBorrowRecord>, string>({
      query: (id) => ({
        url: `/borrows/${id}/lost`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Borrow", id },
        { type: "Borrow", id: "LIST" },
        { type: "Book", id: "LIST" },
        { type: "Fine", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMyBorrowsQuery,
  useGetBorrowsQuery,
  useGetOverdueBorrowsQuery,
  useGetBorrowByIdQuery,
  useBorrowBookMutation,
  useReturnBookMutation,
  useRenewBookMutation,
  useMarkLostMutation,
} = borrowApi;
