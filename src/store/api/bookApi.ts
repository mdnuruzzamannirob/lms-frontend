import { apiSlice } from "./apiSlice";
import type {
  ApiResponse,
  IBook,
  ICreateBookPayload,
  IUpdateBookPayload,
  QueryParams,
} from "@/types";

export const bookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query<ApiResponse<IBook[]>, QueryParams | void>({
      query: (params) => ({
        url: "/books",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Book" as const,
                id: _id,
              })),
              { type: "Book", id: "LIST" },
            ]
          : [{ type: "Book", id: "LIST" }],
    }),
    getBookById: builder.query<ApiResponse<IBook>, string>({
      query: (id) => `/books/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Book", id }],
    }),
    createBook: builder.mutation<ApiResponse<IBook>, ICreateBookPayload>({
      query: (body) => ({ url: "/books", method: "POST", body }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),
    updateBook: builder.mutation<
      ApiResponse<IBook>,
      { id: string; body: IUpdateBookPayload }
    >({
      query: ({ id, body }) => ({
        url: `/books/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Book", id },
        { type: "Book", id: "LIST" },
      ],
    }),
    deleteBook: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/books/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),
    uploadBookCover: builder.mutation<
      ApiResponse<IBook>,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/books/${id}/cover`,
        method: "PATCH",
        body: formData,
        formData: true,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Book", id },
        { type: "Book", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookByIdQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useUploadBookCoverMutation,
} = bookApi;
