import { apiSlice } from "./apiSlice";
import type {
  ApiResponse,
  IMember,
  ICreateMemberPayload,
  IUpdateMemberPayload,
  QueryParams,
} from "@/types";

export const memberApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyMembership: builder.query<ApiResponse<IMember>, void>({
      query: () => "/members/me",
      providesTags: [{ type: "Member", id: "ME" }],
    }),
    getMembers: builder.query<ApiResponse<IMember[]>, QueryParams | void>({
      query: (params) => ({
        url: "/members",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Member" as const,
                id: _id,
              })),
              { type: "Member", id: "LIST" },
            ]
          : [{ type: "Member", id: "LIST" }],
    }),
    getMemberById: builder.query<ApiResponse<IMember>, string>({
      query: (id) => `/members/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Member", id }],
    }),
    createMember: builder.mutation<
      ApiResponse<IMember>,
      ICreateMemberPayload
    >({
      query: (body) => ({ url: "/members", method: "POST", body }),
      invalidatesTags: [{ type: "Member", id: "LIST" }],
    }),
    updateMember: builder.mutation<
      ApiResponse<IMember>,
      { id: string; body: IUpdateMemberPayload }
    >({
      query: ({ id, body }) => ({
        url: `/members/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Member", id },
        { type: "Member", id: "LIST" },
      ],
    }),
    deleteMember: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/members/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Member", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMyMembershipQuery,
  useGetMembersQuery,
  useGetMemberByIdQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
} = memberApi;
