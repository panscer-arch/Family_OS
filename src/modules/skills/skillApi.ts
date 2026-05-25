import { supabase } from "../../lib/supabase";
import type { Skill, SkillStep, SkillStatus } from "../../types/domain";

export async function getSkills(familyId: string) {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Skill[];
}

export async function addSkill(input: {
  familyId: string;
  childId?: string;
  title: string;
  category: string;
  childLabel: string;
  points?: number;
}) {
  const { data, error } = await supabase
    .from("skills")
    .insert({
      family_id: input.familyId,
      child_id: input.childId || null,
      title: input.title,
      category: input.category,
      child_label: input.childLabel,
      points: input.points ?? 0
    })
    .select()
    .single();
  if (error) throw error;
  return data as Skill;
}

export async function updateSkillStatus(id: string, status: SkillStatus, progress: number) {
  const { error } = await supabase.from("skills").update({ status, progress }).eq("id", id);
  if (error) throw error;
}

export async function addSkillStep(skillId: string, title: string) {
  const { data, error } = await supabase.from("skill_steps").insert({ skill_id: skillId, title }).select().single();
  if (error) throw error;
  return data as SkillStep;
}
