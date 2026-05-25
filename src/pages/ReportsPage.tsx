import { Activity, AlertTriangle, BarChart3, Moon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, StatCard } from "../components/ui";
import { useAuth } from "../modules/auth/AuthProvider";
import { getMyFamily } from "../modules/family/familyApi";
import { getTasksForFamily } from "../modules/tasks/taskApi";
import type { Task } from "../types/domain";

export function ReportsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;
    getMyFamily(user.id).then((membership) => {
      if (membership) getTasksForFamily(membership.family_id).then(setTasks);
    });
  }, [user]);

  const report = useMemo(() => {
    const approved = tasks.filter((task) => task.status === "approved").length;
    const overdue = tasks.filter((task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== "approved").length;
    return {
      completion: tasks.length ? Math.round((approved / tasks.length) * 100) : 0,
      approved,
      overdue,
      active: tasks.filter((task) => task.status === "todo" || task.status === "submitted").length
    };
  }, [tasks]);

  return (
    <div className="page space-y-6">
      <section>
        <h2 className="text-3xl font-semibold">Отчеты</h2>
        <p className="mt-2 text-slate-400">Дневная и недельная статистика, просрочки и активность детей.</p>
      </section>
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Сегодня выполнено" value={`${report.completion}%`} />
        <StatCard label="Активные" value={report.active} tone="sky" />
        <StatCard label="Просроченные" value={report.overdue} tone="berry" />
        <StatCard label="За неделю" value={tasks.length} tone="peach" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="flex items-center gap-2 text-lg font-semibold"><BarChart3 className="text-mint" /> Статистика недели</h3>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {[62, 70, 55, 88, 76, report.completion, 0].map((value, index) => (
              <div key={index} className="flex h-40 items-end rounded-xl bg-white/5 p-2">
                <div className="w-full rounded-lg bg-mint" style={{ height: `${value}%` }} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Moon className="text-peach" /> Вечерняя сводка</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Activity size={18} className="text-mint" /> Закрыто задач: {report.approved}</p>
            <p className="flex items-center gap-2"><AlertTriangle size={18} className="text-berry" /> Просрочки: {report.overdue}</p>
            <p>Фокус на завтра: перенести незавершенные домашние дела и проверить задачи с высоким приоритетом.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
