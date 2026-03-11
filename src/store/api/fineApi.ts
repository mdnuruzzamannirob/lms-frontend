import { apiSlice } from "./apiSlice";
import type { ApiResponse, IFine, QueryParams } from "@/types";

export const fineApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyFines: builder.query<ApiResponse<IFine[]>, QueryParams | void>({
      query: (params) => ({
        url: "/fines/me",
        params: params || {},
      }),
      providesTags: [{ type: "Fine", id: "MY" }],
    }),
    getFines: builder.query<ApiResponse<IFine[]>, QueryParams | void>({
      query: (params) => ({
        url: "/fines",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Fine" as const,
                id: _id,
              })),
              { type: "Fine", id: "LIST" },
            ]
          : [{ type: "Fine", id: "LIST" }],
    }),
    getFineById: builder.query<ApiResponse<IFine>, string>({
      query: (id) => `/fines/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Fine", id }],
    }),
    payFine: builder.mutation<ApiResponse<IFine>, string>({
      query: (id) => ({
        url: `/fines/${id}/pay`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Fine", id },
        { type: "Fine", id: "LIST" },
        { type: "Fine", id: "MY" },
        { type: "Payment", id: "LIST" },
      ],
    }),
    waiveFine: builder.mutation<ApiResponse<IFine>, string>({
      query: (id) => ({
        url: `/fines/${id}/waive`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Fine", id },
        { type: "Fine", id: "LIST" },
        { type: "Fine", id: "MY" },
      ],
    }),
  }),
});

export const {
  useGetMyFinesQuery,
  useGetFinesQuery,
  useGetFineByIdQuery,
  usePayFineMutation,
  useWaiveFineMutation,
} = fineApi;
