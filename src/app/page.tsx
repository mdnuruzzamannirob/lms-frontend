import Link from "next/link";
import { BookOpen, BookCopy, Users, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="flex h-14 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 font-bold text-lg">
          <BookOpen className="h-5 w-5" />
          LibraHub
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">Sign In</Link>
          <Link href="/register">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight">
            Modern Library Management
          </h1>
          <p className="text-lg text-muted-foreground">
            LibraHub streamlines book tracking, member management, borrowing,
            fines, and reservations — all in one place.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link href="/register">Get Started Free</Link>
            <Link href="/login">Sign In</Link>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mt-8 max-w-3xl w-full">
          {[
            {
              icon: BookOpen,
              label: "Book Catalog",
              desc: "Manage your entire collection",
            },
            {
              icon: Users,
              label: "Members",
              desc: "Track membership & activity",
            },
            {
              icon: BookCopy,
              label: "Borrows",
              desc: "Issue & return with ease",
            },
            { icon: BarChart3, label: "Reports", desc: "Insights at a glance" },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border p-4"
            >
              <Icon className="h-8 w-8 text-primary" />
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground text-center">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LibraHub. All rights reserved.
      </footer>
    </div>
  );
}
