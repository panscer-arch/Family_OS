import { supabase } from "../../lib/supabase";
import type { DailyPlan, DayBlock } from "../../types/domain";

export async function getDailyPlansForChild(childId: string) {
  const { data, error } = await supabase
    .from("daily_plans")
    .select("*")
    .eq("child_id", childId)
    .order("starts_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as DailyPlan[];
}

export async function getDailyPlansForFamily(familyId: string) {
  const { data, error } = await supabase
    .from("daily_plans")
    .select("*")
    .eq("family_id", familyId)
    .order("starts_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as DailyPlan[];
}

export async function createDailyPlan(input: {
  familyId: string;
  childId: string;
  block: DayBlock;
  title: string;
  startsAt?: string;
}) {
  const { data, error } = await supabase
    .from("daily_plans")
    .insert({
      family_id: input.familyId,
      child_id: input.childId,
      block: input.block,
      title: input.title,
      starts_at: input.startsAt || null
    })
    .select()
    .single();
  if (error) throw error;
  return data as DailyPlan;
}
