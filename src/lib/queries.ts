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
import { and, eq, gte, lte, asc } from "drizzle-orm";

export async function getBodyParts(userId: string) {
  return db
    .select()
    .from(bodyParts)
    .where(eq(bodyParts.userId, userId))
    .orderBy(asc(bodyParts.id));
}

export async function getExercises(userId: string) {
  return db
    .select()
    .from(exercises)
    .where(eq(exercises.userId, userId))
    .orderBy(asc(exercises.name));
}

export async function getRoutines(userId: string) {
  return db
    .select()
    .from(routines)
    .where(eq(routines.userId, userId))
    .orderBy(asc(routines.name));
}

// Exercise ids belonging to a routine (used to pre-fill a session).
export async function getRoutineExerciseIds(userId: string, routineId: number) {
  const [r] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(and(eq(routines.id, routineId), eq(routines.userId, userId)));
  if (!r) return [];
  const rows = await db
    .select({ exerciseId: routineExercises.exerciseId })
    .from(routineExercises)
    .where(eq(routineExercises.routineId, routineId));
  return rows.map((x) => x.exerciseId);
}

// Sessions in a date range (inclusive). Dates as 'yyyy-MM-dd'.
export async function getSessionsInRange(userId: string, from: string, to: string) {
  return db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        gte(sessions.date, from),
        lte(sessions.date, to),
      ),
    )
    .orderBy(asc(sessions.date));
}

// Full detail for one session: exercises with their body part + sets.
export async function getSessionDetail(userId: string, sessionId: number) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
  if (!session) return null;

  const rows = await db
    .select({
      sessionExerciseId: sessionExercises.id,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      bodyPartId: bodyParts.id,
      bodyPartName: bodyParts.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(sessionExercises)
    .innerJoin(exercises, eq(sessionExercises.exerciseId, exercises.id))
    .innerJoin(bodyParts, eq(exercises.bodyPartId, bodyParts.id))
    .leftJoin(sets, eq(sets.sessionExerciseId, sessionExercises.id))
    .where(eq(sessionExercises.sessionId, sessionId))
    .orderBy(asc(sessionExercises.id), asc(sets.setNumber));

  // Group rows into exercises -> sets.
  const exMap = new Map<
    number,
    {
      sessionExerciseId: number;
      exerciseId: number;
      exerciseName: string;
      bodyPartId: number;
      bodyPartName: string;
      sets: { id: number; setNumber: number; reps: number | null; weight: number | null }[];
    }
  >();
  for (const r of rows) {
    let ex = exMap.get(r.sessionExerciseId);
    if (!ex) {
      ex = {
        sessionExerciseId: r.sessionExerciseId,
        exerciseId: r.exerciseId,
        exerciseName: r.exerciseName,
        bodyPartId: r.bodyPartId,
        bodyPartName: r.bodyPartName,
        sets: [],
      };
      exMap.set(r.sessionExerciseId, ex);
    }
    if (r.setId != null) {
      ex.sets.push({
        id: r.setId,
        setNumber: r.setNumber!,
        reps: r.reps,
        weight: r.weight,
      });
    }
  }
  return { session, exercises: Array.from(exMap.values()) };
}

// Count of how many times each body part was trained within a date range.
export async function getBodyPartCounts(userId: string, from: string, to: string) {
  const rows = await db
    .select({
      sessionId: sessions.id,
      bodyPartId: bodyParts.id,
      bodyPartName: bodyParts.name,
    })
    .from(sessions)
    .innerJoin(sessionExercises, eq(sessionExercises.sessionId, sessions.id))
    .innerJoin(exercises, eq(sessionExercises.exerciseId, exercises.id))
    .innerJoin(bodyParts, eq(exercises.bodyPartId, bodyParts.id))
    .where(
      and(
        eq(sessions.userId, userId),
        gte(sessions.date, from),
        lte(sessions.date, to),
      ),
    );

  // Count distinct sessions per body part (one session trains a body part once).
  const seen = new Set<string>();
  const counts = new Map<string, { name: string; count: number }>();
  for (const r of rows) {
    const key = `${r.sessionId}:${r.bodyPartId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const c = counts.get(r.bodyPartName) ?? { name: r.bodyPartName, count: 0 };
    c.count += 1;
    counts.set(r.bodyPartName, c);
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}
