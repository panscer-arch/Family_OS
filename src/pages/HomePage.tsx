import { Bell, Home, MessageCircle, ShoppingCart, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, Select, StatCard } from "../components/ui";
import { useAuth } from "../modules/auth/AuthProvider";
import { getFamilyChildren, getFamilyMembers, getMyFamily } from "../modules/family/familyApi";
import { addChore, addShoppingItem, getChores, getShoppingList, toggleChore, toggleShoppingItem } from "../modules/home/homeApi";
import { getMyNotifications, markNotificationRead, sendFamilyMessage } from "../modules/notifications/notificationApi";
import type { Chore, Family, FamilyMember, FamilyNotification, Profile, ShoppingItem } from "../types/domain";

export function HomePage() {
  const { user, profile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [children, setChildren] = useState<Array<FamilyMember & { profile: Profile }>>([]);
  const [members, setMembers] = useState<Array<FamilyMember & { profile: Profile }>>([]);
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [shoppingTitle, setShoppingTitle] = useState("");
  const [choreTitle, setChoreTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [message, setMessage] = useState("");

  const reload = async () => {
    if (!user) return;
    const membership = await getMyFamily(user.id);
    if (!membership) return;
    setFamily(membership.families);
    const [items, houseChores, familyMembers, myNotifications] = await Promise.all([
      getShoppingList(membership.family_id),
      getChores(membership.family_id),
      getFamilyMembers(membership.family_id),
      getMyNotifications(user.id)
    ]);
    setShopping(items);
    setChores(houseChores);
    setMembers(familyMembers);
    setNotifications(myNotifications);
    if (profile?.role === "parent") {
      const kids = await getFamilyChildren(membership.family_id);
      setChildren(kids);
      setAssigneeId((current) => current || kids[0]?.user_id || "");
    }
  };

  useEffect(() => {
    void reload();
  }, [user, profile?.role]);

  const onAddShopping = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !family || !shoppingTitle.trim()) return;
    const item = await addShoppingItem(family.id, shoppingTitle.trim(), user.id);
    setShopping((prev) => [item, ...prev]);
    setShoppingTitle("");
  };

  const onAddChore = async (event: FormEvent) => {
    event.preventDefault();
    if (!family || !choreTitle.trim()) return;
    const chore = await addChore(family.id, choreTitle.trim(), assigneeId);
    setChores((prev) => [chore, ...prev]);
    setChoreTitle("");
  };

  const onSendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!family || !user || !profile || !message.trim()) return;
    const recipientIds = members.map((member) => member.user_id).filter((id) => id !== user.id);
    await sendFamilyMessage({
      familyId: family.id,
      senderName: profile.full_name,
      recipientIds,
      body: message.trim()
    });
    setMessage("");
  };

  return (
    <div className="page space-y-6">
      <section>
        <h2 className="text-3xl font-semibold">Дом и быт</h2>
        <p className="mt-2 text-slate-400">Покупки, домашние обязанности, напоминания и быстрые семейные сообщения.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Покупки" value={shopping.filter((item) => !item.is_done).length} />
        <StatCard label="Домашние дела" value={chores.filter((chore) => !chore.is_done).length} tone="sky" />
        <StatCard label="Напоминания" value={3} tone="peach" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <h3 className="flex items-center gap-2 text-lg font-semibold"><ShoppingCart className="text-mint" /> Список покупок</h3>
          <form className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]" onSubmit={onAddShopping}>
            <Input placeholder="Добавить покупку" value={shoppingTitle} onChange={(e) => setShoppingTitle(e.target.value)} />
            <Button>Добавить</Button>
          </form>
          <div className="mt-4 space-y-2">
            {shopping.map((item) => (
              <label key={item.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={item.is_done}
                  onChange={(e) => {
                    void toggleShoppingItem(item.id, e.target.checked);
                    setShopping((prev) => prev.map((next) => next.id === item.id ? { ...next, is_done: e.target.checked } : next));
                  }}
                />
                <span className={item.is_done ? "text-slate-500 line-through" : ""}>{item.title}</span>
              </label>
            ))}
            {!shopping.length && <p className="text-sm text-slate-500">Список покупок пуст.</p>}
          </div>
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Home className="text-skysoft" /> Уборка и обязанности</h3>
          {profile?.role === "parent" && (
            <form className="mt-4 space-y-2" onSubmit={onAddChore}>
              <Input placeholder="Добавить обязанность" value={choreTitle} onChange={(e) => setChoreTitle(e.target.value)} />
              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <Select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                  <option value="">Вся семья</option>
                  {children.map((child) => <option key={child.user_id} value={child.user_id}>{child.profile.full_name}</option>)}
                </Select>
                <Button>Назначить</Button>
              </div>
            </form>
          )}
          <div className="mt-4 space-y-2">
            {chores.map((chore) => (
              <label key={chore.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={chore.is_done}
                  onChange={(e) => {
                    void toggleChore(chore.id, e.target.checked);
                    setChores((prev) => prev.map((next) => next.id === chore.id ? { ...next, is_done: e.target.checked } : next));
                  }}
                />
                <span className={chore.is_done ? "text-slate-500 line-through" : ""}>{chore.title}</span>
              </label>
            ))}
            {!chores.length && <p className="text-sm text-slate-500">Домашних обязанностей пока нет.</p>}
          </div>
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Bell className="text-peach" /> Напоминания</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p className="rounded-xl bg-white/5 p-3">19:30 · собрать рюкзак</p>
            <p className="rounded-xl bg-white/5 p-3">20:00 · проверить уроки</p>
            <p className="rounded-xl bg-white/5 p-3">21:30 · сон</p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="flex items-center gap-2 text-lg font-semibold"><MessageCircle className="text-berry" /> Быстрые сообщения</h3>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={onSendMessage}>
          <Input placeholder="Написать короткое сообщение семье" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button>Отправить</Button>
        </form>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              className="rounded-xl bg-white/5 p-3 text-left text-sm text-slate-300 transition hover:bg-white/10"
              onClick={() => {
                void markNotificationRead(notification.id);
                setNotifications((prev) => prev.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item));
              }}
            >
              <span className={notification.read_at ? "text-slate-500" : "text-mint"}>{notification.title}</span>
              <span className="mt-1 block">{notification.body}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-400"><Sparkles size={16} /> Нажмите на уведомление, чтобы отметить его прочитанным.</p>
      </Card>
    </div>
  );
}
