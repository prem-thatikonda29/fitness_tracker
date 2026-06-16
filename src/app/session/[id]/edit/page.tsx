import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getBodyParts,
  getExercises,
  getRoutines,
  getSessionDetail,
} from "@/lib/queries";
import { LogForm } from "@/app/log/log-form";

export const dynamic = "force-dynamic";

type SetRow = { reps: string; weight: string };

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUser();
  const { id } = await params;
  const sessionId = Number(id);

  const [bodyParts, exercises, routines, detail] = await Promise.all([
    getBodyParts(userId),
    getExercises(userId),
    getRoutines(userId),
    getSessionDetail(userId, sessionId),
  ]);

  if (!detail) notFound();

  // Build the form's initial selection from the saved session.
  const initialSelected: Record<number, SetRow[]> = {};
  for (const ex of detail.exercises) {
    initialSelected[ex.exerciseId] =
      ex.sets.length > 0
        ? ex.sets.map((s) => ({
            reps: s.reps != null ? String(s.reps) : "",
            weight: s.weight != null ? String(s.weight) : "",
          }))
        : [{ reps: "", weight: "" }];
  }

  return (
    <LogForm
      defaultDate={detail.session.date}
      bodyParts={bodyParts}
      exercises={exercises}
      routines={routines}
      initialRoutineId={null}
      prefillExerciseIds={[]}
      editSessionId={sessionId}
      initialName={detail.session.name ?? ""}
      initialSelected={initialSelected}
    />
  );
}
