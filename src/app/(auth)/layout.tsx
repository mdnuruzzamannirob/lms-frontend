"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, BookMarked, Users, TrendingUp, Shield } from "lucide-react";
import { useAppSelector } from "@/store";

const features = [
  {
    icon: BookMarked,
    label: "Book Catalog",
    desc: "Thousands of titles, fully organised",
  },
  {
    icon: Users,
    label: "Member Hub",
    desc: "Seamless member lifecycle management",
  },
  {
    icon: TrendingUp,
    label: "Smart Analytics",
    desc: "Real-time insights & reports",
  },
  {
    icon: Shield,
    label: "Secure Access",
    desc: "Role-based permissions & audit trail",
  },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  // Prevent flash while redirecting
  if (token) return null;

  return (
    <div className="flex min-h-screen">
      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary text-primary-foreground p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <BookOpen className="h-7 w-7" />
          <span className="text-xl font-bold tracking-tight">LibraHub</span>
        </Link>

        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight">
              Your Modern Library
              <br />
              <span className="opacity-60">Management Platform</span>
            </h1>
            <p className="text-base leading-relaxed opacity-70">
              Track books, manage members, handle borrowings and fines — all in
              one unified, beautiful platform built for modern libraries.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl bg-primary-foreground/10 p-4"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs opacity-55">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <blockquote className="border-l-2 border-primary-foreground/30 pl-4 text-sm italic opacity-50">
          &ldquo;A library is not a luxury but one of the necessities of
          life.&rdquo;
          <br />
          <span className="font-medium not-italic">— Henry Ward Beecher</span>
        </blockquote>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Mobile header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 lg:hidden">
          <BookOpen className="h-5 w-5" />
          <Link href="/" className="text-lg font-bold">
            LibraHub
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
