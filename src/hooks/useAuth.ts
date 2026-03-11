"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store";
import { useGetMeQuery } from "@/store/api/userApi";
import { setUser, logout } from "@/store/features/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );
  const { data, isLoading, error } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (data?.data) {
      dispatch(setUser(data.data));
    }
    if (error) {
      dispatch(logout());
    }
  }, [data, error, dispatch]);

  const isAdmin = user?.role === "admin";

  return { user, isAuthenticated, isLoading, isAdmin, token };
}

export function useRequireAuth(requiredRole?: "admin" | "user") {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (requiredRole === "admin" && !isAdmin) {
        router.replace("/dashboard");
      } else {
        setChecked(true);
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, requiredRole, router]);

  return { user, isLoading: isLoading || !checked, isAdmin };
}
