import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
} from "date-fns";

export const ISO = "yyyy-MM-dd";
export const fmt = (d: Date) => format(d, ISO);

// All day-cells for a month grid (weeks start Monday), including padding days.
export function monthGrid(monthDate: Date) {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

export function weekRange(d: Date) {
  return {
    from: fmt(startOfWeek(d, { weekStartsOn: 1 })),
    to: fmt(endOfWeek(d, { weekStartsOn: 1 })),
  };
}

export { format, startOfMonth, addMonths, addWeeks, startOfWeek, endOfWeek };
