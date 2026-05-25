import { supabase } from "../../lib/supabase";
import type { Reward } from "../../types/domain";

export async function getRewards(familyId: string) {
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("family_id", familyId)
    .order("points_cost", { ascending: true });
  if (error) throw error;
  return data as Reward[];
}

export async function createReward(input: {
  familyId: string;
  title: string;
  description?: string;
  pointsCost: number;
}) {
  const { data, error } = await supabase
    .from("rewards")
    .insert({
      family_id: input.familyId,
      title: input.title,
      description: input.description || null,
      points_cost: input.pointsCost
    })
    .select()
    .single();
  if (error) throw error;
  return data as Reward;
}
