import Link from "next/link";
import { Plus, ClipboardList, Play } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRoutines } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteRoutineButton } from "./delete-button";

export const dynamic = "force-dynamic";

const splitLabel: Record<string, string> = {
  ppl: "Push / Pull / Legs",
  standard: "Standard split",
  custom: "Custom",
};

export default async function RoutinesPage() {
  const userId = await requireUser();
  const routines = await getRoutines(userId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between" data-testid="routines-header">
        <h1 className="text-2xl font-bold tracking-tight" data-testid="routines-title">Routines</h1>
        <Button render={<Link href="/routines/new" />} nativeButton={false} size="sm" data-testid="new-routine-btn">
          <Plus className="size-4" /> New
        </Button>
      </div>

      {routines.length === 0 ? (
        <Card data-testid="routines-empty">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <ClipboardList className="size-8" />
            <p>No routines yet. Create one to pre-fill your workouts.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {routines.map((r) => (
            <Card key={r.id} data-testid="routine-card" data-routine={r.name}>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium" data-testid="routine-name">{r.name}</p>
                  <Badge variant="secondary" data-testid="routine-split-badge">{splitLabel[r.split] ?? "Custom"}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button render={<Link href={`/log?routine=${r.id}`} />} nativeButton={false} size="sm" variant="outline" data-testid="use-routine-btn" data-routine={r.name}>
                    <Play className="size-3.5" /> Use
                  </Button>
                  <DeleteRoutineButton routineId={r.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
