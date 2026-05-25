import { FormEvent, useState } from "react";
import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Input } from "../components/ui";
import { supabase } from "../lib/supabase";
import { useAuth } from "../modules/auth/AuthProvider";
import { createProfile } from "../modules/family/familyApi";
import type { Role } from "../types/domain";

export function RegisterPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [role, setRole] = useState<Role>("parent");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role
          }
        }
      });
      if (signUpError) throw signUpError;
      if (data.user && data.session) {
        await createProfile(data.user.id, fullName, role);
        await refreshProfile();
      }
      navigate("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось зарегистрироваться.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame title="Создать Family OS" subtitle="Выберите роль и начните настройку семейного пространства.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <RolePicker role={role} setRole={setRole} />
        <Input required placeholder="Имя" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input required minLength={6} type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-berry">{error}</p>}
        <Button className="w-full" disabled={loading}>{loading ? "Создаем..." : "Зарегистрироваться"}</Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-400">
        Уже есть аккаунт? <Link className="text-mint" to="/login">Войти</Link>
      </p>
    </AuthFrame>
  );
}

function RolePicker({ role, setRole }: { role: Role; setRole: (role: Role) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
      {[
        ["parent", "Я родитель"],
        ["child", "Я ребенок"]
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setRole(value as Role)}
          className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${role === value ? "bg-mint text-ink" : "text-slate-300"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AuthFrame({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10 text-slate-100">
      <Card className="w-full max-w-md">
        <div className="mb-7 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-mint">Family OS</p>
          <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>
        {children}
      </Card>
    </main>
  );
}
