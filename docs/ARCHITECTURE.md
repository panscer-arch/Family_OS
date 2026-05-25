# Family OS architecture

## Current state

Family OS currently has two tracks:

- `preview/index.html` - the active clickable product prototype used for fast UX decisions.
- `src/` - the React + TypeScript + Supabase application scaffold for the production version.

The preview is the source of the latest product decisions. When a feature is approved in the preview, move it into the React app.

## Product core

The main workflow is:

1. Weekly plan starts from the selected date.
2. A real family day template fills the plan.
3. Daily tasks are generated from the selected day.
4. Tasks marked `Яна` go to Yana's checklist.
5. Tasks marked `Ева` go to Eva's checklist.
6. Tasks marked `Семья` go to both children.
7. Reports stay empty until real tasks are completed.

## Family data

Use only these family members in examples:

- Яна, 8 years old.
- Ева, 12 years old.
- Мария, parent.
- Павел, parent.

Important: Yana and Eva are homeschooled. Do not add ordinary school examples like school diary, backpack, or going to school.

## Preview modules

The active preview includes:

- dashboard with honest zero/empty states;
- child statuses for Yana and Eva;
- weekly plan with real calendar behavior;
- generated daily checklists;
- tasks with empty kanban and manual task creation;
- rewards with concrete point costs and reward creation;
- library with materials/master classes and material creation;
- reports with zero states;
- home chores and family chat with message deletion.

## Data model direction

Supabase should eventually persist:

- profiles;
- families;
- family_members;
- weekly_plans;
- weekly_plan_items;
- daily_tasks;
- child_statuses;
- task_comments;
- task_submissions;
- rewards;
- library_items;
- skills;
- reports;
- notifications;
- chores.

See `supabase/schema.sql` for the current SQL draft.

