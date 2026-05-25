import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, Select, Textarea } from "../components/ui";
import { useAuth } from "../modules/auth/AuthProvider";
import { getFamilyChildren, getMyFamily } from "../modules/family/familyApi";
import { addTaskComment, createTask, getCommentsForTasks, getTasksForChild, getTasksForFamily } from "../modules/tasks/taskApi";
import { dayBlocks, DayBlock, Family, FamilyMember, Profile, Task, TaskComment, TaskPriority } from "../types/domain";

export function TasksPage() {
  const { user, profile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Array<FamilyMember & { profile: Profile }>>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Record<string, TaskComment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [childId, setChildId] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [points, setPoints] = useState(10);
  const [planBlock, setPlanBlock] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(true);

  const reload = async () => {
    if (!user) return;
    const membership = await getMyFamily(user.id);
    setFamily(membership?.families ?? null);
    if (profile?.role === "parent" && membership) {
      const kids = await getFamilyChildren(membership.family_id);
      const familyTasks = await getTasksForFamily(membership.family_id);
      setChildren(kids);
      setChildId((current) => current || kids[0]?.user_id || "");
      setTasks(familyTasks);
      setComments(await getCommentsForTasks(familyTasks.map((task) => task.id)));
    } else {
      const childTasks = await getTasksForChild(user.id);
      setTasks(childTasks);
      setComments(await getCommentsForTasks(childTasks.map((task) => task.id)));
    }
  };

  useEffect(() => {
    void reload();
  }, [user, profile?.role]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !family || !childId) return;
    await createTask({
      familyId: family.id,
      childId,
      createdBy: user.id,
      title,
      description,
      deadline,
      priority,
      points,
      planBlock: (planBlock || undefined) as DayBlock | undefined,
      requiresApproval
    });
    setTitle("");
    setDescription("");
    setDeadline("");
    await reload();
  };

  const onAddComment = async (taskId: string) => {
    if (!user || !commentDrafts[taskId]?.trim()) return;
    const comment = await addTaskComment(taskId, user.id, commentDrafts[taskId].trim());
    setComments((prev) => ({ ...prev, [taskId]: [...(prev[taskId] ?? []), comment] }));
    setCommentDrafts((prev) => ({ ...prev, [taskId]: "" }));
  };

  return (
    <div className="page grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      {profile?.role === "parent" && (
        <Card>
          <h2 className="text-2xl font-semibold">Новая задача</h2>
          <form className="mt-5 space-y-4" onSubmit={onCreate}>
            <Input required placeholder="Название задачи" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Select value={childId} onChange={(e) => setChildId(e.target.value)} required>
              <option value="">Выберите ребенка</option>
              {children.map((child) => <option key={child.user_id} value={child.user_id}>{child.profile.full_name}</option>)}
            </Select>
            <Textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </Select>
              <Input type="number" min={0} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
              <Select value={planBlock} onChange={(e) => setPlanBlock(e.target.value)}>
                <option value="">Без блока</option>
                {dayBlocks.map((block) => <option key={block.value} value={block.value}>{block.label}</option>)}
              </Select>
            </div>
            <label className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-sm text-slate-300">
              <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} />
              Требует семейного подтверждения
            </label>
            <Button className="w-full">Создать задачу</Button>
          </form>
        </Card>
      )}

      <Card className={profile?.role === "parent" ? "" : "xl:col-span-2"}>
        <h2 className="text-2xl font-semibold">Задачи</h2>
        <div className="mt-5 space-y-3">
          {tasks.map((task) => (
            <article key={task.id} className="rounded-2xl bg-white/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{task.description || "Без описания"}</p>
                  <p className="mt-2 text-xs text-slate-500">{task.deadline ? new Date(task.deadline).toLocaleString("ru-RU") : "Без дедлайна"}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-mint/20 px-3 py-1 text-mint">{task.status}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-slate-300">{task.priority}</span>
                  <span className="rounded-full bg-peach/20 px-3 py-1 text-peach">{task.points} баллов</span>
                </div>
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Комментарии</p>
                <div className="mt-3 space-y-2">
                  {(comments[task.id] ?? []).map((comment) => (
                    <p key={comment.id} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300">{comment.body}</p>
                  ))}
                  {!comments[task.id]?.length && <p className="text-sm text-slate-500">Пока нет комментариев.</p>}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                  <Input
                    placeholder="Добавить комментарий"
                    value={commentDrafts[task.id] ?? ""}
                    onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [task.id]: e.target.value }))}
                  />
                  <Button type="button" variant="ghost" onClick={() => onAddComment(task.id)}>Отправить</Button>
                </div>
              </div>
            </article>
          ))}
          {!tasks.length && <p className="text-sm text-slate-400">Список задач пуст.</p>}
        </div>
      </Card>
    </div>
  );
}
