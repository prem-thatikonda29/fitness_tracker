"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, Dumbbell } from "lucide-react";
import type { BodyPart, Exercise, Routine } from "@/db/schema";
import { addExercise, addBodyPart, createSession, updateSession } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type SetRow = { reps: string; weight: string };
type Selected = Record<number, SetRow[]>; // exerciseId -> sets

export function LogForm({
  defaultDate,
  bodyParts,
  exercises,
  routines,
  initialRoutineId,
  prefillExerciseIds,
  editSessionId,
  initialName,
  initialSelected,
}: {
  defaultDate: string;
  bodyParts: BodyPart[];
  exercises: Exercise[];
  routines: Routine[];
  initialRoutineId: number | null;
  prefillExerciseIds: number[];
  editSessionId?: number;
  initialName?: string;
  initialSelected?: Selected;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = editSessionId != null;

  const [date, setDate] = useState(defaultDate);
  const [name, setName] = useState(initialName ?? "");
  const [selected, setSelected] = useState<Selected>(() => {
    if (initialSelected) return initialSelected;
    const init: Selected = {};
    for (const id of prefillExerciseIds) init[id] = [{ reps: "", weight: "" }];
    return init;
  });
  // Multiple body parts can be active at once. Seed from prefilled/edited exercises.
  const [activeBodyParts, setActiveBodyParts] = useState<Set<number>>(() => {
    const ids = new Set<number>();
    const seedIds = initialSelected
      ? Object.keys(initialSelected).map(Number)
      : prefillExerciseIds;
    for (const id of seedIds) {
      const ex = exercises.find((e) => e.id === id);
      if (ex) ids.add(ex.bodyPartId);
    }
    if (ids.size === 0 && bodyParts[0]) ids.add(bodyParts[0].id);
    return ids;
  });

  function toggleBodyPart(id: number) {
    setActiveBodyParts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const exercisesByBodyPart = useMemo(() => {
    const map = new Map<number, Exercise[]>();
    for (const e of exercises) {
      const arr = map.get(e.bodyPartId) ?? [];
      arr.push(e);
      map.set(e.bodyPartId, arr);
    }
    return map;
  }, [exercises]);

  const exerciseName = (id: number) => exercises.find((e) => e.id === id)?.name ?? "";
  const selectedIds = Object.keys(selected).map(Number);

  function toggleExercise(id: number) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = [{ reps: "", weight: "" }];
      return next;
    });
  }

  function updateSet(exId: number, idx: number, field: keyof SetRow, value: string) {
    setSelected((prev) => {
      const rows = prev[exId].map((r, i) => (i === idx ? { ...r, [field]: value } : r));
      return { ...prev, [exId]: rows };
    });
  }

  function addSet(exId: number) {
    setSelected((prev) => ({ ...prev, [exId]: [...prev[exId], { reps: "", weight: "" }] }));
  }

  function removeSet(exId: number, idx: number) {
    setSelected((prev) => ({
      ...prev,
      [exId]: prev[exId].filter((_, i) => i !== idx),
    }));
  }

  function onRoutineChange(value: string | null) {
    // Re-run the server page so it prefills the routine's exercises.
    const params = new URLSearchParams({ date });
    if (value && value !== "none") params.set("routine", value);
    router.push(`/log?${params.toString()}`);
  }

  function save() {
    const exercisesPayload = selectedIds.map((exerciseId) => ({
      exerciseId,
      sets: selected[exerciseId].map((s) => ({
        reps: s.reps === "" ? null : Number(s.reps),
        weight: s.weight === "" ? null : Number(s.weight),
      })),
    }));
    startTransition(() => {
      if (isEdit) {
        updateSession(editSessionId, {
          date,
          name: name || null,
          exercises: exercisesPayload,
        });
      } else {
        createSession({
          date,
          name: name || null,
          routineId: initialRoutineId,
          exercises: exercisesPayload,
        });
      }
    });
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">
        {isEdit ? "Edit workout" : "Log workout"}
      </h1>

      <div className={cn("grid gap-3", isEdit ? "grid-cols-1" : "grid-cols-2")}>
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        {!isEdit && (
        <div className="space-y-1.5">
          <Label>Routine</Label>
          <Select
            value={initialRoutineId ? String(initialRoutineId) : "none"}
            onValueChange={onRoutineChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Blank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Blank</SelectItem>
              {routines.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Name (optional)</Label>
        <Input
          id="name"
          placeholder="e.g. Morning push"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Body part selector — select as many as you're training today */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Body parts</Label>
          <AddBodyPartDialog onAdded={() => router.refresh()} />
        </div>
        <div className="flex flex-wrap gap-2">
          {bodyParts.map((bp) => {
            const on = activeBodyParts.has(bp.id);
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => toggleBodyPart(bp.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground",
                )}
              >
                {on && <Check className="size-3.5" />}
                {bp.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise picker — one group per selected body part */}
      {bodyParts
        .filter((bp) => activeBodyParts.has(bp.id))
        .map((bp) => (
          <div key={bp.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{bp.name}</Label>
              <AddExerciseDialog
                bodyPartId={bp.id}
                bodyPartName={bp.name}
                onAdded={() => router.refresh()}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(exercisesByBodyPart.get(bp.id) ?? []).map((ex) => {
                const on = !!selected[ex.id];
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => toggleExercise(ex.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      on
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {on && <Check className="size-3.5 text-primary" />}
                    {ex.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      {/* Selected exercises with sets */}
      {selectedIds.length > 0 && (
        <div className="space-y-3">
          <Label>Your session</Label>
          {selectedIds.map((exId) => (
            <Card key={exId}>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 font-medium">
                    <Dumbbell className="size-4 text-primary" />
                    {exerciseName(exId)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExercise(exId)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[2rem_1fr_1fr_2rem] items-center gap-2 text-xs text-muted-foreground">
                    <span>Set</span>
                    <span>Reps</span>
                    <span>Weight (kg)</span>
                    <span />
                  </div>
                  {selected[exId].map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[2rem_1fr_1fr_2rem] items-center gap-2"
                    >
                      <span className="text-sm text-muted-foreground">{idx + 1}</span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="–"
                        value={row.reps}
                        onChange={(e) => updateSet(exId, idx, "reps", e.target.value)}
                      />
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="–"
                        value={row.weight}
                        onChange={(e) => updateSet(exId, idx, "weight", e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => removeSet(exId, idx)}
                        disabled={selected[exId].length === 1}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => addSet(exId)}
                  >
                    <Plus className="size-3.5" /> Add set
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={save}
        disabled={pending || selectedIds.length === 0}
      >
        {pending ? "Saving…" : isEdit ? "Save changes" : "Save workout"}
      </Button>
    </div>
  );
}

function AddBodyPartDialog({ onAdded }: { onAdded: () => void }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Plus className="size-3.5" /> Body part
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add body part</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="e.g. Forearms"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            disabled={pending || !value.trim()}
            onClick={() =>
              start(async () => {
                await addBodyPart(value);
                setValue("");
                setOpen(false);
                onAdded();
              })
            }
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddExerciseDialog({
  bodyPartId,
  bodyPartName,
  onAdded,
}: {
  bodyPartId: number;
  bodyPartName: string;
  onAdded: () => void;
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Plus className="size-3.5" /> Exercise
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add exercise to {bodyPartName}</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="e.g. Cable Crossover"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            disabled={pending || !value.trim()}
            onClick={() =>
              start(async () => {
                await addExercise(bodyPartId, value);
                setValue("");
                setOpen(false);
                onAdded();
              })
            }
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
