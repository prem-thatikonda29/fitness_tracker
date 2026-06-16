"use client";

import { useMemo, useRef, useState } from "react";
import { Download, ReceiptText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReceiptSet = {
  setNumber: number;
  reps: number | null;
  weight: number | null;
};

export type ReceiptExercise = {
  sessionExerciseId: number;
  exerciseName: string;
  bodyPartName: string;
  sets: ReceiptSet[];
};

type WorkoutReceiptProps = {
  dateLabel: string;
  sessionName: string;
  bodyPartNames: string[];
  exercises: ReceiptExercise[];
};

function formatWeight(weight: number | null) {
  if (weight == null) return null;
  return Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
}

function summarizeSets(sets: ReceiptSet[]) {
  if (sets.length === 0) return "No sets recorded";

  const reps = sets.map((set) => set.reps).filter((rep) => rep != null);
  const weights = sets.map((set) => set.weight).filter((weight) => weight != null);
  const hasOnlyReps = reps.length === sets.length;
  const hasOnlyWeights = weights.length === sets.length;
  const sameReps = hasOnlyReps && reps.every((rep) => rep === reps[0]);
  const sameWeight = hasOnlyWeights && weights.every((weight) => weight === weights[0]);

  const repText = sameReps
    ? `${sets.length}x${reps[0]}`
    : reps.length > 0
      ? `${reps.join("/")}${hasOnlyReps ? "" : " reps"}`
      : `${sets.length} sets`;

  if (weights.length === 0) return repText;

  const weightText = sameWeight
    ? `${formatWeight(weights[0])} kg`
    : `${weights.map(formatWeight).join("/")} kg`;

  return `${repText} @ ${weightText}`;
}

function buildShareText({
  dateLabel,
  sessionName,
  exercises,
}: WorkoutReceiptProps) {
  const lines = exercises.map(
    (exercise) => `${exercise.exerciseName} ${summarizeSets(exercise.sets)}`,
  );

  return [`${sessionName} - ${dateLabel}`, ...lines].join("\n");
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawTextFitted(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  let output = text;
  while (output.length > 3 && ctx.measureText(output).width > maxWidth) {
    output = `${output.slice(0, -4)}...`;
  }
  ctx.fillText(output, x, y);
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create receipt image."));
    }, "image/png");
  });
}

