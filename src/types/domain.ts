export type Role = "parent" | "child";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "submitted" | "approved" | "rejected" | "overdue";
export type DailyTaskStatus = "todo" | "in_progress" | "done" | "missed";
export type LibraryStatus = "planned" | "in_progress" | "learned";
export type SkillStatus = "planned" | "learning" | "mastered";
export type DayBlock = "morning" | "school" | "homework" | "sport" | "walk" | "chores" | "evening" | "sleep";

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  points: number;
  level: number;
  streak: number;
};

export type Family = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
};

export type FamilyMember = {
  id: string;
  family_id: string;
  user_id: string;
  role: Role;
  profile?: Profile;
};

export type Task = {
  id: string;
  family_id: string;
  child_id: string;
  created_by: string;
  title: string;
  description: string | null;
  deadline: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  repeat_rule: string | null;
  requires_parent_approval: boolean;
  points: number;
  plan_block: DayBlock | null;
  created_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type Reward = {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  points_cost: number;
};

export type ShoppingItem = {
  id: string;
  family_id: string;
  title: string;
  is_done: boolean;
  created_by: string;
  created_at: string;
};

export type Chore = {
  id: string;
  family_id: string;
  assignee_id: string | null;
  title: string;
  due_at: string | null;
  is_done: boolean;
  created_at: string;
};

export type DailyPlan = {
  id: string;
  family_id: string;
  child_id: string;
  block: DayBlock;
  title: string;
  starts_at: string | null;
  created_at: string;
};

export type WeeklyPlan = {
  id: string;
  family_id: string;
  child_id: string;
  week_start: string;
  created_by: string;
  created_at: string;
};

export type WeeklyPlanItem = {
  id: string;
  weekly_plan_id: string;
  family_id: string;
  child_id: string;
  plan_date: string;
  starts_at: string | null;
  title: string;
  area: string;
  tag: string | null;
  points: number;
  result_required: boolean;
  template_key: string | null;
  created_at: string;
};

export type DailyTask = {
  id: string;
  family_id: string;
  child_id: string;
  weekly_plan_item_id: string | null;
  task_date: string;
  starts_at: string | null;
  title: string;
  area: string;
  tag: string | null;
  points: number;
  status: DailyTaskStatus;
  result_required: boolean;
  result_url: string | null;
  result_note: string | null;
  completed_at: string | null;
  created_at: string;
};

export type ChildStatus = {
  id: string;
  family_id: string;
  child_id: string;
  status: string;
  note: string | null;
  until_at: string | null;
  created_at: string;
};

export type LibraryItem = {
  id: string;
  family_id: string;
  child_id: string | null;
  title: string;
  kind: string;
  url: string | null;
  status: LibraryStatus;
  report: string | null;
  assigned_by: string | null;
  created_at: string;
};

export type Skill = {
  id: string;
  family_id: string;
  child_id: string | null;
  title: string;
  category: string;
  child_label: string;
  status: SkillStatus;
  progress: number;
  points: number;
  created_at: string;
};

export type SkillStep = {
  id: string;
  skill_id: string;
  title: string;
  is_done: boolean;
  created_at: string;
};

export type FamilyNotification = {
  id: string;
  family_id: string;
  user_id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export const dayBlocks: Array<{ value: DayBlock; label: string }> = [
  { value: "morning", label: "Утро" },
  { value: "school", label: "Школа" },
  { value: "homework", label: "Уроки" },
  { value: "sport", label: "Спорт" },
  { value: "walk", label: "Прогулка" },
  { value: "chores", label: "Домашние дела" },
  { value: "evening", label: "Вечер" },
  { value: "sleep", label: "Сон" }
];
