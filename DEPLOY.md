# Family OS: публикация сайта

## Текущий production-сервер

Family OS сейчас опубликован на сервере:

```text
IP: 145.223.90.93
Web root: /var/www/html
Repo clone: /opt/family-os
Public source: /opt/family-os/preview
```

На сервере установлен `nginx`. Он отдает статический preview из `/var/www/html`.

Автообновление настроено через `systemd`:

```text
/usr/local/bin/deploy-family-os.sh
/etc/systemd/system/family-os-deploy.service
/etc/systemd/system/family-os-deploy.timer
```

Таймер запускается примерно раз в минуту. Он делает:

```text
git fetch origin main
git reset --hard origin/main
rsync -a --delete /opt/family-os/preview/ /var/www/html/
nginx -t
systemctl reload nginx
```

Лог последнего деплоя:

```text
/var/log/family-os-deploy.log
```

Рабочий процесс:

1. Меняем проект локально.
2. Делаем commit.
3. Делаем `git push origin main`.
4. Сервер сам подтягивает новый `main` и обновляет сайт.

Проверки на сервере:

```bash
systemctl status family-os-deploy.timer --no-pager
systemctl status family-os-deploy.service --no-pager
cat /var/log/family-os-deploy.log
curl -I http://localhost
```

Домен `bimbimpatapim.com` должен указывать A-записью на `145.223.90.93`.

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
