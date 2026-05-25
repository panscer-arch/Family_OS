import { supabase } from "../../lib/supabase";
import type { FamilyNotification } from "../../types/domain";

export async function getMyNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) throw error;
  return data as FamilyNotification[];
}

export async function sendFamilyMessage(input: {
  familyId: string;
  senderName: string;
  recipientIds: string[];
  body: string;
}) {
  if (!input.recipientIds.length) return [];
  const rows = input.recipientIds.map((userId) => ({
    family_id: input.familyId,
    user_id: userId,
    title: `Сообщение от ${input.senderName}`,
    body: input.body
  }));
  const { data, error } = await supabase.from("notifications").insert(rows).select();
  if (error) throw error;
  return data as FamilyNotification[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
