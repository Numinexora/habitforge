import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, habitsQuery } from "@/lib/queries";
import { NbButton, NbCard, NbInput, NB_TONES, NB_HEX, hexToTone, type NbTone } from "@/components/nb";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/categories")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQuery());
    context.queryClient.ensureQueryData(habitsQuery());
  },
  head: () => ({ meta: [{ title: "Categories — HabitForge" }] }),
  component: Categories,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm font-bold">Failed to load: {error.message}</div>
  ),
});

const schema = z.object({ name: z.string().trim().min(1).max(40) });

function Categories() {
  const ctx = Route.useRouteContext();
  const userId = ctx.user.id;
  const qc = useQueryClient();
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const { data: habits } = useSuspenseQuery(habitsQuery());

  const [name, setName] = useState("");
  const [tone, setTone] = useState<NbTone>("yellow");

  const create = useMutation({
    mutationFn: async () => {
      const parsed = schema.parse({ name });
      const { error } = await supabase
        .from("categories")
        .insert({ name: parsed.name, color: NB_HEX[tone], user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      toast.success("Category added");
    },
    onError: (e: unknown) => {
      toast.error(e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : "Failed");
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Category deleted");
    },
  });

  const habitCounts = new Map<string, number>();
  for (const h of habits) {
    if (h.category_id) habitCounts.set(h.category_id, (habitCounts.get(h.category_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl">Categories</h1>
        <p className="mt-1 text-sm font-medium text-foreground/70">
          Group your habits — fitness, learning, mindfulness... whatever you want.
        </p>
      </div>

      <NbCard tone="white" shadow="md" className="p-5">
        <h2 className="mb-3 text-lg">New category</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <NbInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fitness, Learning, ..."
            maxLength={40}
          />
          <div className="flex flex-wrap gap-1.5">
            {NB_TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={cn(
                  "h-9 w-9 nb-border rounded-md nb-shadow-sm",
                  `bg-nb-${t}`,
                  tone === t && "ring-4 ring-black ring-offset-2",
                )}
                aria-label={t}
              />
            ))}
          </div>
          <NbButton tone="ink" onClick={() => create.mutate()} disabled={create.isPending}>
            <Plus className="h-4 w-4" strokeWidth={3} /> Add
          </NbButton>
        </div>
      </NbCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 && (
          <p className="text-sm font-medium text-foreground/70">No categories yet.</p>
        )}
        {categories.map((c) => {
          const t = hexToTone(c.color);
          const count = habitCounts.get(c.id) ?? 0;
          return (
            <NbCard key={c.id} tone={t} shadow="md" className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-display text-xl font-bold">{c.name}</div>
                  <div className="mt-1 text-xs font-bold uppercase">
                    {count} habit{count === 1 ? "" : "s"}
                  </div>
                </div>
                <NbButton
                  tone="white"
                  size="iconSm"
                  onClick={() => {
                    if (confirm(`Delete "${c.name}"? Habits will be uncategorized.`))
                      remove.mutate(c.id);
                  }}
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </NbButton>
              </div>
            </NbCard>
          );
        })}
      </div>
    </div>
  );
}
