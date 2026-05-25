import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Select } from "../components/ui";
import { useAuth } from "../modules/auth/AuthProvider";
import { getFamilyChildren, getMyFamily } from "../modules/family/familyApi";
import { addWeeklyPlanItem, generateDailyTasksFromPlan, getOrCreateWeeklyPlan, getWeeklyPlanItems } from "../modules/weekly/weeklyPlanApi";
import type { Family, FamilyMember, Profile, WeeklyPlan, WeeklyPlanItem } from "../types/domain";

const areas = ["учеба", "дом", "контент", "еда", "прогулка", "сон", "навык", "библиотека", "забота о себе"];

function isoDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function WeeklyPlanPage() {
  const { user, profile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [children, setChildren] = useState<Array<FamilyMember & { profile: Profile }>>([]);
  const [childId, setChildId] = useState("");
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [items, setItems] = useState<WeeklyPlanItem[]>([]);
  const [planDate, setPlanDate] = useState(isoDate());
  const [startsAt, setStartsAt] = useState("18:00");
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("учеба");

  const weekStart = useMemo(() => isoDate(), []);

  const reload = async () => {
    if (!user) return;
    const membership = await getMyFamily(user.id);
    if (!membership) return;
    setFamily(membership.families);
    const kids = await getFamilyChildren(membership.family_id);
    setChildren(kids);
    const selectedChild = childId || (profile?.role === "child" ? user.id : kids[0]?.user_id);
    if (!selectedChild) return;
    setChildId(selectedChild);
    const weeklyPlan = await getOrCreateWeeklyPlan({
      familyId: membership.family_id,
      childId: selectedChild,
      weekStart,
      createdBy: user.id
    });
    setPlan(weeklyPlan);
    setItems(await getWeeklyPlanItems(weeklyPlan.id));
  };

  useEffect(() => {
    void reload();
  }, [user, profile?.role]);

  const onAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!plan || !family || !childId || !title.trim()) return;
    const item = await addWeeklyPlanItem({
      weeklyPlanId: plan.id,
      familyId: family.id,
      childId,
      planDate,
      startsAt,
      title: title.trim(),
      area,
      tag: area,
      points: area === "дом" ? 10 : 15,
      resultRequired: area === "контент" || area === "дом"
    });
    setItems((prev) => [...prev, item]);
    setTitle("");
  };

  const onGenerate = async () => {
    if (!childId) return;
    await generateDailyTasksFromPlan(childId, planDate);
  };

  const grouped = items.reduce<Record<string, WeeklyPlanItem[]>>((acc, item) => {
    acc[item.plan_date] = [...(acc[item.plan_date] ?? []), item];
    return acc;
  }, {});

  return (
    <div className="page space-y-6">
      <section>
        <h2 className="text-3xl font-semibold">Недельный план</h2>
        <p className="mt-2 text-slate-400">Сначала семья заполняет неделю, потом выбранный день превращается в чек-лист задач.</p>
      </section>

      <Card>
        <form className="grid gap-3 lg:grid-cols-[1fr_150px_1fr_1fr_auto]" onSubmit={onAdd}>
          <Select value={childId} onChange={(event) => setChildId(event.target.value)}>
            {profile?.role === "child" && <option value={user?.id}>Я</option>}
            {children.map((child) => <option key={child.user_id} value={child.user_id}>{child.profile.full_name}</option>)}
          </Select>
          <Input type="date" value={planDate} onChange={(event) => setPlanDate(event.target.value)} />
          <Input type="time" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          <Select value={area} onChange={(event) => setArea(event.target.value)}>
            {areas.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Button>Добавить</Button>
          <div className="lg:col-span-5">
            <Input placeholder="Например: снять shorts и прикрепить ссылку" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
        </form>
      </Card>

      <div className="grid gap-3 md:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => {
          const date = isoDate(index);
          return (
            <Card key={date} className={date === planDate ? "border-mint/40" : ""}>
              <button className="w-full text-left" onClick={() => setPlanDate(date)}>
                <p className="text-sm text-mint">{new Date(date).toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" })}</p>
                <div className="mt-3 space-y-2">
                  {(grouped[date] ?? []).map((item) => (
                    <p key={item.id} className="rounded-xl bg-white/5 p-2 text-xs text-slate-300">{item.starts_at?.slice(0, 5)} {item.title}</p>
                  ))}
                </div>
              </button>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Сформировать задачи дня</h3>
            <p className="mt-1 text-sm text-slate-400">Пункты выбранной даты уйдут в дневной чек-лист ребенка.</p>
          </div>
          <Button onClick={onGenerate}>Сделать задачи на день</Button>
        </div>
      </Card>
    </div>
  );
}
