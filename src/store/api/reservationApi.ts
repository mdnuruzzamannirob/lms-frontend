import { apiSlice } from "./apiSlice";
import type {
  ApiResponse,
  IReservation,
  ICreateReservationPayload,
  QueryParams,
} from "@/types";

export const reservationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyReservations: builder.query<
      ApiResponse<IReservation[]>,
      QueryParams | void
    >({
      query: (params) => ({
        url: "/reservations/me",
        params: params || {},
      }),
      providesTags: [{ type: "Reservation", id: "MY" }],
    }),
    getReservations: builder.query<
      ApiResponse<IReservation[]>,
      QueryParams | void
    >({
      query: (params) => ({
        url: "/reservations",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Reservation" as const,
                id: _id,
              })),
              { type: "Reservation", id: "LIST" },
            ]
          : [{ type: "Reservation", id: "LIST" }],
    }),
    createReservation: builder.mutation<
      ApiResponse<IReservation>,
      ICreateReservationPayload
    >({
      query: (body) => ({ url: "/reservations", method: "POST", body }),
      invalidatesTags: [
        { type: "Reservation", id: "LIST" },
        { type: "Reservation", id: "MY" },
      ],
    }),
    cancelReservation: builder.mutation<ApiResponse<IReservation>, string>({
      query: (id) => ({
        url: `/reservations/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Reservation", id },
        { type: "Reservation", id: "LIST" },
        { type: "Reservation", id: "MY" },
      ],
    }),
  }),
});

export const {
  useGetMyReservationsQuery,
  useGetReservationsQuery,
  useCreateReservationMutation,
  useCancelReservationMutation,
} = reservationApi;
