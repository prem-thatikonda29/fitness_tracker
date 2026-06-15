import {
  pgTable,
  serial,
  text,
  integer,
  date,
  timestamp,
  real,
  index,
} from "drizzle-orm/pg-core";

// Body parts / muscle groups. Scoped per user; seeded with a standard split on first login.
export const bodyParts = pgTable(
  "body_parts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("body_parts_user_idx").on(t.userId)],
);

// Exercises belong to a body part. Seeded defaults + user-added.
export const exercises = pgTable(
  "exercises",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    bodyPartId: integer("body_part_id")
      .notNull()
      .references(() => bodyParts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("exercises_user_idx").on(t.userId)],
);

// Reusable workout templates (e.g. "My Push Day"). split: standard | ppl | custom
export const routines = pgTable(
  "routines",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    split: text("split").notNull().default("custom"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("routines_user_idx").on(t.userId)],
);

export const routineExercises = pgTable(
  "routine_exercises",
  {
    id: serial("id").primaryKey(),
    routineId: integer("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
  },
  (t) => [index("routine_exercises_routine_idx").on(t.routineId)],
);

// One logged workout = one day's session.
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: date("date").notNull(),
    name: text("name"),
    routineId: integer("routine_id").references(() => routines.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("sessions_user_date_idx").on(t.userId, t.date)],
);

export const sessionExercises = pgTable(
  "session_exercises",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_exercises_session_idx").on(t.sessionId)],
);

export const sets = pgTable(
  "sets",
  {
    id: serial("id").primaryKey(),
    sessionExerciseId: integer("session_exercise_id")
      .notNull()
      .references(() => sessionExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    reps: integer("reps"),
    weight: real("weight"),
  },
  (t) => [index("sets_session_exercise_idx").on(t.sessionExerciseId)],
);

export type BodyPart = typeof bodyParts.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type Session = typeof sessions.$inferSelect;
