import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NbButton, NbInput, NbTextarea, NB_TONES, NB_HEX, hexToTone, type NbTone } from "@/components/nb";
import type { Habit, Category } from "@/lib/queries";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(60),
  description: z.string().trim().max(280).optional(),
  category_id: z.string().uuid().nullable(),
  color: z.string(),
  target_per_week: z.number().int().min(1).max(7),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  habit?: Habit | null;
  categories: Category[];
  userId: string;
}

export function HabitForm({ open, onOpenChange, habit, categories, userId }: Props) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tone, setTone] = useState<NbTone>("yellow");
  const [target, setTarget] = useState(7);

  useEffect(() => {
    if (open) {
      setName(habit?.name ?? "");
      setDescription(habit?.description ?? "");
      setCategoryId(habit?.category_id ?? null);
      setTone(hexToTone(habit?.color ?? "#FFD93D"));
      setTarget(habit?.target_per_week ?? 7);
    }
  }, [open, habit]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.parse({
        name,
        description: description || undefined,
        category_id: categoryId,
        color: NB_HEX[tone],
        target_per_week: target,
      });
      const payload = {
        name: parsed.name,
        description: parsed.description ?? null,
        category_id: parsed.category_id,
        color: parsed.color,
        target_per_week: parsed.target_per_week,
        user_id: userId,
      };
      if (habit) {
        const { error } = await supabase.from("habits").update(payload).eq("id", habit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("habits").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["habits"] });
      toast.success(habit ? "Habit updated" : "Habit created");
      onOpenChange(false);
    },
    onError: (e: unknown) => {
      const msg = e instanceof z.ZodError ? e.issues[0].message : e instanceof Error ? e.message : "Failed";
      toast.error(msg);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="nb-border nb-shadow-lg rounded-xl bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {habit ? "Edit habit" : "New habit"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Name</label>
            <NbInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Morning run" maxLength={60} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Description</label>
            <NbTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              maxLength={280}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Category</label>
            <select
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="h-11 w-full nb-border rounded-lg bg-white px-3 text-sm font-medium nb-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase">Color</label>
            <div className="flex flex-wrap gap-2">
              {NB_TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={cn(
                    "h-10 w-10 nb-border rounded-md nb-shadow-sm",
                    `bg-nb-${t}`,
                    tone === t && "ring-4 ring-black ring-offset-2",
                  )}
                  aria-label={t}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">
              Target: {target} {target === 1 ? "day" : "days"} / week
            </label>
            <input
              type="range"
              min={1}
              max={7}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full accent-black"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <NbButton tone="white" onClick={() => onOpenChange(false)}>
              Cancel
            </NbButton>
            <NbButton tone="ink" onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving..." : habit ? "Save" : "Create"}
            </NbButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
