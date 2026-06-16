import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, Plus, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getSessionsInRange, getBodyPartCounts } from "@/lib/queries";
import { monthGrid, weekRange, fmt, format, startOfMonth, addMonths } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const userId = await requireUser();
  const { m } = await searchParams;

  // Anchor month: ?m=yyyy-MM, default current month. Noon to avoid TZ drift.
  const anchor = m ? new Date(`${m}-01T12:00:00`) : new Date();
  const month = startOfMonth(anchor);
  const days = monthGrid(month);
  const today = fmt(new Date());
  const { from, to } = weekRange(new Date());

  // Run both reads in parallel — they don't depend on each other.
  const [monthSessions, weekCounts] = await Promise.all([
    getSessionsInRange(userId, fmt(days[0]), fmt(days[days.length - 1])),
    getBodyPartCounts(userId, from, to),
  ]);

  const byDate = new Map<string, number>();
  for (const s of monthSessions) byDate.set(s.date, s.id);
  const weekTotal = monthSessions.filter((s) => s.date >= from && s.date <= to).length;

  const prev = format(addMonths(month, -1), "yyyy-MM");
  const next = format(addMonths(month, 1), "yyyy-MM");
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between" data-testid="calendar-header">
        <h1 className="text-2xl font-bold tracking-tight">Workouts</h1>
        <UserButton />
      </header>

      <Card data-testid="week-summary">
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">This week</p>
          <p className="text-xl font-semibold" data-testid="week-workout-count">
            {weekTotal} {weekTotal === 1 ? "workout" : "workouts"}
          </p>
          {weekCounts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {weekCounts.map((c) => (
                <Badge key={c.name} variant="secondary" data-testid="week-bodypart-badge" data-bodypart={c.name}>
                  {c.name} ×{c.count}
                </Badge>
              ))}
            </div>
          )}
          <Link
            href="/report"
            data-testid="report-link"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Full report <ArrowRight className="size-3.5" />
          </Link>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button render={<Link href={`/?m=${prev}`} />} nativeButton={false} variant="ghost" size="icon" data-testid="month-prev">
          <ChevronLeft className="size-5" />
        </Button>
        <h2 className="font-semibold" data-testid="month-title">{format(month, "MMMM yyyy")}</h2>
        <Button render={<Link href={`/?m=${next}`} />} nativeButton={false} variant="ghost" size="icon" data-testid="month-next">
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center" data-testid="calendar-grid">
        {weekdays.map((d, i) => (
          <div key={i} className="pb-1 text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const iso = fmt(day);
          const sessionId = byDate.get(iso);
          const inMonth = day.getMonth() === month.getMonth();
          const isToday = iso === today;
          const href = sessionId ? `/session/${sessionId}` : `/log?date=${iso}`;
          return (
            <Link
              key={iso}
              href={href}
              data-testid="calendar-day"
              data-date={iso}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl border text-sm",
                inMonth ? "border-border" : "border-transparent text-muted-foreground/40",
                sessionId
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "bg-card",
                isToday && !sessionId && "ring-1 ring-primary",
              )}
            >
              {format(day, "d")}
            </Link>
          );
        })}
      </div>

      <Button render={<Link href="/log" />} nativeButton={false} className="w-full" size="lg" data-testid="log-workout-btn">
        <Plus className="size-4" /> Log a workout
      </Button>
    </div>
  );
}
