import { supabase } from "../../lib/supabase";
import type { Chore, ShoppingItem } from "../../types/domain";

export async function getShoppingList(familyId: string) {
  const { data, error } = await supabase
    .from("shopping_list")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ShoppingItem[];
}

export async function addShoppingItem(familyId: string, title: string, createdBy: string) {
  const { data, error } = await supabase
    .from("shopping_list")
    .insert({ family_id: familyId, title, created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data as ShoppingItem;
}

export async function toggleShoppingItem(id: string, isDone: boolean) {
  const { error } = await supabase.from("shopping_list").update({ is_done: isDone }).eq("id", id);
  if (error) throw error;
}

export async function getChores(familyId: string) {
  const { data, error } = await supabase
    .from("chores")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Chore[];
}

export async function addChore(familyId: string, title: string, assigneeId?: string) {
  const { data, error } = await supabase
    .from("chores")
    .insert({ family_id: familyId, title, assignee_id: assigneeId || null })
    .select()
    .single();
  if (error) throw error;
  return data as Chore;
}

export async function toggleChore(id: string, isDone: boolean) {
  const { error } = await supabase.from("chores").update({ is_done: isDone }).eq("id", id);
  if (error) throw error;
}
