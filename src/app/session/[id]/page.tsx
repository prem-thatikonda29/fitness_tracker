import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Dumbbell, Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getSessionDetail } from "@/lib/queries";
import { format } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteSessionButton } from "./delete-button";
import { WorkoutReceipt } from "./workout-receipt";

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
  const exercisesByBodyPart = bodyPartNames.map((bodyPartName) => ({
    bodyPartName,
    exercises: exercises.filter((exercise) => exercise.bodyPartName === bodyPartName),
  }));
  const day = new Date(`${session.date}T12:00:00`);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button render={<Link href="/" />} nativeButton={false} variant="ghost" size="sm" data-testid="back-to-calendar">
          <ChevronLeft className="size-4" /> Calendar
        </Button>
        <div className="flex items-center gap-1">
          <Button
            render={<Link href={`/session/${session.id}/edit`} />}
            nativeButton={false}
            variant="ghost"
            size="sm"
            data-testid="edit-session-link"
          >
            <Pencil className="size-4" /> Edit
          </Button>
          <DeleteSessionButton sessionId={session.id} />
        </div>
      </div>

      <header className="space-y-2">
        <p className="text-sm text-muted-foreground" data-testid="session-date-label">{format(day, "EEEE, d MMMM yyyy")}</p>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="session-title">
          {session.name || "Workout"}
        </h1>
        <div className="flex flex-wrap gap-1.5">
          {bodyPartNames.map((n) => (
            <Badge key={n} data-testid="session-bodypart-badge" data-bodypart={n}>{n}</Badge>
          ))}
        </div>
      </header>

      <WorkoutReceipt
        dateLabel={format(day, "EEEE, d MMMM yyyy")}
        sessionName={session.name || "Workout"}
        bodyPartNames={bodyPartNames}
        exercises={exercises}
      />

      {exercises.length === 0 ? (
        <p className="text-muted-foreground" data-testid="empty-exercises-message">No exercises logged.</p>
      ) : (
        <div className="space-y-5">
          {exercisesByBodyPart.map((group) => (
            <section key={group.bodyPartName} className="space-y-2" data-testid="exercise-section" data-bodypart={group.bodyPartName}>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {group.bodyPartName}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-3">
                {group.exercises.map((ex) => (
                  <Card key={ex.sessionExerciseId} data-testid="exercise-card" data-exercise={ex.exerciseName}>
                    <CardContent className="space-y-2">
                      <p className="flex items-center gap-2 font-medium">
                        <Dumbbell className="size-4 text-primary" />
                        {ex.exerciseName}
                      </p>
                      {ex.sets.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No sets recorded.</p>
                      ) : (
                        <div className="space-y-1">
                          {ex.sets.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center gap-3 text-sm tabular-nums"
                              data-testid="set-row"
                              data-set-number={s.setNumber}
                            >
                              <span className="w-10 text-muted-foreground">
                                Set {s.setNumber}
                              </span>
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
