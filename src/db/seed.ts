import { db } from "./index";
import { bodyParts, exercises, routines, routineExercises } from "./schema";
import { eq } from "drizzle-orm";

// Default body parts + a few exercises each (standard gym split).
const DEFAULTS: Record<string, string[]> = {
  Chest: ["Bench Press", "Incline Dumbbell Press", "Cable Fly", "Push-up"],
  Back: ["Deadlift", "Pull-up", "Barbell Row", "Lat Pulldown"],
  Shoulders: ["Overhead Press", "Lateral Raise", "Face Pull"],
  Biceps: ["Barbell Curl", "Hammer Curl", "Preacher Curl"],
  Triceps: ["Tricep Pushdown", "Skullcrusher", "Dips"],
  Legs: ["Squat", "Leg Press", "Romanian Deadlift", "Leg Curl", "Calf Raise"],
  Core: ["Plank", "Hanging Leg Raise", "Cable Crunch"],
  Cardio: ["Treadmill Run", "Cycling", "Rowing"],
};

// Preset routines defined by which body parts they pull exercises from.
const PRESETS: { name: string; split: string; bodyParts: string[] }[] = [
  { name: "Push Day", split: "ppl", bodyParts: ["Chest", "Shoulders", "Triceps"] },
  { name: "Pull Day", split: "ppl", bodyParts: ["Back", "Biceps"] },
  { name: "Leg Day", split: "ppl", bodyParts: ["Legs", "Core"] },
  { name: "Upper Body", split: "standard", bodyParts: ["Chest", "Back", "Shoulders", "Biceps", "Triceps"] },
  { name: "Lower Body", split: "standard", bodyParts: ["Legs", "Core"] },
];

/**
 * Seed default body parts, exercises, and preset routines for a brand-new user.
 * Idempotent: no-op if the user already has body parts.
 */
export async function seedUserDefaults(userId: string) {
  const existing = await db
    .select({ id: bodyParts.id })
    .from(bodyParts)
    .where(eq(bodyParts.userId, userId))
    .limit(1);
  if (existing.length > 0) return;

  // Insert body parts and remember their ids by name.
  const bpByName = new Map<string, number>();
  const exByBodyPart = new Map<string, number[]>();

  for (const [name, exNames] of Object.entries(DEFAULTS)) {
    const [bp] = await db
      .insert(bodyParts)
      .values({ userId, name })
      .returning({ id: bodyParts.id });
    bpByName.set(name, bp.id);

    const inserted = await db
      .insert(exercises)
      .values(exNames.map((n) => ({ userId, bodyPartId: bp.id, name: n })))
      .returning({ id: exercises.id });
    exByBodyPart.set(
      name,
      inserted.map((e) => e.id),
    );
  }

  // Build preset routines: include the first 2 exercises from each body part.
  for (const preset of PRESETS) {
    const [routine] = await db
      .insert(routines)
      .values({ userId, name: preset.name, split: preset.split })
      .returning({ id: routines.id });

    const exIds = preset.bodyParts.flatMap(
      (bp) => (exByBodyPart.get(bp) ?? []).slice(0, 2),
    );
    if (exIds.length > 0) {
      await db.insert(routineExercises).values(
        exIds.map((exerciseId) => ({ routineId: routine.id, exerciseId })),
      );
    }
  }
}
