import { supabase } from "../../lib/supabase";
import type { DayBlock, Task, TaskComment, TaskPriority } from "../../types/domain";

export async function getTasksForFamily(familyId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("family_id", familyId)
    .order("deadline", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as Task[];
}

export async function getTasksForChild(childId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("child_id", childId)
    .order("deadline", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as Task[];
}

export async function createTask(input: {
  familyId: string;
  childId: string;
  createdBy: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: TaskPriority;
  points: number;
  planBlock?: DayBlock;
  repeatRule?: string;
  requiresApproval: boolean;
}) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      family_id: input.familyId,
      child_id: input.childId,
      created_by: input.createdBy,
      title: input.title,
      description: input.description ?? null,
      deadline: input.deadline || null,
      priority: input.priority,
      status: "todo",
      points: input.points,
      plan_block: input.planBlock ?? null,
      repeat_rule: input.repeatRule ?? null,
      requires_parent_approval: input.requiresApproval
    })
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

export async function submitTask(task: Task, childId: string, comment: string, photoUrl?: string) {
  const nextStatus = task.requires_parent_approval ? "submitted" : "approved";
  await supabase.from("task_submissions").insert({
    task_id: task.id,
    child_id: childId,
    comment: comment || null,
    photo_url: photoUrl || null,
    status: task.requires_parent_approval ? "pending" : "approved"
  });
  const { error } = await supabase.from("tasks").update({ status: nextStatus }).eq("id", task.id);
  if (error) throw error;
}

export async function uploadTaskReportPhoto(taskId: string, childId: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${childId}/${taskId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("task-reports").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw error;
  const { data } = supabase.storage.from("task-reports").getPublicUrl(path);
  return data.publicUrl;
}

export async function getCommentsForTasks(taskIds: string[]) {
  if (!taskIds.length) return {};
  const { data, error } = await supabase
    .from("task_comments")
    .select("*")
    .in("task_id", taskIds)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as TaskComment[]).reduce<Record<string, TaskComment[]>>((acc, comment) => {
    acc[comment.task_id] = [...(acc[comment.task_id] ?? []), comment];
    return acc;
  }, {});
}

export async function addTaskComment(taskId: string, authorId: string, body: string) {
  const { data, error } = await supabase
    .from("task_comments")
    .insert({ task_id: taskId, author_id: authorId, body })
    .select()
    .single();
  if (error) throw error;
  return data as TaskComment;
}

export async function reviewTask(taskId: string, status: "approved" | "rejected") {
  const { error } = await supabase.rpc("review_task", { target_task_id: taskId, next_status: status });
  if (error) throw error;
}
