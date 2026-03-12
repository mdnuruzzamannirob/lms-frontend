"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/shared/OtpInput";
import {
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useResendOtpMutation,
} from "@/store/api/authApi";
import {
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  type ForgotPasswordFormData,
  type VerifyResetOtpFormData,
  type ResetPasswordFormData,
} from "@/lib/validations";
import { cn } from "@/lib/utils";

type Step = "email" | "otp" | "reset" | "done";

const STEPS = [
  { id: "email" as const, label: "Email" },
  { id: "otp" as const, label: "Verify" },
  { id: "reset" as const, label: "Reset" },
];

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [forgotPassword, { isLoading: isSending }] =
    useForgotPasswordMutation();
  const [verifyResetOtp, { isLoading: isVerifying }] =
    useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const otpForm = useForm<VerifyResetOtpFormData>({
    resolver: zodResolver(verifyResetOtpSchema),
    defaultValues: { email: "", otp: "" },
  });
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { resetToken: "", newPassword: "" },
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data).unwrap();
      setEmail(data.email);
      otpForm.setValue("email", data.email);
      setStep("otp");
      setCountdown(60);
      toast.success("Reset code sent! Check your inbox.");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to send reset code");
    }
  };

  const handleOtpSubmit = async (data: VerifyResetOtpFormData) => {
    try {
      const result = await verifyResetOtp(data).unwrap();
      if (result.data?.resetToken) {
        resetForm.setValue("resetToken", result.data.resetToken);
        setStep("reset");
        toast.success("Code verified!");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Invalid or expired code");
    }
  };

  const handleResetSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(data).unwrap();
      setStep("done");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to reset password");
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await resendOtp({ email, type: "password_reset" }).unwrap();
      toast.success("New code sent!");
      setCountdown(60);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to resend code");
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  // ── Done screen ──
  if (step === "done") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-8 w-8" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Password reset!</h1>
          <p className="text-sm text-muted-foreground">
            Your password has been updated. You can now sign in with your new
            password.
          </p>
        </div>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Sign in now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Step indicator ── */}
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "flex items-center",
              i < STEPS.length - 1 ? "flex-1" : "",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                i < currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : i === currentStepIndex
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                    : "border-2 border-border bg-background text-muted-foreground",
              )}
            >
              {i < currentStepIndex ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  i < currentStepIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Heading ── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {step === "email" && "Forgot your password?"}
          {step === "otp" && "Enter verification code"}
          {step === "reset" && "Set new password"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === "email" &&
            "Enter your email and we'll send you a reset code."}
          {step === "otp" && `We sent a 6-digit code to ${email}.`}
          {step === "reset" && "Choose a strong new password for your account."}
        </p>
      </div>

      {/* ── Step 1: Email ── */}
      {step === "email" && (
        <form
          onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="fp-email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                id="fp-email"
                type="email"
                placeholder="you@example.com"
                className="pl-9"
                autoComplete="email"
                {...emailForm.register("email")}
              />
            </div>
            {emailForm.formState.errors.email && (
              <p className="text-xs text-destructive">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Code
          </Button>
        </form>
      )}

      {/* ── Step 2: OTP ── */}
      {step === "otp" && (
        <form
          onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
          className="space-y-6"
        >
          <input type="hidden" {...otpForm.register("email")} />
          <div className="space-y-2">
            <Controller
              name="otp"
              control={otpForm.control}
              render={({ field }) => (
                <OtpInput
                  value={field.value}
                  onChange={field.onChange}
                  hasError={!!otpForm.formState.errors.otp}
                />
              )}
            />
            {otpForm.formState.errors.otp && (
              <p className="text-center text-xs text-destructive">
                {otpForm.formState.errors.otp.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Code
          </Button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend in{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {countdown}s
                </span>
              </p>
            ) : (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? "Resending…" : "Resend code"}
              </Button>
            )}
          </div>
        </form>
      )}

      {/* ── Step 3: New Password ── */}
      {step === "reset" && (
        <form
          onSubmit={resetForm.handleSubmit(handleResetSubmit)}
          className="space-y-4"
        >
          <input type="hidden" {...resetForm.register("resetToken")} />
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, uppercase, lowercase & digit"
                className="pl-9 pr-10"
                autoComplete="new-password"
                {...resetForm.register("newPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {resetForm.formState.errors.newPassword && (
              <p className="text-xs text-destructive">
                {resetForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isResetting}>
            {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
