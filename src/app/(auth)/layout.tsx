import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-primary p-12 text-primary-foreground">
        <BookOpen className="mb-6 h-16 w-16" />
        <h1 className="mb-2 text-4xl font-bold">LibraHub</h1>
        <p className="text-center text-lg opacity-90">
          A modern library management system for efficient book tracking,
          member management, and seamless operations.
        </p>
      </div>
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2 lg:hidden">
            <BookOpen className="h-6 w-6" />
            <Link href="/" className="text-xl font-bold">
              LibraHub
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
