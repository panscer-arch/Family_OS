import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input } from "../components/ui";
import { useAuth } from "../modules/auth/AuthProvider";
import { createFamily, joinFamilyByInvite } from "../modules/family/familyApi";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [parentMode, setParentMode] = useState<"create" | "join">("create");
  const [familyName, setFamilyName] = useState("Моя семья");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !profile) return;
    setLoading(true);
    setError("");
    try {
      if (profile.role === "parent") {
        if (parentMode === "create") {
          await createFamily(user.id, familyName);
        } else {
          await joinFamilyByInvite(user.id, inviteCode);
          await refreshProfile();
        }
        navigate("/parent/dashboard");
      } else {
        await joinFamilyByInvite(user.id, inviteCode);
        await refreshProfile();
        navigate("/child/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось завершить подключение.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <main className="grid min-h-screen place-items-center bg-ink text-slate-100">Готовим профиль...</main>;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10 text-slate-100">
      <Card className="w-full max-w-lg">
        <p className="text-xs uppercase tracking-[0.28em] text-mint">Настройка</p>
        <h1 className="mt-3 text-3xl font-semibold">
          {profile?.role === "parent" ? "Семейное пространство" : "Подключитесь к семье"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {profile?.role === "parent"
            ? "Создайте новую семью или подключитесь как второй родитель по invite code."
            : "Введите код приглашения, который дал родитель."}
        </p>
        <form className="mt-7 space-y-4" onSubmit={onSubmit}>
          {profile?.role === "parent" ? (
            <>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setParentMode("create")}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${parentMode === "create" ? "bg-mint text-ink" : "text-slate-300"}`}
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setParentMode("join")}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${parentMode === "join" ? "bg-mint text-ink" : "text-slate-300"}`}
                >
                  Войти по коду
                </button>
              </div>
              {parentMode === "create" ? (
                <Input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="Название семьи" required />
              ) : (
                <Input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Invite code второго родителя" required />
              )}
            </>
          ) : (
            <Input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Invite code" required />
          )}
          {error && <p className="text-sm text-berry">{error}</p>}
          <Button disabled={loading} className="w-full">{loading ? "Сохраняем..." : "Продолжить"}</Button>
        </form>
      </Card>
    </main>
  );
}
