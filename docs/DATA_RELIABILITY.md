# Family OS data reliability

This note maps the generic CRM reliability checklist to Family OS.

## Implemented in the current preview

- Browser autosave with `localStorage` for statuses, checklist tasks, weekly plans, task board cards, rewards, library items, skills, family chat, invite code, and activity history.
- Restore after page refresh for the same browser.
- Confirmation before deleting a family chat message.
- Unsaved draft warning when a modal form has typed text and the page is being closed or refreshed.
- Activity history in Reports: status changes, created tasks, new rewards, materials, skills, invite codes, plan actions, and chat actions.
- Reports now count real checklist state instead of fake numbers: completed tasks, total tasks, and activity count.
- Kanban/task board state is saved after drag and drop.

## Still needed for the full production app

- Move persistence from browser storage to Supabase tables so Мария, Павел, Яна, and Ева see the same data on different devices.
- Add Supabase row-level security for parent and child roles.
- Add server-side audit log for important changes.
- Add scheduled Supabase backups.
- Add real notification delivery instead of local UI notices.
- Add integration/error logs when external sources appear.

## Family OS priority

The most important data path is:

1. Weekly plan by date.
2. Daily checklist generated from the plan.
3. Child status.
4. Completed tasks and reports for parents.

This path should be tested first after every release.
