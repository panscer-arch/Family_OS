import { supabase } from "../../lib/supabase";
import type { ChildStatus } from "../../types/domain";

export async function setChildStatus(input: {
  familyId: string;
  childId: string;
  status: string;
  note?: string;
  untilAt?: string;
}) {
  const { data, error } = await supabase
    .from("child_statuses")
    .insert({
      family_id: input.familyId,
      child_id: input.childId,
      status: input.status,
      note: input.note || null,
      until_at: input.untilAt || null
    })
    .select()
    .single();
  if (error) throw error;
  return data as ChildStatus;
}

export async function getLatestChildStatuses(familyId: string) {
  const { data, error } = await supabase
    .from("child_statuses")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as ChildStatus[];
}
