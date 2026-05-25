import { supabase } from "../../lib/supabase";
import type { Family, FamilyMember, Profile, Role } from "../../types/domain";

const makeInviteCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export async function createProfile(userId: string, fullName: string, role: Role) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, full_name: fullName, role, points: 0, level: 1, streak: 0 })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function createFamily(userId: string, name: string) {
  const inviteCode = makeInviteCode();
  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({ name, invite_code: inviteCode, created_by: userId })
    .select()
    .single();
  if (familyError) throw familyError;

  await supabase.from("family_members").insert({ family_id: family.id, user_id: userId, role: "parent" });
  await supabase.from("invitations").insert({ family_id: family.id, code: inviteCode, role: "child" });
  await supabase.from("rewards").insert([
    { family_id: family.id, title: "Кино вечером", description: "Выбор семейного фильма", points_cost: 80 },
    { family_id: family.id, title: "Выбор ужина", description: "Ребенок выбирает домашний ужин", points_cost: 50 },
    { family_id: family.id, title: "Бонусная прогулка", description: "Дополнительное время на прогулке", points_cost: 40 }
  ]);
  return family as Family;
}

export async function createFamilyInvite(familyId: string, role: Role) {
  const code = makeInviteCode();
  const { data, error } = await supabase
    .from("invitations")
    .insert({ family_id: familyId, code, role })
    .select()
    .single();
  if (error) throw error;
  return data as { code: string; role: Role };
}

export async function joinFamilyByInvite(userId: string, code: string) {
  const normalized = code.trim().toUpperCase();
  const { data, error } = await supabase.rpc("join_family_by_code", { invite_code: normalized });
  if (error) throw error;
  if (!data) throw new Error("Код приглашения не найден или уже использован.");
  await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  return data as string;
}

export async function getMyFamily(userId: string) {
  const { data: member } = await supabase
    .from("family_members")
    .select("*, families(*)")
    .eq("user_id", userId)
    .maybeSingle();
  return member as (FamilyMember & { families: Family }) | null;
}

export async function getFamilyChildren(familyId: string) {
  const { data, error } = await supabase
    .from("family_members")
    .select("*, profile:profiles(*)")
    .eq("family_id", familyId)
    .eq("role", "child");
  if (error) throw error;
  return data as Array<FamilyMember & { profile: Profile }>;
}

export async function getFamilyMembers(familyId: string) {
  const { data, error } = await supabase
    .from("family_members")
    .select("*, profile:profiles(*)")
    .eq("family_id", familyId);
  if (error) throw error;
  return data as Array<FamilyMember & { profile: Profile }>;
}
