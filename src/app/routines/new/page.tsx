import { requireUser } from "@/lib/auth";
import { getBodyParts, getExercises } from "@/lib/queries";
import { RoutineForm } from "./routine-form";

export const dynamic = "force-dynamic";

export default async function NewRoutinePage() {
  const userId = await requireUser();
  const [bodyParts, exercises] = await Promise.all([
    getBodyParts(userId),
    getExercises(userId),
  ]);
  return <RoutineForm bodyParts={bodyParts} exercises={exercises} />;
}
