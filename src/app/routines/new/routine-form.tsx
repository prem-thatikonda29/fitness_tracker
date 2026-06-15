"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Check } from "lucide-react";
import type { BodyPart, Exercise } from "@/db/schema";
import { createRoutine } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function RoutineForm({
  bodyParts,
  exercises,
}: {
  bodyParts: BodyPart[];
  exercises: Exercise[];
}) {
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [split, setSplit] = useState("custom");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const grouped = useMemo(
    () =>
      bodyParts
        .map((bp) => ({
          bp,
          exercises: exercises.filter((e) => e.bodyPartId === bp.id),
        }))
        .filter((g) => g.exercises.length > 0),
    [bodyParts, exercises],
  );

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <Button render={<Link href="/routines" />} nativeButton={false} variant="ghost" size="sm">
        <ChevronLeft className="size-4" /> Routines
      </Button>
      <h1 className="text-2xl font-bold tracking-tight">New routine</h1>

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g. My Push Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Split type</Label>
        <Select value={split} onValueChange={(v) => setSplit(v ?? "custom")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="ppl">Push / Pull / Legs</SelectItem>
            <SelectItem value="standard">Standard split</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Exercises ({selected.size} selected)</Label>
        {grouped.map(({ bp, exercises }) => (
          <div key={bp.id} className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{bp.name}</p>
            <div className="flex flex-wrap gap-2">
              {exercises.map((ex) => {
                const on = selected.has(ex.id);
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => toggle(ex.id)}
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
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={pending || !name.trim() || selected.size === 0}
        onClick={() =>
          start(() =>
            createRoutine({
              name,
              split,
              exerciseIds: Array.from(selected),
            }),
          )
        }
      >
        {pending ? "Saving…" : "Save routine"}
      </Button>
    </div>
  );
}
