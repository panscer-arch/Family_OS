import type { DailyTaskStatus, DayBlock, LibraryStatus, Role, SkillStatus, TaskPriority, TaskStatus } from "./domain";

type Row<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
};

export type Database = {
  public: {
    Tables: {
      profiles: Row<{
        id: string;
        full_name: string;
        role: Role;
        avatar_url: string | null;
        points: number;
        level: number;
        streak: number;
        created_at: string;
      }>;
      families: Row<{
        id: string;
        name: string;
        invite_code: string;
        created_by: string;
        created_at: string;
      }>;
      family_members: Row<{
        id: string;
        family_id: string;
        user_id: string;
        role: Role;
        created_at: string;
      }>;
      invitations: Row<{
        id: string;
        family_id: string;
        code: string;
        role: Role;
        expires_at: string | null;
        used_by: string | null;
        created_at: string;
      }>;
      tasks: Row<{
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
      }>;
      task_comments: Row<{
        id: string;
        task_id: string;
        author_id: string;
        body: string;
        created_at: string;
      }>;
      task_submissions: Row<{
        id: string;
        task_id: string;
        child_id: string;
        comment: string | null;
        photo_url: string | null;
        status: "pending" | "approved" | "rejected";
        created_at: string;
      }>;
      rewards: Row<{
        id: string;
        family_id: string;
        title: string;
        description: string | null;
        points_cost: number;
        created_at: string;
      }>;
      achievements: Row<{
        id: string;
        family_id: string;
        child_id: string;
        title: string;
        description: string | null;
        earned_at: string;
      }>;
      daily_plans: Row<{
        id: string;
        family_id: string;
        child_id: string;
        block: DayBlock;
        title: string;
        starts_at: string | null;
        created_at: string;
      }>;
      weekly_plans: Row<{
        id: string;
        family_id: string;
        child_id: string;
        week_start: string;
        created_by: string;
        created_at: string;
      }>;
      weekly_plan_items: Row<{
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
      }>;
      daily_tasks: Row<{
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
      }>;
      child_statuses: Row<{
        id: string;
        family_id: string;
        child_id: string;
        status: string;
        note: string | null;
        until_at: string | null;
        created_at: string;
      }>;
      library_items: Row<{
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
      }>;
      skills: Row<{
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
      }>;
      skill_steps: Row<{
        id: string;
        skill_id: string;
        title: string;
        is_done: boolean;
        created_at: string;
      }>;
      reports: Row<{
        id: string;
        family_id: string;
        child_id: string | null;
        report_date: string;
        completion_rate: number;
        summary: string | null;
        created_at: string;
      }>;
      notifications: Row<{
        id: string;
        family_id: string;
        user_id: string;
        title: string;
        body: string;
        read_at: string | null;
        created_at: string;
      }>;
      shopping_list: Row<{
        id: string;
        family_id: string;
        title: string;
        is_done: boolean;
        created_by: string;
        created_at: string;
      }>;
      chores: Row<{
        id: string;
        family_id: string;
        assignee_id: string | null;
        title: string;
        due_at: string | null;
        is_done: boolean;
        created_at: string;
      }>;
    };
  };
};
