import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, Select } from "../components/ui";
import { useAuth } from "../modules/auth/AuthProvider";
import { getMyFamily } from "../modules/family/familyApi";
import { addSkill, getSkills, updateSkillStatus } from "../modules/skills/skillApi";
import type { Family, Skill } from "../types/domain";

const categories = ["забота о себе", "дом", "мышление", "эмоции", "финансы", "безопасность", "учеба"];

export function SkillsPage() {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("забота о себе");
  const [childLabel, setChildLabel] = useState("Умею заботиться о себе");

  useEffect(() => {
    if (!user) return;
    getMyFamily(user.id).then(async (membership) => {
      if (!membership) return;
      setFamily(membership.families);
      setSkills(await getSkills(membership.family_id));
    });
  }, [user]);

  const onAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!family || !title.trim()) return;
    const skill = await addSkill({ familyId: family.id, title: title.trim(), category, childLabel, points: 40 });
    setSkills((prev) => [skill, ...prev]);
    setTitle("");
  };

  return (
    <div className="page space-y-6">
      <section>
        <h2 className="text-3xl font-semibold">Навыки</h2>
        <p className="mt-2 text-slate-400">Детским языком: чему учимся и как понимаем, что навык освоен.</p>
      </section>
      <Card>
        <form className="grid gap-3 md:grid-cols-[1fr_180px_1fr_auto]" onSubmit={onAdd}>
          <Input placeholder="Например: пользоваться петличным микрофоном" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Input placeholder="Детская формулировка" value={childLabel} onChange={(event) => setChildLabel(event.target.value)} />
          <Button>Добавить</Button>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {skills.map((skill) => (
          <Card key={skill.id}>
            <p className="text-sm text-mint">{skill.category}</p>
            <h3 className="mt-3 font-semibold">{skill.child_label}</h3>
            <p className="mt-2 text-sm text-slate-400">{skill.title}</p>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-mint" style={{ width: `${skill.progress}%` }} />
            </div>
            <Button className="mt-4 w-full" onClick={() => updateSkillStatus(skill.id, "mastered", 100)}>Освоено</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
