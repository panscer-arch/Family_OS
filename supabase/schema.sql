create extension if not exists pgcrypto;

create type public.user_role as enum ('parent', 'child', 'admin');
create type public.task_priority as enum ('low', 'medium', 'high');
create type public.task_status as enum ('todo', 'in_progress', 'waiting_confirmation', 'done', 'returned', 'overdue');
create type public.day_block as enum ('morning', 'study', 'homework', 'sport', 'walk', 'chores', 'evening', 'sleep');
create type public.submission_status as enum ('pending', 'approved', 'rejected');
create type public.daily_task_status as enum ('todo', 'in_progress', 'waiting_confirmation', 'done', 'returned', 'missed');
create type public.library_status as enum ('planned', 'in_progress', 'learned');
create type public.skill_status as enum ('planned', 'learning', 'mastered');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null,
  age integer,
  avatar_url text,
  profile_color text,
  pin_hash text,
  points integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'child')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  code text not null unique,
  role public.user_role not null default 'child',
  pin_hash text,
  expires_at timestamptz,
  used_by uuid references public.profiles(id),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'plan',
  deadline timestamptz,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'todo',
  repeat_rule text,
  requires_parent_approval boolean not null default true,
  points integer not null default 10,
  child_comment text,
  report_url text,
  submitted_at timestamptz,
  approved_at timestamptz,
  updated_at timestamptz not null default now(),
  plan_block public.day_block,
  created_at timestamptz not null default now()
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  comment text,
  photo_url text,
  status public.submission_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text,
  points_cost integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  earned_at timestamptz not null default now()
);

create table public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  block public.day_block not null,
  title text not null,
  starts_at time,
  created_at timestamptz not null default now()
);

create table public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (family_id, child_id, week_start)
);

create table public.weekly_plan_items (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references public.weekly_plans(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  plan_date date not null,
  starts_at time,
  title text not null,
  area text not null default 'plan',
  tag text,
  points integer not null default 0,
  result_required boolean not null default false,
  template_key text,
  created_at timestamptz not null default now()
);

create table public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  weekly_plan_item_id uuid references public.weekly_plan_items(id) on delete set null,
  task_date date not null default current_date,
  starts_at time,
  title text not null,
  area text not null default 'plan',
  tag text,
  points integer not null default 0,
  status public.daily_task_status not null default 'todo',
  result_required boolean not null default false,
  result_url text,
  result_note text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.child_statuses (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid not null references public.profiles(id) on delete cascade,
  status text not null,
  note text,
  until_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.library_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  kind text not null default 'book',
  url text,
  status public.library_status not null default 'planned',
  report text,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  category text not null,
  child_label text not null,
  status public.skill_status not null default 'planned',
  progress integer not null default 0,
  points integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.skill_steps (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.profiles(id) on delete cascade,
  report_date date not null default current_date,
  completion_rate numeric not null default 0,
  summary text,
  created_at timestamptz not null default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  child_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.shopping_list (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.chores (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  assignee_id uuid references public.profiles(id) on delete set null,
  title text not null,
  due_at timestamptz,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_family_parent(target_family uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.family_members
    where family_id = target_family and user_id = auth.uid() and role in ('parent', 'admin')
  );
$$;

create or replace function public.is_family_member(target_family uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.family_members
    where family_id = target_family and user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.invitations enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_submissions enable row level security;
alter table public.rewards enable row level security;
alter table public.achievements enable row level security;
alter table public.daily_plans enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.weekly_plan_items enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.child_statuses enable row level security;
alter table public.library_items enable row level security;
alter table public.skills enable row level security;
alter table public.skill_steps enable row level security;
alter table public.reports enable row level security;
alter table public.activity_log enable row level security;
alter table public.notifications enable row level security;
alter table public.shopping_list enable row level security;
alter table public.chores enable row level security;

create policy "profiles self read" on public.profiles for select using (id = auth.uid());
create policy "profiles self insert" on public.profiles for insert with check (id = auth.uid());
create policy "profiles self update" on public.profiles for update using (id = auth.uid());
create policy "family members can read profiles" on public.profiles for select using (
  exists (
    select 1 from public.family_members me
    join public.family_members other on other.family_id = me.family_id
    where me.user_id = auth.uid() and other.user_id = profiles.id
  )
);

create policy "families member read" on public.families for select using (public.is_family_member(id) or created_by = auth.uid());
create policy "families parent create" on public.families for insert with check (created_by = auth.uid());
create policy "families parent update" on public.families for update using (public.is_family_parent(id));

create policy "family members read own family" on public.family_members for select using (public.is_family_member(family_id));
create policy "family members creator insert" on public.family_members for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.families f
    where f.id = family_members.family_id and f.created_by = auth.uid()
  )
);
create policy "family members parent manage" on public.family_members for update using (public.is_family_parent(family_id));

create policy "invitations read by code or parent" on public.invitations for select using (used_by is null or public.is_family_parent(family_id));
create policy "invitations parent insert" on public.invitations for insert with check (public.is_family_parent(family_id));
create policy "invitations joining user update" on public.invitations for update using (used_by is null) with check (used_by = auth.uid());

create policy "tasks parent read family child read own" on public.tasks for select using (
  public.is_family_parent(family_id) or child_id = auth.uid()
);
create policy "tasks parent create" on public.tasks for insert with check (public.is_family_parent(family_id));
create policy "tasks parent or child update" on public.tasks for update using (
  public.is_family_parent(family_id) or child_id = auth.uid()
);

create policy "task comments participants read" on public.task_comments for select using (
  exists (select 1 from public.tasks t where t.id = task_id and (public.is_family_parent(t.family_id) or t.child_id = auth.uid()))
);
create policy "task comments participants insert" on public.task_comments for insert with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.tasks t
    where t.id = task_id and (public.is_family_parent(t.family_id) or t.child_id = auth.uid())
  )
);

create policy "task submissions participants read" on public.task_submissions for select using (
  child_id = auth.uid() or exists (select 1 from public.tasks t where t.id = task_id and public.is_family_parent(t.family_id))
);
create policy "task submissions child insert" on public.task_submissions for insert with check (child_id = auth.uid());
create policy "task submissions parent update" on public.task_submissions for update using (
  exists (select 1 from public.tasks t where t.id = task_id and public.is_family_parent(t.family_id))
);

create policy "rewards family read" on public.rewards for select using (public.is_family_member(family_id));
create policy "rewards parent manage" on public.rewards for all using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));

