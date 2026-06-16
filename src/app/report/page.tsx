import Link from "next/link";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getBodyPartCounts, getSessionsInRange } from "@/lib/queries";
import { weekRange, fmt, format, addWeeks, startOfWeek } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const userId = await requireUser();
  const { w } = await searchParams;

  const anchor = w ? new Date(`${w}T12:00:00`) : new Date();
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const { from, to } = weekRange(anchor);

  const [counts, weekSessions] = await Promise.all([
    getBodyPartCounts(userId, from, to),
    getSessionsInRange(userId, from, to),
  ]);

  const max = Math.max(1, ...counts.map((c) => c.count));
  const prev = fmt(addWeeks(weekStart, -1));
  const next = fmt(addWeeks(weekStart, 1));
  const thisWeekStart = fmt(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const isThisWeek = fmt(weekStart) === thisWeekStart;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight" data-testid="report-title">Weekly report</h1>

      <div className="flex items-center justify-between">
        <Button render={<Link href={`/report?w=${prev}`} />} nativeButton={false} variant="ghost" size="icon" data-testid="report-week-prev">
          <ChevronLeft className="size-5" />
        </Button>
        <div className="text-center">
          <p className="font-semibold" data-testid="report-week-label">
            {isThisWeek ? "This week" : "Week of"}
          </p>
          <p className="text-sm text-muted-foreground" data-testid="report-week-range">
            {format(new Date(`${from}T12:00:00`), "d MMM")} –{" "}
            {format(new Date(`${to}T12:00:00`), "d MMM")}
          </p>
        </div>
        {isThisWeek ? (
          <Button variant="ghost" size="icon" disabled data-testid="report-week-next">
            <ChevronRight className="size-5" />
          </Button>
        ) : (
          <Button render={<Link href={`/report?w=${next}`} />} nativeButton={false} variant="ghost" size="icon" data-testid="report-week-next">
            <ChevronRight className="size-5" />
          </Button>
        )}
      </div>

      <Card data-testid="report-stats">
        <CardContent className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold" data-testid="report-workout-count">{weekSessions.length}</p>
            <p className="text-sm text-muted-foreground">workouts</p>
          </div>
          <div>
            <p className="text-3xl font-bold" data-testid="report-bodypart-count">{counts.length}</p>
            <p className="text-sm text-muted-foreground">body parts hit</p>
          </div>
        </CardContent>
      </Card>

      {counts.length === 0 ? (
        <Card data-testid="report-empty">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <BarChart3 className="size-8" />
            <p>No workouts logged this week.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Times trained
            </p>
            {counts.map((c) => (
              <div key={c.name} className="space-y-1" data-testid="report-bodypart-bar" data-bodypart={c.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="tabular-nums text-muted-foreground">×{c.count}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(c.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
