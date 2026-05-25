# Family OS: публикация сайта

## Открыть в вашей Wi-Fi сети

Сервер preview запущен на всех интерфейсах. На других устройствах в той же Wi-Fi сети откройте:

```text
http://192.168.1.81:4173
```

Если не открывается, проверьте, что устройство подключено к той же сети и macOS Firewall не блокирует входящие подключения для Python.

## Опубликовать в интернет без сборки

Самый быстрый путь:

1. Откройте Netlify Drop: `https://app.netlify.com/drop`.
2. Перетащите папку `family-os/preview`.
3. Netlify выдаст публичную ссылку вида `https://...netlify.app`.

## Опубликовать через Netlify из репозитория

В проекте уже есть `netlify.toml`.

Настройки:

- Build command: пусто
- Publish directory: `preview`

## Опубликовать через Vercel

В проекте уже есть `vercel.json`.

Настройки:

- Framework preset: Other
- Output directory: `preview`

## Полноценная версия с аккаунтами

Статический preview можно показать семье сразу. Для настоящих аккаунтов, ролей, invite code и данных нужно поднять React + Supabase версию:

1. Выполнить SQL из `supabase/schema.sql` в Supabase.
2. Заполнить `.env.local` по `.env.example`.
3. Установить зависимости и задеплоить React-приложение.