create policy "achievements family read" on public.achievements for select using (public.is_family_member(family_id));
create policy "achievements parent manage" on public.achievements for all using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));

create policy "daily plans parent read child read own" on public.daily_plans for select using (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "daily plans parent manage" on public.daily_plans for all using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));

create policy "weekly plans parent read child read own" on public.weekly_plans for select using (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "weekly plans parent or child create" on public.weekly_plans for insert with check (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "weekly plans parent or child update" on public.weekly_plans for update using (public.is_family_parent(family_id) or child_id = auth.uid()) with check (public.is_family_parent(family_id) or child_id = auth.uid());

create policy "weekly items parent read child read own" on public.weekly_plan_items for select using (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "weekly items parent or child create" on public.weekly_plan_items for insert with check (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "weekly items parent or child update" on public.weekly_plan_items for update using (public.is_family_parent(family_id) or child_id = auth.uid()) with check (public.is_family_parent(family_id) or child_id = auth.uid());

create policy "daily tasks parent read child read own" on public.daily_tasks for select using (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "daily tasks parent or child create" on public.daily_tasks for insert with check (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "daily tasks parent or child update" on public.daily_tasks for update using (public.is_family_parent(family_id) or child_id = auth.uid()) with check (public.is_family_parent(family_id) or child_id = auth.uid());

create policy "child statuses parent read child read own" on public.child_statuses for select using (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "child statuses child create" on public.child_statuses for insert with check (child_id = auth.uid());

create policy "library parent read child read own" on public.library_items for select using (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "library parent create child report" on public.library_items for insert with check (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "library parent or child update" on public.library_items for update using (public.is_family_parent(family_id) or child_id = auth.uid()) with check (public.is_family_parent(family_id) or child_id = auth.uid());

create policy "skills parent read child read own" on public.skills for select using (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "skills parent create child own" on public.skills for insert with check (public.is_family_parent(family_id) or child_id = auth.uid());
create policy "skills parent or child update" on public.skills for update using (public.is_family_parent(family_id) or child_id = auth.uid()) with check (public.is_family_parent(family_id) or child_id = auth.uid());

create policy "skill steps participants read" on public.skill_steps for select using (
  exists (select 1 from public.skills s where s.id = skill_id and (public.is_family_parent(s.family_id) or s.child_id = auth.uid()))
);
create policy "skill steps participants write" on public.skill_steps for all using (
  exists (select 1 from public.skills s where s.id = skill_id and (public.is_family_parent(s.family_id) or s.child_id = auth.uid()))
) with check (
  exists (select 1 from public.skills s where s.id = skill_id and (public.is_family_parent(s.family_id) or s.child_id = auth.uid()))
);

create policy "reports parent read" on public.reports for select using (public.is_family_parent(family_id));
create policy "reports parent manage" on public.reports for all using (public.is_family_parent(family_id)) with check (public.is_family_parent(family_id));

create policy "activity log family read" on public.activity_log for select using (public.is_family_member(family_id));
create policy "activity log family insert" on public.activity_log for insert with check (public.is_family_member(family_id));

create policy "notifications own read" on public.notifications for select using (user_id = auth.uid());
create policy "notifications own update" on public.notifications for update using (user_id = auth.uid());
create policy "notifications family create" on public.notifications for insert with check (
  public.is_family_member(family_id)
  and exists (
    select 1 from public.family_members fm
    where fm.family_id = notifications.family_id and fm.user_id = notifications.user_id
  )
);

create policy "shopping family read" on public.shopping_list for select using (public.is_family_member(family_id));
create policy "shopping family write" on public.shopping_list for all using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));

create policy "chores parent read child assigned read" on public.chores for select using (public.is_family_parent(family_id) or assignee_id = auth.uid());
create policy "chores parent insert" on public.chores for insert with check (public.is_family_parent(family_id));
create policy "chores parent update child assigned update" on public.chores for update using (public.is_family_parent(family_id) or assignee_id = auth.uid()) with check (public.is_family_member(family_id));

create or replace function public.join_family_by_code(invite_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  target_invite public.invitations%rowtype;
begin
  select * into target_invite
  from public.invitations
  where code = upper(invite_code)
    and used_by is null
    and (expires_at is null or expires_at > now())
  limit 1;

  if not found then
    raise exception 'Invite code not found or already used';
  end if;

  insert into public.family_members (family_id, user_id, role)
  values (target_invite.family_id, auth.uid(), target_invite.role)
  on conflict (family_id, user_id) do nothing;

  update public.profiles
  set role = target_invite.role
  where id = auth.uid();

  update public.invitations
  set used_by = auth.uid()
  where id = target_invite.id;

  return target_invite.family_id;
end;
$$;

create or replace function public.generate_daily_tasks_from_plan(target_child_id uuid, target_date date)
returns integer language plpgsql security definer set search_path = public as $$
declare
  inserted_count integer;
  target_family uuid;
begin
  select family_id into target_family
  from public.family_members
  where user_id = target_child_id
  limit 1;

  if target_family is null then
    raise exception 'Child is not attached to a family';
  end if;

  if not (public.is_family_parent(target_family) or target_child_id = auth.uid()) then
    raise exception 'Not allowed to generate tasks for this child';
  end if;

  insert into public.daily_tasks (
    family_id,
    child_id,
    weekly_plan_item_id,
    task_date,
    starts_at,
    title,
    area,
    tag,
    points,
    result_required
  )
  select
    item.family_id,
    item.child_id,
    item.id,
    item.plan_date,
    item.starts_at,
    item.title,
    item.area,
    item.tag,
    item.points,
    item.result_required
  from public.weekly_plan_items item
  where item.child_id = target_child_id
    and item.plan_date = target_date
    and not exists (
      select 1 from public.daily_tasks task
      where task.weekly_plan_item_id = item.id
    );

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

insert into storage.buckets (id, name, public)
values ('task-reports', 'task-reports', true)
on conflict (id) do nothing;

create policy "task reports public read"
on storage.objects for select
using (bucket_id = 'task-reports');

create policy "task reports child upload own folder"
on storage.objects for insert
with check (
  bucket_id = 'task-reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.review_task(target_task_id uuid, next_status public.task_status)
returns void language plpgsql security definer set search_path = public as $$
declare
  target_task public.tasks%rowtype;
begin
  select * into target_task from public.tasks where id = target_task_id;
  if not found then
    raise exception 'Task not found';
  end if;

  if next_status not in ('done', 'returned') then
    raise exception 'Unsupported review status';
  end if;

  if not public.is_family_parent(target_task.family_id) then
    raise exception 'Only parent can review this task';
  end if;

  update public.tasks
  set status = next_status
  where id = target_task_id;

  update public.task_submissions
  set status = case when next_status = 'done' then 'approved'::public.submission_status else 'rejected'::public.submission_status end
  where task_id = target_task_id and status = 'pending';

  if next_status = 'done' and target_task.status <> 'done' then
    update public.profiles
    set
      points = points + target_task.points,
      level = greatest(1, floor(((points + target_task.points)::numeric) / 100)::integer + 1)
    where id = target_task.child_id;
  end if;
end;
$$;
