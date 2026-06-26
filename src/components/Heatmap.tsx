import { useMemo } from "react";
import { format, startOfWeek, addDays, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  dates: string[]; // ISO completion dates
  days?: number;
}

/** GitHub-style heatmap: shows last N days as a grid of weeks (Sun→Sat columns). */
export function Heatmap({ dates, days = 182 }: Props) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of dates) m.set(d, (m.get(d) ?? 0) + 1);
    return m;
  }, [dates]);

  const maxCount = Math.max(1, ...counts.values());

  const today = startOfDay(new Date());
  const start = startOfWeek(subDays(today, days - 1), { weekStartsOn: 0 });
  const all = eachDayOfInterval({ start, end: today });

  // group into weeks (columns)
  const weeks: Date[][] = [];
  for (let i = 0; i < all.length; i += 7) weeks.push(all.slice(i, i + 7));
  // ensure last week has 7 slots
  while (weeks[weeks.length - 1].length < 7) {
    weeks[weeks.length - 1].push(addDays(weeks[weeks.length - 1].at(-1)!, 1));
  }

  const intensity = (c: number) => {
    if (c === 0) return "bg-white";
    const r = c / maxCount;
    if (r > 0.75) return "bg-nb-mint";
    if (r > 0.5) return "bg-nb-mint/80";
    if (r > 0.25) return "bg-nb-mint/55";
    return "bg-nb-mint/30";
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((d) => {
              const iso = format(d, "yyyy-MM-dd");
              const c = counts.get(iso) ?? 0;
              const future = d > today;
              return (
                <div
                  key={iso}
                  title={`${iso} — ${c} check-in${c === 1 ? "" : "s"}`}
                  className={cn(
                    "h-3 w-3 rounded-[2px] border border-black/80",
                    future ? "bg-transparent border-transparent" : intensity(c),
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase">
        <span>Less</span>
        <div className="h-3 w-3 rounded-[2px] border border-black bg-white" />
        <div className="h-3 w-3 rounded-[2px] border border-black bg-nb-mint/30" />
        <div className="h-3 w-3 rounded-[2px] border border-black bg-nb-mint/55" />
        <div className="h-3 w-3 rounded-[2px] border border-black bg-nb-mint/80" />
        <div className="h-3 w-3 rounded-[2px] border border-black bg-nb-mint" />
        <span>More</span>
      </div>
    </div>
  );
}
