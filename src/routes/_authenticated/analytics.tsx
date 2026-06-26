import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { Flame, TrendingUp, CheckCircle2, Target } from "lucide-react";
import { habitsQuery, categoriesQuery, checkinsQuery } from "@/lib/queries";
import { lastNDays, computeStreaks, todayISO } from "@/lib/streak";
import { NbCard, NbBadge, hexToTone } from "@/components/design-system";
import { Heatmap } from "@/components/Heatmap";
import { cn } from "@/lib/utils";

const SINCE = lastNDays(365)[0];

export const Route = createFileRoute("/_authenticated/analytics")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(habitsQuery());
    context.queryClient.ensureQueryData(categoriesQuery());
    context.queryClient.ensureQueryData(checkinsQuery(SINCE));
  },
  head: () => ({ meta: [{ title: "Analytics — HabitForge" }] }),
  component: Analytics,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm font-bold">Failed to load: {error.message}</div>
  ),
});

function Analytics() {
  const { data: habits } = useSuspenseQuery(habitsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const { data: checkins } = useSuspenseQuery(checkinsQuery(SINCE));

  const last30 = lastNDays(30);
  const last30Set = new Set(last30);
  const checkins30 = checkins.filter((c) => last30Set.has(c.date));

  // overall stats
  const totalCheckins = checkins.length;
  const todaysCount = checkins.filter((c) => c.date === todayISO()).length;
  const allDates = checkins.map((c) => c.date);
  const { current: globalStreak, longest: globalLongest } = computeStreaks(allDates);

  // 30-day completion rate
  const possible = habits.length * 30;
  const rate = possible ? Math.round((checkins30.length / possible) * 100) : 0;

  // bar chart: per-day count last 30
  const chartData = useMemo(
    () =>
      last30.map((d) => ({
        date: format(parseISO(d), "MMM d"),
        count: checkins30.filter((c) => c.date === d).length,
      })),
    [last30, checkins30],
  );

  // per habit
  const perHabit = useMemo(
    () =>
      habits.map((h) => {
        const dates = checkins.filter((c) => c.habit_id === h.id).map((c) => c.date);
        const { current, longest } = computeStreaks(dates);
        const last30Done = dates.filter((d) => last30Set.has(d)).length;
        return { habit: h, current, longest, last30Done };
      }),
    [habits, checkins, last30Set],
  );

  // per category
  const perCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of checkins30) {
      const h = habits.find((x) => x.id === c.habit_id);
      const cat = h?.category_id ?? "uncat";
      m.set(cat, (m.get(cat) ?? 0) + 1);
    }
    return Array.from(m.entries()).map(([id, count]) => ({
      name: categories.find((c) => c.id === id)?.name ?? "Uncategorized",
      count,
    }));
  }, [checkins30, habits, categories]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl">Analytics</h1>
        <p className="mt-1 text-sm font-medium text-foreground/70">
          The last year of your habit journey.
        </p>
      </div>

      {/* stat row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard tone="yellow" icon={<Flame />} label="Current streak" value={globalStreak} suffix=" days" />
        <StatCard tone="pink" icon={<TrendingUp />} label="Longest streak" value={globalLongest} suffix=" days" />
        <StatCard tone="mint" icon={<CheckCircle2 />} label="Total check-ins" value={totalCheckins} />
        <StatCard tone="blue" icon={<Target />} label="30-day rate" value={rate} suffix="%" />
      </div>

      {/* heatmap */}
      <NbCard tone="white" shadow="lg" className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl">Activity heatmap</h2>
          <NbBadge tone="mint">{todaysCount} today</NbBadge>
        </div>
        <Heatmap dates={allDates} days={182} />
      </NbCard>

      {/* bar chart */}
      <NbCard tone="white" shadow="lg" className="p-6">
        <h2 className="mb-4 text-2xl">Last 30 days</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
              <XAxis dataKey="date" stroke="#000" fontSize={10} fontWeight={700} interval={3} />
              <YAxis stroke="#000" fontSize={10} fontWeight={700} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  border: "3px solid #000",
                  borderRadius: 8,
                  background: "#fff",
                  boxShadow: "4px 4px 0 #000",
                  fontWeight: 700,
                }}
              />
              <Bar dataKey="count" fill="#FFD93D" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </NbCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* per habit */}
        <NbCard tone="white" shadow="lg" className="p-6">
          <h2 className="mb-4 text-2xl">By habit</h2>
          <div className="space-y-3">
            {perHabit.length === 0 && (
              <p className="text-sm font-medium text-foreground/70">No habits yet.</p>
            )}
            {perHabit.map(({ habit, current, longest, last30Done }) => {
              const tone = hexToTone(habit.color);
              return (
                <div key={habit.id} className="nb-border rounded-md bg-white p-3 nb-shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("h-4 w-4 nb-border rounded-sm", `bg-nb-${tone}`)} />
                      <span className="truncate font-bold">{habit.name}</span>
                    </div>
                    <div className="flex shrink-0 gap-1.5 text-[10px] font-bold uppercase">
                      <span className="nb-border rounded-full bg-nb-yellow px-2 py-0.5">
                        🔥 {current}
                      </span>
                      <span className="nb-border rounded-full bg-white px-2 py-0.5">
                        best {longest}
                      </span>
                      <span className="nb-border rounded-full bg-white px-2 py-0.5">
                        {last30Done}/30
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </NbCard>

        {/* per category */}
        <NbCard tone="white" shadow="lg" className="p-6">
          <h2 className="mb-4 text-2xl">By category (30d)</h2>
          <div className="h-64">
            {perCategory.length === 0 ? (
              <p className="text-sm font-medium text-foreground/70">No check-ins yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
                  <XAxis type="number" stroke="#000" fontSize={10} fontWeight={700} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#000" fontSize={10} fontWeight={700} width={90} />
                  <Tooltip
                    contentStyle={{
                      border: "3px solid #000",
                      borderRadius: 8,
                      background: "#fff",
                      boxShadow: "4px 4px 0 #000",
                      fontWeight: 700,
                    }}
                  />
                  <Bar dataKey="count" fill="#FF6B9D" stroke="#000" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </NbCard>
      </div>
    </div>
  );
}

function StatCard({
  tone,
  icon,
  label,
  value,
  suffix,
}: {
  tone: "yellow" | "pink" | "mint" | "blue";
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <NbCard tone={tone} shadow="md" className="p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase">
        <span className="grid h-6 w-6 place-items-center">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-display text-4xl font-bold">
        {value}
        {suffix}
      </div>
    </NbCard>
  );
}
