import { supabase } from "../../lib/supabase";
import type { DailyTask, DailyTaskStatus, WeeklyPlan, WeeklyPlanItem } from "../../types/domain";

export async function getOrCreateWeeklyPlan(input: {
  familyId: string;
  childId: string;
  weekStart: string;
  createdBy: string;
}) {
  const { data: existing, error: readError } = await supabase
    .from("weekly_plans")
    .select("*")
    .eq("family_id", input.familyId)
    .eq("child_id", input.childId)
    .eq("week_start", input.weekStart)
    .maybeSingle();
  if (readError) throw readError;
  if (existing) return existing as WeeklyPlan;

  const { data, error } = await supabase
    .from("weekly_plans")
    .insert({
      family_id: input.familyId,
      child_id: input.childId,
      week_start: input.weekStart,
      created_by: input.createdBy
    })
    .select()
    .single();
  if (error) throw error;
  return data as WeeklyPlan;
}

export async function getWeeklyPlanItems(weeklyPlanId: string) {
  const { data, error } = await supabase
    .from("weekly_plan_items")
    .select("*")
    .eq("weekly_plan_id", weeklyPlanId)
    .order("plan_date", { ascending: true })
    .order("starts_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as WeeklyPlanItem[];
}

export async function addWeeklyPlanItem(input: {
  weeklyPlanId: string;
  familyId: string;
  childId: string;
  planDate: string;
  startsAt?: string;
  title: string;
  area: string;
  tag?: string;
  points?: number;
  resultRequired?: boolean;
  templateKey?: string;
}) {
  const { data, error } = await supabase
    .from("weekly_plan_items")
    .insert({
      weekly_plan_id: input.weeklyPlanId,
      family_id: input.familyId,
      child_id: input.childId,
      plan_date: input.planDate,
      starts_at: input.startsAt || null,
      title: input.title,
      area: input.area,
      tag: input.tag || null,
      points: input.points ?? 0,
      result_required: input.resultRequired ?? false,
      template_key: input.templateKey || null
    })
    .select()
    .single();
  if (error) throw error;
  return data as WeeklyPlanItem;
}

export async function generateDailyTasksFromPlan(childId: string, date: string) {
  const { data, error } = await supabase.rpc("generate_daily_tasks_from_plan", {
    target_child_id: childId,
    target_date: date
  });
  if (error) throw error;
  return data as number;
}

export async function getDailyTasks(childId: string, date: string) {
  const { data, error } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("child_id", childId)
    .eq("task_date", date)
    .order("starts_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as DailyTask[];
}

export async function updateDailyTaskStatus(taskId: string, status: DailyTaskStatus) {
  const patch = status === "done" ? { status, completed_at: new Date().toISOString() } : { status };
  const { error } = await supabase.from("daily_tasks").update(patch).eq("id", taskId);
  if (error) throw error;
}

export async function attachDailyTaskResult(taskId: string, result: { url?: string; note?: string }) {
  const { error } = await supabase
    .from("daily_tasks")
    .update({ result_url: result.url || null, result_note: result.note || null })
    .eq("id", taskId);
  if (error) throw error;
}
