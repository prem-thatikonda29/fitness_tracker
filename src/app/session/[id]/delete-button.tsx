"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSession } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export function DeleteSessionButton({ sessionId }: { sessionId: number }) {
  const [pending, start] = useTransition();
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-destructive" data-testid="delete-session-btn" />}>
        <Trash2 className="size-4" /> Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this workout?</DialogTitle>
          <DialogDescription>This can&apos;t be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" data-testid="delete-session-cancel" />}>Cancel</DialogClose>
          <Button
            variant="destructive"
            disabled={pending}
            data-testid="delete-session-confirm"
            onClick={() => start(() => void deleteSession(sessionId))}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
