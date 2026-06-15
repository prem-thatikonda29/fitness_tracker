import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Dumbbell } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getSessionDetail } from "@/lib/queries";
import { format } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteSessionButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUser();
  const { id } = await params;
  const detail = await getSessionDetail(userId, Number(id));
  if (!detail) notFound();

  const { session, exercises } = detail;
  const bodyPartNames = [...new Set(exercises.map((e) => e.bodyPartName))];
  const day = new Date(`${session.date}T12:00:00`);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button render={<Link href="/" />} nativeButton={false} variant="ghost" size="sm">
          <ChevronLeft className="size-4" /> Calendar
        </Button>
        <DeleteSessionButton sessionId={session.id} />
      </div>

      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">{format(day, "EEEE, d MMMM yyyy")}</p>
        <h1 className="text-2xl font-bold tracking-tight">
          {session.name || "Workout"}
        </h1>
        <div className="flex flex-wrap gap-1.5">
          {bodyPartNames.map((n) => (
            <Badge key={n}>{n}</Badge>
          ))}
        </div>
      </header>

      {exercises.length === 0 ? (
        <p className="text-muted-foreground">No exercises logged.</p>
      ) : (
        <div className="space-y-3">
          {exercises.map((ex) => (
            <Card key={ex.sessionExerciseId}>
              <CardContent className="space-y-2">
                <p className="flex items-center gap-2 font-medium">
                  <Dumbbell className="size-4 text-primary" />
                  {ex.exerciseName}
                  <span className="text-xs font-normal text-muted-foreground">
                    {ex.bodyPartName}
                  </span>
                </p>
                {ex.sets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sets recorded.</p>
                ) : (
                  <div className="space-y-1">
                    {ex.sets.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 text-sm tabular-nums"
                      >
                        <span className="w-10 text-muted-foreground">Set {s.setNumber}</span>
                        <span>{s.reps ?? "–"} reps</span>
                        <span className="text-muted-foreground">×</span>
                        <span>{s.weight != null ? `${s.weight} kg` : "–"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
