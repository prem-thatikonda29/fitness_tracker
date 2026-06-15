import { requireUser } from "@/lib/auth";
import { getBodyParts, getExercises, getRoutines, getRoutineExerciseIds } from "@/lib/queries";
import { LogForm } from "./log-form";
import { fmt } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; routine?: string }>;
}) {
  const userId = await requireUser();
  const { date, routine } = await searchParams;

  const [bodyParts, exercises, routines] = await Promise.all([
    getBodyParts(userId),
    getExercises(userId),
    getRoutines(userId),
  ]);

  // If a routine is preselected (e.g. from /routines), pre-fill its exercises.
  const prefillExerciseIds = routine
    ? await getRoutineExerciseIds(userId, Number(routine))
    : [];

  return (
    <LogForm
      defaultDate={date ?? fmt(new Date())}
      bodyParts={bodyParts}
      exercises={exercises}
      routines={routines}
      initialRoutineId={routine ? Number(routine) : null}
      prefillExerciseIds={prefillExerciseIds}
    />
  );
}