async function makePngFile(props: WorkoutReceiptProps, element: HTMLElement | null) {
  const rect = element?.getBoundingClientRect();
  const width = Math.max(320, Math.round(rect?.width ?? 390));
  const height = Math.max(240, Math.round(rect?.height ?? 360));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  ctx.clearRect(0, 0, width, height);

  roundedRect(ctx, 0, 0, width, height, 24);
  ctx.clip();

  const outer = ctx.createLinearGradient(0, 0, width, height);
  outer.addColorStop(0, "#386a55");
  outer.addColorStop(0.45, "#25453b");
  outer.addColorStop(1, "#172823");
  ctx.fillStyle = outer;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(36, 12, 4, 36, 12, Math.max(width, height) * 0.55);
  glow.addColorStop(0, "rgba(102, 213, 134, 0.52)");
  glow.addColorStop(0.38, "rgba(102, 213, 134, 0.12)");
  glow.addColorStop(1, "rgba(102, 213, 134, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const shine = ctx.createLinearGradient(0, 0, width, 0);
  shine.addColorStop(0, "rgba(255,255,255,0)");
  shine.addColorStop(0.5, "rgba(255,255,255,0.22)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 20, width, 16);

  const paperX = 12;
  const paperY = 12;
  const paperWidth = width - 24;
  const paperHeight = height - 24;
  roundedRect(ctx, paperX, paperY, paperWidth, paperHeight, 16);
  ctx.fillStyle = "#fff8dd";
  ctx.fill();

  const contentX = paperX + 20;
  const contentRight = paperX + paperWidth - 20;
  const contentWidth = contentRight - contentX;
  const totalSets = props.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);

  ctx.fillStyle = "#697f72";
  ctx.font = "700 12px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.letterSpacing = "3px";
  ctx.fillText("WORKOUT RECEIPT", contentX, paperY + 35);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#213c34";
  ctx.font = "800 24px ui-sans-serif, system-ui, sans-serif";
  drawTextFitted(ctx, props.sessionName, contentX, paperY + 70, contentWidth - 76);

  ctx.fillStyle = "#64786d";
  ctx.font = "600 14px ui-sans-serif, system-ui, sans-serif";
  drawTextFitted(ctx, props.dateLabel, contentX, paperY + 94, contentWidth - 76);

  const statWidth = 58;
  roundedRect(ctx, contentRight - statWidth, paperY + 24, statWidth, 42, 12);
  ctx.fillStyle = "#ddf0c8";
  ctx.fill();
  ctx.fillStyle = "#276243";
  ctx.font = "800 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "right";
  ctx.fillText(`${props.exercises.length} EX`, contentRight - 10, paperY + 42);
  ctx.fillText(`${totalSets} SETS`, contentRight - 10, paperY + 58);
  ctx.textAlign = "left";

  ctx.strokeStyle = "#b7c7a9";
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(contentX, paperY + 114);
  ctx.lineTo(contentRight, paperY + 114);
  ctx.stroke();
  ctx.setLineDash([]);

  let rowY = paperY + 143;
  const summaryMaxWidth = Math.min(132, contentWidth * 0.42);
  const nameMaxWidth = contentWidth - summaryMaxWidth - 18;

  if (props.exercises.length === 0) {
    ctx.fillStyle = "#64786d";
    ctx.font = "500 14px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("No exercises logged.", contentX, rowY);
  } else {
    for (const exercise of props.exercises) {
      ctx.fillStyle = "#213c34";
      ctx.font = "700 16px ui-sans-serif, system-ui, sans-serif";
      drawTextFitted(ctx, exercise.exerciseName, contentX, rowY, nameMaxWidth);

      ctx.fillStyle = "#71867b";
      ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
      drawTextFitted(ctx, exercise.bodyPartName, contentX, rowY + 18, nameMaxWidth);

      ctx.fillStyle = "#17714a";
      ctx.font = "800 14px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "right";
      drawTextFitted(ctx, summarizeSets(exercise.sets), contentRight, rowY, summaryMaxWidth);
      ctx.textAlign = "left";

      rowY += 42;
    }
  }

  ctx.strokeStyle = "#b7c7a9";
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(contentX, height - 61);
  ctx.lineTo(contentRight, height - 61);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#64786d";
  ctx.font = "800 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.letterSpacing = "2px";
  drawTextFitted(
    ctx,
    (props.bodyPartNames.join(" / ") || "Workout").toUpperCase(),
    contentX,
    height - 35,
    contentWidth,
  );
  ctx.letterSpacing = "0px";

  const blob = await canvasToBlob(canvas);
  const filename = `${props.sessionName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "workout"}-receipt.png`;

  return { blob, filename };
}

export function WorkoutReceipt(props: WorkoutReceiptProps) {
  const [status, setStatus] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const shareText = useMemo(() => buildShareText(props), [props]);
  const totalSets = props.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);

  async function downloadReceipt() {
    try {
      const { blob, filename } = await makePngFile(props, receiptRef.current);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("Receipt downloaded as PNG.");
    } catch {
      setStatus("Could not create the receipt image.");
    }
  }

  async function shareReceipt() {
    try {
      const { blob, filename } = await makePngFile(props, receiptRef.current);
      const file = new File([blob], filename, { type: blob.type });
      const canShareFile =
        typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({
          title: props.sessionName,
          text: shareText,
          files: [file],
        });
        setStatus("Receipt shared.");
        return;
      }

      if (typeof navigator.share === "function") {
        await navigator.share({
          title: props.sessionName,
          text: shareText,
        });
        setStatus("Workout summary shared.");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setStatus("Workout summary copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("Sharing is not available here. Download still works.");
    }
  }

  return (
    <section className="space-y-3" data-testid="workout-receipt">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Visual memento</p>
          <h2 className="text-xl font-bold tracking-tight">Workout receipt</h2>
        </div>
        <ReceiptText className="size-6 text-primary" />
      </div>

      <div
        ref={receiptRef}
        data-testid="receipt-visual"
        className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,oklch(0.78_0.16_145),transparent_34%),linear-gradient(135deg,oklch(0.25_0.04_170),oklch(0.14_0.03_180))] p-3 shadow-xl shadow-primary/10"
      >
        <div className="absolute left-0 right-0 top-5 h-4 bg-[linear-gradient(90deg,transparent,oklch(0.96_0.03_120/.28),transparent)]" />
        <div className="relative rounded-2xl bg-[#fff8dd] px-5 py-6 text-[#213c34] shadow-inner">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-dashed border-[#b7c7a9] pb-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-[#697f72]">
                Workout receipt
              </p>
              <h3 className="mt-2 text-2xl font-extrabold leading-tight">
                {props.sessionName}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#64786d]">{props.dateLabel}</p>
            </div>
            <div className="rounded-xl bg-[#ddf0c8] px-3 py-2 text-right font-mono text-xs font-bold text-[#276243]" data-testid="receipt-stats">
              <p>{props.exercises.length} EX</p>
              <p>{totalSets} SETS</p>
            </div>
          </div>

          <div className="space-y-3">
            {props.exercises.length === 0 ? (
              <p className="text-sm font-medium text-[#64786d]">No exercises logged.</p>
            ) : (
              props.exercises.map((exercise) => (
                <div
                  key={exercise.sessionExerciseId}
                  className="grid grid-cols-[1fr_auto] gap-3"
                  data-testid="receipt-exercise-row"
                  data-exercise={exercise.exerciseName}
                >
                  <div>
                    <p className="font-bold leading-tight">{exercise.exerciseName}</p>
                    <p className="text-xs font-semibold text-[#71867b]">
                      {exercise.bodyPartName}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-extrabold text-[#17714a]">
                    {summarizeSets(exercise.sets)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 border-t border-dashed border-[#b7c7a9] pt-4">
            <p className="truncate font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#64786d]">
              {props.bodyPartNames.join(" / ") || "Workout"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={downloadReceipt} data-testid="receipt-download-btn">
          <Download className="size-4" /> Download
        </Button>
        <Button onClick={shareReceipt} data-testid="receipt-share-btn">
          <Share2 className="size-4" /> Share
        </Button>
      </div>

      <p
        data-testid="receipt-status"
        className={cn(
          "min-h-5 text-center text-xs font-medium text-muted-foreground transition-opacity",
          status ? "opacity-100" : "opacity-0",
        )}
        aria-live="polite"
      >
        {status ?? "Receipt status"}
      </p>
    </section>
  );
}
