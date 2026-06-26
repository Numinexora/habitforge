import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Habit = Tables<"habits">;
export type Category = Tables<"categories">;
export type Checkin = Tables<"checkins">;

export const habitsQuery = () =>
  queryOptions({
    queryKey: ["habits"],
    queryFn: async (): Promise<Habit[]> => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("archived", false)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

export const checkinsQuery = (sinceISO: string) =>
  queryOptions({
    queryKey: ["checkins", sinceISO],
    queryFn: async (): Promise<Checkin[]> => {
      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .gte("date", sinceISO)
        .order("date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
