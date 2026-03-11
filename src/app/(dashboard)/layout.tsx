"use client";

import { useRequireAuth } from "@/hooks/useAuth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { PageLoader } from "@/components/shared/LoadingSpinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
