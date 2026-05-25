import { CalendarClock, CheckCircle2, Clock, Plus, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Input, Select, StatCard } from "../components/ui";
import { useAuth } from "../modules/auth/AuthProvider";
import { createFamilyInvite, getFamilyChildren, getMyFamily } from "../modules/family/familyApi";
import { createDailyPlan, getDailyPlansForFamily } from "../modules/plans/planApi";
import { getTasksForFamily, reviewTask } from "../modules/tasks/taskApi";
import { dayBlocks, type DailyPlan, type DayBlock, type Family, type FamilyMember, type Profile, type Task } from "../types/domain";

export function ParentDashboard() {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Array<FamilyMember & { profile: Profile }>>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [parentInvite, setParentInvite] = useState("");
  const [childInvite, setChildInvite] = useState("");
  const [planChildId, setPlanChildId] = useState("");
  const [planBlock, setPlanBlock] = useState<DayBlock>("morning");
  const [planTitle, setPlanTitle] = useState("");
  const [planTime, setPlanTime] = useState("");

  const reload = async () => {
    if (!user) return;
    const membership = await getMyFamily(user.id);
    if (!membership) return;
    setFamily(membership.families);
    setChildInvite(membership.families.invite_code);
    const [kids, familyTasks, familyPlans] = await Promise.all([
      getFamilyChildren(membership.family_id),
      getTasksForFamily(membership.family_id),
      getDailyPlansForFamily(membership.family_id)
    ]);
    setChildren(kids);
    setPlanChildId((current) => current || kids[0]?.user_id || "");
    setTasks(familyTasks);
    setPlans(familyPlans);
  };

  useEffect(() => {
    void reload();
  }, [user]);

  const stats = useMemo(() => {
    const done = tasks.filter((task) => task.status === "approved").length;
    const overdue = tasks.filter((task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== "approved").length;
    const submitted = tasks.filter((task) => task.status === "submitted").length;
    return { done, overdue, submitted, percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
  }, [tasks]);

  const onCreatePlan = async (event: FormEvent) => {
    event.preventDefault();
    if (!family || !planChildId || !planTitle.trim()) return;
    const plan = await createDailyPlan({
      familyId: family.id,
      childId: planChildId,
      block: planBlock,
      title: planTitle.trim(),
      startsAt: planTime
    });
    setPlans((prev) => [...prev, plan]);
    setPlanTitle("");
    setPlanTime("");
  };

  return (
    <div className="page space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Dashboard семьи</h2>
          <p className="mt-2 text-slate-400">Дети, задачи на сегодня, просрочки и вечерняя сводка.</p>
        </div>
        <Link to="/tasks">
          <Button className="inline-flex items-center gap-2"><Plus size={18} /> Новая задача</Button>
        </Link>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Выполнено" value={`${stats.percent}%`} />
        <StatCard label="На проверке" value={stats.submitted} tone="sky" />
        <StatCard label="Просрочено" value={stats.overdue} tone="berry" />
        <StatCard label="Invite code" value={childInvite || family?.invite_code || "..."} tone="peach" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Дети</h3>
            <span className="text-sm text-slate-400">{children.length} профиля</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {children.map((child) => {
              const childTasks = tasks.filter((task) => task.child_id === child.user_id);
              const approved = childTasks.filter((task) => task.status === "approved").length;
              return (
                <div key={child.id} className="rounded-2xl bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{child.profile.full_name}</p>
                      <p className="text-sm text-slate-400">Уровень {child.profile.level} · {child.profile.points} баллов</p>
                    </div>
                    <div className="grid size-11 place-items-center rounded-xl bg-mint/20 text-mint">{approved}/{childTasks.length}</div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-mint" style={{ width: `${childTasks.length ? (approved / childTasks.length) * 100 : 0}%` }} />
                  </div>
                </div>
              );
            })}
            {!children.length && <p className="text-sm text-slate-400">Пригласите ребенка по invite code.</p>}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Приглашения</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Код ребенка</p>
              <p className="mt-1 text-2xl font-semibold text-peach">{childInvite || "..."}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Код для родителя</p>
              <p className="mt-1 text-2xl font-semibold text-skysoft">{parentInvite || "Не создан"}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="ghost"
                onClick={() => family && createFamilyInvite(family.id, "child").then((invite) => setChildInvite(invite.code))}
              >
                Новый код ребенка
              </Button>
              <Button
                onClick={() => family && createFamilyInvite(family.id, "parent").then((invite) => setParentInvite(invite.code))}
              >
                Код для родителя
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h3 className="text-lg font-semibold">Быстрый отчет</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p className="flex items-center gap-2"><CheckCircle2 className="text-mint" size={18} /> Выполнено задач: {stats.done}</p>
            <p className="flex items-center gap-2"><Clock className="text-skysoft" size={18} /> Ждут подтверждения: {stats.submitted}</p>
            <p className="flex items-center gap-2"><XCircle className="text-berry" size={18} /> Просрочено: {stats.overdue}</p>
            <p className="flex items-center gap-2"><CalendarClock className="text-peach" size={18} /> Вечерняя сводка готовится из статусов задач.</p>
          </div>
        </Card>

        <Card>
        <h3 className="mb-4 text-lg font-semibold">Задачи на проверке</h3>
        <div className="space-y-3">
          {tasks.filter((task) => task.status === "submitted").map((task) => (
            <div key={task.id} className="flex flex-col gap-3 rounded-2xl bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-slate-400">{task.description || "Без описания"} · {task.points} баллов</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => reviewTask(task.id, "rejected").then(reload)}>Отклонить</Button>
                <Button onClick={() => reviewTask(task.id, "approved").then(reload)}>Принять</Button>
              </div>
            </div>
          ))}
          {!tasks.some((task) => task.status === "submitted") && <p className="text-sm text-slate-400">Пока нет задач на подтверждение.</p>}
        </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h3 className="text-lg font-semibold">Добавить пункт плана</h3>
          <form className="mt-4 space-y-3" onSubmit={onCreatePlan}>
            <Select value={planChildId} onChange={(e) => setPlanChildId(e.target.value)} required>
              <option value="">Выберите ребенка</option>
              {children.map((child) => <option key={child.user_id} value={child.user_id}>{child.profile.full_name}</option>)}
            </Select>
            <div className="grid gap-3 md:grid-cols-2">
              <Select value={planBlock} onChange={(e) => setPlanBlock(e.target.value as DayBlock)}>
                {dayBlocks.map((block) => <option key={block.value} value={block.value}>{block.label}</option>)}
              </Select>
              <Input type="time" value={planTime} onChange={(e) => setPlanTime(e.target.value)} />
            </div>
            <Input required placeholder="Например: собрать рюкзак" value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} />
            <Button className="w-full">Добавить в план</Button>
          </form>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">План дня семьи</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {plans.map((plan) => {
              const child = children.find((item) => item.user_id === plan.child_id);
              const block = dayBlocks.find((item) => item.value === plan.block);
              return (
                <div key={plan.id} className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">{child?.profile.full_name ?? "Ребенок"} · {block?.label}</p>
                  <p className="mt-1 font-semibold">{plan.starts_at ? `${plan.starts_at.slice(0, 5)} · ` : ""}{plan.title}</p>
                </div>
              );
            })}
            {!plans.length && <p className="text-sm text-slate-400">План дня пока пуст.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
