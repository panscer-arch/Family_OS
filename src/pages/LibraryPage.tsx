import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, Select, Textarea } from "../components/ui";
import { useAuth } from "../modules/auth/AuthProvider";
import { getMyFamily } from "../modules/family/familyApi";
import { addLibraryItem, getLibraryItems, updateLibraryStatus } from "../modules/library/libraryApi";
import type { Family, LibraryItem } from "../types/domain";

export function LibraryPage() {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("book");
  const [url, setUrl] = useState("");
  const [report, setReport] = useState("");

  useEffect(() => {
    if (!user) return;
    getMyFamily(user.id).then(async (membership) => {
      if (!membership) return;
      setFamily(membership.families);
      setItems(await getLibraryItems(membership.family_id));
    });
  }, [user]);

  const onAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!family || !title.trim()) return;
    const item = await addLibraryItem({ familyId: family.id, title: title.trim(), kind, url, assignedBy: user?.id });
    setItems((prev) => [item, ...prev]);
    setTitle("");
    setUrl("");
  };

  return (
    <div className="page space-y-6">
      <section>
        <h2 className="text-3xl font-semibold">Библиотека развития</h2>
        <p className="mt-2 text-slate-400">Книги, ролики, материалы, ссылки и короткие отчеты после изучения.</p>
      </section>
      <Card>
        <form className="grid gap-3 md:grid-cols-[1fr_180px_1fr_auto]" onSubmit={onAdd}>
          <Input placeholder="Название материала" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Select value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="book">Книга</option>
            <option value="video">Видео</option>
            <option value="article">Статья</option>
            <option value="course">Курс</option>
          </Select>
          <Input placeholder="Ссылка" value={url} onChange={(event) => setUrl(event.target.value)} />
          <Button>Добавить</Button>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <p className="text-sm text-mint">{item.kind}</p>
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            {item.url && <p className="mt-2 text-sm text-slate-400">{item.url}</p>}
            <div className="mt-4">
              <Textarea placeholder="Краткий отчет" value={report} onChange={(event) => setReport(event.target.value)} />
            </div>
            <Button className="mt-3 w-full" onClick={() => updateLibraryStatus(item.id, "learned", report)}>Изучено</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
