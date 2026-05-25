import { BookOpen, Brain, CalendarDays, Home, LayoutDashboard, ListChecks, LogOut, Medal, MessageCircle, PieChart, ShieldCheck } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthProvider";

const baseNav = [
  { to: "/plan", label: "План", icon: CalendarDays },
  { to: "/tasks", label: "Задачи", icon: ListChecks },
  { to: "/home", label: "Дом", icon: Home },
  { to: "/library", label: "Библиотека", icon: BookOpen },
  { to: "/skills", label: "Навыки", icon: Brain },
  { to: "/rewards", label: "Награды", icon: Medal }
];

export function AppShell() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const dashboard = {
    to: profile?.role === "parent" ? "/parent/dashboard" : "/child/dashboard",
    label: "Обзор",
    icon: LayoutDashboard
  };
  const nav = profile?.role === "parent" ? [dashboard, ...baseNav, { to: "/reports", label: "Отчеты", icon: PieChart }] : [dashboard, ...baseNav];

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/90 backdrop-blur md:inset-y-0 md:left-0 md:right-auto md:w-64 md:border-r md:border-t-0">
        <div className="hidden px-5 py-6 md:block">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-mint text-ink">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="font-semibold">Family OS</p>
              <p className="text-xs text-slate-400">{profile?.role === "parent" ? "Родитель" : "Ребенок"} · семья</p>
            </div>
          </div>
        </div>
        <nav className={`grid gap-1 p-2 md:flex md:flex-col md:px-3 ${profile?.role === "parent" ? "grid-cols-4" : "grid-cols-4"}`}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition md:flex-row md:text-sm ${
                  isActive ? "bg-white/10 text-mint" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          <button
            className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white md:flex"
            onClick={async () => {
              await signOut();
              navigate("/login");
            }}
          >
            <LogOut size={18} />
            Выйти
          </button>
        </nav>
      </aside>

      <main className="pb-24 md:ml-64 md:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-ink/80 px-4 py-4 backdrop-blur md:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-mint">Family OS</p>
            <h1 className="text-xl font-semibold">Семейный центр</h1>
          </div>
          <button className="grid size-10 place-items-center rounded-xl bg-white/10 text-slate-300 md:hidden">
            <MessageCircle size={18} />
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
