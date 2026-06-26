import { format, subDays, eachDayOfInterval, startOfDay, parseISO, differenceInCalendarDays } from "date-fns";

export const todayISO = () => format(new Date(), "yyyy-MM-dd");

export function lastNDays(n: number): string[] {
  const end = startOfDay(new Date());
  const start = subDays(end, n - 1);
  return eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
}

/**
 * Compute current streak (consecutive days ending today or yesterday)
 * and longest streak from a sorted (asc) list of ISO date strings.
 */
export function computeStreaks(dates: string[]): { current: number; longest: number } {
  if (!dates.length) return { current: 0, longest: 0 };
  const set = new Set(dates);
  const sorted = [...set].sort();

  // longest
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
    if (diff === 1) run++;
    else run = 1;
    if (run > longest) longest = run;
  }

  // current: walk back from today
  let current = 0;
  let cursor = startOfDay(new Date());
  // if today not done but yesterday is, still count from yesterday
  if (!set.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = subDays(cursor, 1);
    if (!set.has(format(cursor, "yyyy-MM-dd"))) return { current: 0, longest };
  }
  while (set.has(format(cursor, "yyyy-MM-dd"))) {
    current++;
    cursor = subDays(cursor, 1);
  }
  return { current, longest };
}
