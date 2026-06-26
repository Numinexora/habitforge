import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Search, Sparkles } from "lucide-react";
import { habitsQuery, categoriesQuery, checkinsQuery, type Habit } from "@/lib/queries";
import { lastNDays } from "@/lib/streak";
import { NbButton, NbCard, NbInput, NbBadge } from "@/components/nb";
import { HabitCard } from "@/components/HabitCard";
import { HabitForm } from "@/components/HabitForm";
import { cn } from "@/lib/utils";

const SINCE = lastNDays(120)[0];

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(habitsQuery());
    context.queryClient.ensureQueryData(categoriesQuery());
    context.queryClient.ensureQueryData(checkinsQuery(SINCE));
  },
  head: () => ({ meta: [{ title: "Dashboard — HabitForge" }] }),
  component: Dashboard,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm font-bold">Failed to load: {error.message}</div>
  ),
});

function Dashboard() {
  const { data: habits } = useSuspenseQuery(habitsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const { data: checkins } = useSuspenseQuery(checkinsQuery(SINCE));
  const ctx = Route.useRouteContext();
  const userId = ctx.user.id;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return habits.filter((h) => {
      if (catFilter !== "all" && h.category_id !== catFilter) return false;
      if (q && !h.name.toLowerCase().includes(q) && !(h.description ?? "").toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [habits, search, catFilter]);

  const checkinsByHabit = useMemo(() => {
    const m = new Map<string, typeof checkins>();
    for (const c of checkins) {
      const arr = m.get(c.habit_id) ?? [];
      arr.push(c);
      m.set(c.habit_id, arr);
    }
    return m;
  }, [checkins]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">Your habits</h1>
          <p className="mt-1 text-sm font-medium text-foreground/70">
            {habits.length} active · keep the chain alive.
          </p>
        </div>
        <NbButton
          tone="ink"
          size="md"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" strokeWidth={3} /> New habit
        </NbButton>
      </div>

      {/* filters */}
      <NbCard tone="white" shadow="sm" className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <NbInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search habits..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={catFilter === "all"} onClick={() => setCatFilter("all")}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>
                {c.name}
              </FilterChip>
            ))}
          </div>
        </div>
      </NbCard>

      {/* habits grid */}
      {filtered.length === 0 ? (
        <NbCard tone="yellow" shadow="lg" className="grid place-items-center p-12 text-center">
          <Sparkles className="mb-3 h-10 w-10" strokeWidth={2.5} />
          <h2 className="text-2xl">
            {habits.length === 0 ? "Start your first habit" : "No habits match"}
          </h2>
          <p className="mt-2 max-w-sm text-sm font-medium">
            {habits.length === 0
              ? "Tiny daily wins compound into massive change. Pick one habit to start."
              : "Try a different search or category filter."}
          </p>
          {habits.length === 0 && (
            <NbButton
              tone="ink"
              className="mt-5"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> Create habit
            </NbButton>
          )}
        </NbCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              category={categories.find((c) => c.id === h.category_id)}
              checkins={checkinsByHabit.get(h.id) ?? []}
              onEdit={() => {
                setEditing(h);
                setOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <HabitForm
        open={open}
        onOpenChange={setOpen}
        habit={editing}
        categories={categories}
        userId={userId}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "nb-border rounded-full px-3 py-1.5 text-xs font-bold uppercase",
        active ? "bg-nb-ink text-white nb-shadow-sm" : "bg-white",
      )}
    >
      {children}
    </button>
  );
}

// re-export so dashboard route context type carries through (TanStack inference)
export {};
