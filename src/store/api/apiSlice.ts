import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/constants";
import { setCredentials, logout } from "../features/authSlice";
import type { RootState } from "..";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token =
      (getState() as RootState).auth.token || Cookies.get("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: "/auth/refresh-token", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { data: { accessToken: string } };
      // Update Redux state and cookie atomically
      api.dispatch(setCredentials({ accessToken: data.data.accessToken }));
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed — clear auth and redirect
      api.dispatch(logout());
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  // Prevent unnecessary background refetches
  refetchOnFocus: false,
  refetchOnReconnect: false,
  tagTypes: [
    "User",
    "Book",
    "Category",
    "Member",
    "Borrow",
    "Fine",
    "Reservation",
    "Payment",
    "Report",
  ],
  endpoints: () => ({}),
});
