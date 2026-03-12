"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/shared/OtpInput";
import {
  useVerifyEmailMutation,
  useResendOtpMutation,
} from "@/store/api/authApi";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/features/authSlice";
import { verifyEmailSchema, type VerifyEmailFormData } from "@/lib/validations";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email, otp: "" },
  });

  const onSubmit = async (data: VerifyEmailFormData) => {
    try {
      const result = await verifyEmail(data).unwrap();
      toast.success("Email verified successfully!");
      if (result.data?.accessToken) {
        dispatch(setCredentials({ accessToken: result.data.accessToken }));
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(
        error?.data?.message || "Verification failed. Please try again.",
      );
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing. Please go back and register again.");
      return;
    }
    try {
      await resendOtp({ email, type: "email_verification" }).unwrap();
      toast.success("A new code has been sent to your email.");
      setCountdown(60);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to resend code");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit verification code to{" "}
            {email ? (
              <span className="font-medium text-foreground">{email}</span>
            ) : (
              "your email address"
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <OtpInput
                value={field.value}
                onChange={field.onChange}
                hasError={!!errors.otp}
              />
            )}
          />
          {errors.otp && (
            <p className="text-center text-xs text-destructive">
              {errors.otp.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Email
        </Button>
      </form>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend code in{" "}
            <span className="font-medium text-foreground tabular-nums">
              {countdown}s
            </span>
          </p>
        ) : (
          <Button
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Resending…
              </>
            ) : (
              "Didn't receive a code? Resend"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
