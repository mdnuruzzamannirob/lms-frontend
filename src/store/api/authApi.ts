import { apiSlice } from "./apiSlice";
import type {
  ApiResponse,
  IAuthResponse,
  ILoginPayload,
  IRegisterPayload,
  IVerifyEmailPayload,
  IChangePasswordPayload,
  IForgotPasswordPayload,
  IVerifyResetOtpPayload,
  IResetPasswordPayload,
  IResendOtpPayload,
} from "@/types";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<IAuthResponse>, ILoginPayload>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    register: builder.mutation<ApiResponse<null>, IRegisterPayload>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    verifyEmail: builder.mutation<ApiResponse<null>, IVerifyEmailPayload>({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    changePassword: builder.mutation<ApiResponse<null>, IChangePasswordPayload>(
      {
        query: (body) => ({
          url: "/auth/change-password",
          method: "POST",
          body,
        }),
      },
    ),
    forgotPassword: builder.mutation<ApiResponse<null>, IForgotPasswordPayload>(
      {
        query: (body) => ({
          url: "/auth/forgot-password",
          method: "POST",
          body,
        }),
      },
    ),
    verifyResetOtp: builder.mutation<
      ApiResponse<{ resetToken: string }>,
      IVerifyResetOtpPayload
    >({
      query: (body) => ({
        url: "/auth/verify-reset-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<ApiResponse<null>, IResetPasswordPayload>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    resendOtp: builder.mutation<ApiResponse<null>, IResendOtpPayload>({
      query: (body) => ({ url: "/auth/resend-otp", method: "POST", body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
} = authApi;
