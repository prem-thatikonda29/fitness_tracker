"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteRoutine } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function DeleteRoutineButton({ routineId }: { routineId: number }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive"
      disabled={pending}
      onClick={() => start(() => void deleteRoutine(routineId))}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
