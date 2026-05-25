import { Camera, CheckCircle2, Flame, Medal } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, StatCard } from "../components/ui";
import { useAuth } from "../modules/auth/AuthProvider";
import { getDailyPlansForChild } from "../modules/plans/planApi";
import { getTasksForChild, submitTask, uploadTaskReportPhoto } from "../modules/tasks/taskApi";
import { DailyPlan, dayBlocks, Task } from "../types/domain";

export function ChildDashboard() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, File | null>>({});

  const reload = async () => {
    if (!user) return;
    const [childTasks, childPlans] = await Promise.all([
      getTasksForChild(user.id),
      getDailyPlansForChild(user.id)
    ]);
    setTasks(childTasks);
    setPlans(childPlans);
  };

  useEffect(() => {
    void reload();
  }, [user]);

  const done = tasks.filter((task) => task.status === "approved").length;

  const onDone = async (event: FormEvent, task: Task) => {
    event.preventDefault();
    if (!user) return;
    const photo = photos[task.id];
    const photoUrl = photo ? await uploadTaskReportPhoto(task.id, user.id, photo) : undefined;
    await submitTask(task, user.id, comments[task.id] ?? "", photoUrl);
    setComments((prev) => ({ ...prev, [task.id]: "" }));
    setPhotos((prev) => ({ ...prev, [task.id]: null }));
    await reload();
  };

  return (
    <div className="page space-y-6">
      <section>
        <h2 className="text-3xl font-semibold">Мой день</h2>
        <p className="mt-2 text-slate-400">План, задачи, баллы и награды.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Мои баллы" value={profile?.points ?? 0} />
        <StatCard label="Уровень" value={profile?.level ?? 1} tone="sky" />
        <StatCard label="Streak" value={`${profile?.streak ?? 0} дней`} tone="peach" />
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-semibold">План дня</h3>
        <div className="grid gap-2 md:grid-cols-4">
          {dayBlocks.map((block) => (
            <div key={block.value} className="rounded-2xl bg-white/5 p-3">
              <p className="text-sm font-semibold">{block.label}</p>
              <p className="mt-1 text-xs text-slate-400">
                {plans.find((plan) => plan.block === block.value)?.title ?? tasks.find((task) => task.plan_block === block.value)?.title ?? "Свободно"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Мои задачи</h3>
          <span className="text-sm text-slate-400">{done}/{tasks.length} выполнено</span>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <form key={task.id} className="rounded-2xl bg-white/5 p-4" onSubmit={(event) => onDone(event, task)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{task.description || "Без описания"}</p>
                  <p className="mt-2 text-xs text-mint">{task.points} баллов · {task.priority}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{task.status}</span>
              </div>
              {task.status !== "approved" && task.status !== "submitted" && (
                <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                  <Input placeholder="Комментарий к выполнению" value={comments[task.id] ?? ""} onChange={(e) => setComments((prev) => ({ ...prev, [task.id]: e.target.value }))} />
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/20">
                    <Camera size={17} />
                    {photos[task.id] ? "Фото выбрано" : "Фото"}
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotos((prev) => ({ ...prev, [task.id]: e.target.files?.[0] ?? null }))}
                    />
                  </label>
                  <Button className="inline-flex items-center justify-center gap-2"><CheckCircle2 size={17} /> Выполнено</Button>
                </div>
              )}
            </form>
          ))}
          {!tasks.length && <p className="text-sm text-slate-400">Пока нет назначенных задач.</p>}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Medal className="text-peach" /> Награды</h3>
          <p className="mt-3 text-sm text-slate-400">Награды появятся после настройки семьей.</p>
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Flame className="text-berry" /> Достижения</h3>
          <p className="mt-3 text-sm text-slate-400">Streak растет, когда задачи закрываются каждый день.</p>
        </Card>
      </div>
    </div>
  );
}
