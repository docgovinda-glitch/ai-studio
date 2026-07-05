"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("is_authenticated");
      if (isAuth !== "true") {
        router.replace("/login");
      } else {
        setTimeout(() => {
          setAuthorized(true);
        }, 0);
      }
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-semibold">Authorizing Everest AI Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="flex min-h-svh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
