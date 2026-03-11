import { apiSlice } from "./apiSlice";
import type {
  ApiResponse,
  IPayment,
  ICreateStripePaymentPayload,
  IRecordManualPaymentPayload,
  QueryParams,
} from "@/types";

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyPayments: builder.query<ApiResponse<IPayment[]>, QueryParams | void>({
      query: (params) => ({
        url: "/payments/me",
        params: params || {},
      }),
      providesTags: [{ type: "Payment", id: "MY" }],
    }),
    getPayments: builder.query<ApiResponse<IPayment[]>, QueryParams | void>({
      query: (params) => ({
        url: "/payments",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Payment" as const,
                id: _id,
              })),
              { type: "Payment", id: "LIST" },
            ]
          : [{ type: "Payment", id: "LIST" }],
    }),
    createStripePayment: builder.mutation<
      ApiResponse<IPayment>,
      ICreateStripePaymentPayload
    >({
      query: (body) => ({
        url: "/payments/stripe",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Payment", id: "LIST" },
        { type: "Payment", id: "MY" },
        { type: "Fine", id: "LIST" },
        { type: "Fine", id: "MY" },
      ],
    }),
    recordManualPayment: builder.mutation<
      ApiResponse<IPayment>,
      IRecordManualPaymentPayload
    >({
      query: (body) => ({
        url: "/payments/manual",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Payment", id: "LIST" },
        { type: "Fine", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMyPaymentsQuery,
  useGetPaymentsQuery,
  useCreateStripePaymentMutation,
  useRecordManualPaymentMutation,
} = paymentApi;
