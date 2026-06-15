"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Plus, ClipboardList, BarChart3, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Calendar", icon: Calendar },
  { href: "/log", label: "Log", icon: Plus },
  { href: "/routines", label: "Routines", icon: ClipboardList },
  { href: "/report", label: "Report", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return null;
  }
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
      <div className="grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
