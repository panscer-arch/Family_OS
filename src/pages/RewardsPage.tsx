import { BadgeCheck, Gift, Medal, Sparkles, Trophy } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, StatCard, Textarea } from "../components/ui";
import { useAuth } from "../modules/auth/AuthProvider";
import { getMyFamily } from "../modules/family/familyApi";
import { createReward, getRewards } from "../modules/rewards/rewardApi";
import type { Family, Reward } from "../types/domain";

const icons = [Gift, Sparkles, Trophy, Medal];

export function RewardsPage() {
  const { user, profile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsCost, setPointsCost] = useState(50);

  const reload = async () => {
    if (!user) return;
    const membership = await getMyFamily(user.id);
    if (!membership) return;
    setFamily(membership.families);
    setRewards(await getRewards(membership.family_id));
  };

  useEffect(() => {
    void reload();
  }, [user]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!family || !title.trim()) return;
    const reward = await createReward({
      familyId: family.id,
      title: title.trim(),
      description,
      pointsCost
    });
    setRewards((prev) => [...prev, reward].sort((a, b) => a.points_cost - b.points_cost));
    setTitle("");
    setDescription("");
    setPointsCost(50);
  };

  return (
    <div className="page space-y-6">
      <section>
        <h2 className="text-3xl font-semibold">Мотивация</h2>
        <p className="mt-2 text-slate-400">Баллы, уровни, награды, достижения и streaks.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Баллы" value={profile?.points ?? 0} />
        <StatCard label="Уровень" value={profile?.level ?? 1} tone="sky" />
        <StatCard label="Streak" value={profile?.streak ?? 0} tone="peach" />
      </div>

      {profile?.role === "parent" && (
        <Card>
          <h3 className="text-lg font-semibold">Создать награду</h3>
          <form className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_150px_auto]" onSubmit={onCreate}>
            <Input required placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input type="number" min={1} value={pointsCost} onChange={(e) => setPointsCost(Number(e.target.value))} />
            <Button>Добавить</Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {rewards.map((reward, index) => {
          const Icon = icons[index % icons.length];
          const canAfford = (profile?.points ?? 0) >= reward.points_cost;
          return (
            <Card key={reward.id}>
              <Icon className="text-mint" />
              <h3 className="mt-4 font-semibold">{reward.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{reward.description || "Семейная награда"}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-peach/20 px-3 py-1 text-sm text-peach">{reward.points_cost} баллов</span>
                {profile?.role === "child" && (
                  <span className={`text-xs ${canAfford ? "text-mint" : "text-slate-500"}`}>
                    {canAfford ? "Доступно" : "Копим"}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
        {!rewards.length && <p className="text-sm text-slate-400">Награды пока не созданы.</p>}
      </div>

      <Card>
        <h3 className="flex items-center gap-2 text-lg font-semibold"><BadgeCheck className="text-skysoft" /> Достижения</h3>
        <p className="mt-3 text-sm text-slate-400">Достижения и streaks уже есть в модели данных; следующий шаг - автоматическая выдача за серии выполненных задач.</p>
      </Card>
    </div>
  );
}
