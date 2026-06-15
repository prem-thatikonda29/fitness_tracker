"use server";

import { db } from "@/db";
import {
  bodyParts,
  exercises,
  routines,
  routineExercises,
  sessions,
  sessionExercises,
  sets,
} from "@/db/schema";
import { requireUser } from "./auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addBodyPart(name: string) {
  const userId = await requireUser();
  const clean = name.trim();
  if (!clean) return;
  const [bp] = await db
    .insert(bodyParts)
    .values({ userId, name: clean })
    .returning();
  revalidatePath("/log");
  revalidatePath("/routines");
  return bp;
}

export async function addExercise(bodyPartId: number, name: string) {
  const userId = await requireUser();
  const clean = name.trim();
  if (!clean) return;
  // Ensure the body part belongs to this user.
  const [bp] = await db
    .select()
    .from(bodyParts)
    .where(and(eq(bodyParts.id, bodyPartId), eq(bodyParts.userId, userId)));
  if (!bp) return;
  const [ex] = await db
    .insert(exercises)
    .values({ userId, bodyPartId, name: clean })
    .returning();
  revalidatePath("/log");
  revalidatePath("/routines");
  return ex;
}

type SetInput = { reps: number | null; weight: number | null };
type ExerciseInput = { exerciseId: number; sets: SetInput[] };

// Create a logged session with its exercises + sets.
export async function createSession(input: {
  date: string;
  name: string | null;
  routineId: number | null;
  exercises: ExerciseInput[];
}) {
  const userId = await requireUser();

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      date: input.date,
      name: input.name?.trim() || null,
      routineId: input.routineId,
    })
    .returning();

  for (const ex of input.exercises) {
    const [se] = await db
      .insert(sessionExercises)
      .values({ sessionId: session.id, exerciseId: ex.exerciseId })
      .returning();
    const validSets = ex.sets.filter((s) => s.reps != null || s.weight != null);
    if (validSets.length > 0) {
      await db.insert(sets).values(
        validSets.map((s, i) => ({
          sessionExerciseId: se.id,
          setNumber: i + 1,
          reps: s.reps,
          weight: s.weight,
        })),
      );
    }
  }

  revalidatePath("/");
  revalidatePath("/report");
  redirect(`/session/${session.id}`);
}

export async function deleteSession(sessionId: number) {
  const userId = await requireUser();
  await db
    .delete(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
  revalidatePath("/");
  revalidatePath("/report");
  redirect("/");
}

// Create a reusable routine from a name + list of exercise ids.
export async function createRoutine(input: {
  name: string;
  split: string;
  exerciseIds: number[];
}) {
  const userId = await requireUser();
  const clean = input.name.trim();
  if (!clean) return;
  const [routine] = await db
    .insert(routines)
    .values({ userId, name: clean, split: input.split || "custom" })
    .returning();
  if (input.exerciseIds.length > 0) {
    await db.insert(routineExercises).values(
      input.exerciseIds.map((exerciseId) => ({
        routineId: routine.id,
        exerciseId,
      })),
    );
  }
  revalidatePath("/routines");
  revalidatePath("/log");
  redirect("/routines");
}

export async function deleteRoutine(routineId: number) {
  const userId = await requireUser();
  await db
    .delete(routines)
    .where(and(eq(routines.id, routineId), eq(routines.userId, userId)));
  revalidatePath("/routines");
}
