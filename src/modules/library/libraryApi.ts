import { supabase } from "../../lib/supabase";
import type { LibraryItem, LibraryStatus } from "../../types/domain";

export async function getLibraryItems(familyId: string) {
  const { data, error } = await supabase
    .from("library_items")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as LibraryItem[];
}

export async function addLibraryItem(input: {
  familyId: string;
  childId?: string;
  title: string;
  kind: string;
  url?: string;
  assignedBy?: string;
}) {
  const { data, error } = await supabase
    .from("library_items")
    .insert({
      family_id: input.familyId,
      child_id: input.childId || null,
      title: input.title,
      kind: input.kind,
      url: input.url || null,
      assigned_by: input.assignedBy || null
    })
    .select()
    .single();
  if (error) throw error;
  return data as LibraryItem;
}

export async function updateLibraryStatus(id: string, status: LibraryStatus, report?: string) {
  const { error } = await supabase.from("library_items").update({ status, report: report || null }).eq("id", id);
  if (error) throw error;
}
