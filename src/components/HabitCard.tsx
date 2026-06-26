import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Flame, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NbCard, NbButton, NbBadge, hexToTone } from "@/components/design-system";
import type { Habit, Category, Checkin } from "@/lib/queries";
import { computeStreaks, todayISO, lastNDays } from "@/lib/streak";
import { cn } from "@/lib/utils";

interface Props {
  habit: Habit;
  category?: Category;
  checkins: Checkin[]; // already filtered to this habit
  onEdit: () => void;
}

export function HabitCard({ habit, category, checkins, onEdit }: Props) {
  const qc = useQueryClient();
  const tone = hexToTone(habit.color);
  const dates = checkins.map((c) => c.date).sort();
  const { current, longest } = computeStreaks(dates);
  const doneToday = dates.includes(todayISO());

  // last 7 days
  const week = lastNDays(7);
  const dateSet = new Set(dates);
  const weekDone = week.filter((d) => dateSet.has(d)).length;

  const toggle = useMutation({
    mutationFn: async () => {
      const today = todayISO();
      if (doneToday) {
        const { error } = await supabase
          .from("checkins")
          .delete()
          .eq("habit_id", habit.id)
          .eq("date", today);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("checkins")
          .insert({ habit_id: habit.id, user_id: habit.user_id, date: today });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checkins"] }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("habits").delete().eq("id", habit.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      qc.invalidateQueries({ queryKey: ["checkins"] });
      toast.success("Habit deleted");
    },
  });

  return (
    <NbCard tone="white" shadow="md" className="overflow-hidden">
      <div className={cn("h-2 w-full nb-border border-x-0 border-t-0", `bg-nb-${tone}`)} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-display text-lg font-bold">{habit.name}</h3>
              {category && (
                <NbBadge tone="white" className="shrink-0">
                  {category.name}
                </NbBadge>
              )}
            </div>
            {habit.description && (
              <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground/70">
                {habit.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <NbButton tone="white" size="iconSm" onClick={onEdit} aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </NbButton>
            <NbButton
              tone="white"
              size="iconSm"
              onClick={() => {
                if (confirm(`Delete "${habit.name}"?`)) remove.mutate();
              }}
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </NbButton>
          </div>
        </div>

        {/* stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Streak" value={current} icon={<Flame className="h-3.5 w-3.5" />} tone={tone} />
          <Stat label="Best" value={longest} />
          <Stat label="This week" value={`${weekDone}/${habit.target_per_week}`} />
        </div>

        {/* week dots */}
        <div className="mt-4 flex items-center justify-between gap-1">
          {week.map((d) => {
            const done = dateSet.has(d);
            const isToday = d === todayISO();
            return (
              <div
                key={d}
                className={cn(
                  "h-7 flex-1 nb-border rounded-md",
                  done ? `bg-nb-${tone}` : "bg-white",
                  isToday && "ring-2 ring-black ring-offset-1",
                )}
                title={d}
              />
            );
          })}
        </div>

        {/* CTA */}
        <NbButton
          tone={doneToday ? "mint" : tone}
          size="md"
          className="mt-4 w-full"
          onClick={() => toggle.mutate()}
          disabled={toggle.isPending}
        >
          <Check className="h-4 w-4" strokeWidth={3} />
          {doneToday ? "Done today — undo" : "Check in for today"}
        </NbButton>
      </div>
    </NbCard>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className={cn("nb-border rounded-md bg-white p-2 text-center nb-shadow-sm", tone && `bg-nb-${tone}/40`)}>
      <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="font-display text-xl font-bold">{value}</div>
    </div>
  );
}
