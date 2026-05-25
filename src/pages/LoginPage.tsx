import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Input } from "../components/ui";
import { supabase } from "../lib/supabase";
import { useAuth } from "../modules/auth/AuthProvider";

export function LoginPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      await refreshProfile();
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10 text-slate-100">
      <Card className="w-full max-w-md">
        <div className="mb-7 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-mint">Family OS</p>
          <h1 className="mt-3 text-3xl font-semibold">Вход</h1>
          <p className="mt-2 text-sm text-slate-400">Вернитесь к задачам, планам и семейным отчетам.</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input required type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-berry">{error}</p>}
          <Button className="w-full" disabled={loading}>{loading ? "Входим..." : "Войти"}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          Нет аккаунта? <Link className="text-mint" to="/register">Зарегистрироваться</Link>
        </p>
      </Card>
    </main>
  );
}
