import { apiSlice } from "./apiSlice";
import type { ApiResponse, IUser, QueryParams } from "@/types";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<ApiResponse<IUser>, void>({
      query: () => "/users/me",
      providesTags: [{ type: "User", id: "ME" }],
    }),
    updateMe: builder.mutation<
      ApiResponse<IUser>,
      Partial<{ name: string }>
    >({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),
    getUsers: builder.query<ApiResponse<IUser[]>, QueryParams | void>({
      query: (params) => ({
        url: "/users",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "User" as const,
                id: _id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    getUserById: builder.query<ApiResponse<IUser>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation<
      ApiResponse<IUser>,
      { name: string; email: string; password: string; role?: string }
    >({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUser: builder.mutation<
      ApiResponse<IUser>,
      { id: string; body: { name?: string; isActive?: boolean } }
    >({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
