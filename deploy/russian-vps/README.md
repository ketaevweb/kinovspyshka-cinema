# 🛡️ Обход блокировки T2 / Ростелеком — Reverse Proxy на российском VPS

## Проблема

Сайт `kino.kataevweb.ru` хостится на **Vercel** (IP `76.76.21.x` / `66.33.60.x`). На мобильной сети **T2 в Пермском крае** (транзит Ростелекома) эти IP блокируются на уровне **DPI (Deep Packet Inspection)** — TLS-handshake сбрасывается, `ERR_CONNECTION_RESET`.

Cloudflare-прокси (оранжевое облако) иногда работает, но нестабильно — DPI Ростелекома периодически блокирует и Cloudflare-IP при определённом SNI.

## Решение

**Российский VPS с Caddy reverse-proxy.** Принцип:

```
Пользователь (T2, Ростелеком)
    │  HTTPS → kino.kataevweb.ru
    ▼
Российский VPS (IP не заблокирован DPI)     ← Caddy + Let's Encrypt
    │  HTTPS → cname.vercel-dns.com (Host: kino.kataevweb.ru)
    ▼
Vercel (через транзит хостинга, БЕЗ DPI Ростелекома)
```

Почему это работает:
- **Российские IP не блокируются** DPI Ростелекома (блокировка настроена на зарубежные IP Vercel/Cloudflare по SNI).
- **Российский хостинг-провайдер** (Timeweb, Selectel, Aeza) выходит в интернет через **свой транзит**, а не через DPI Ростелекома → Vercel доступен с VPS.

---

## 📋 Что понадобится

| Пункт | Где взять | Цена |
|---|---|---|
| Российский VPS (Ubuntu 22.04+, 1 CPU / 512 MB RAM достаточно) | [Timeweb Cloud](https://timeweb.cloud), [Selectel](https://selectel.ru), [Aeza](https://aeza.net), [Beget](https://beget.com) | ~150–200 ₽/мес |
| Доступ к Cloudflare DNS | [dash.cloudflare.com](https://dash.cloudflare.com) | бесплатно |
| Доступ к Vercel (домен уже добавлен) | [vercel.com/kinovspyshka-cinema](https://vercel.com) | — |

Файлы из этого каталога: `Caddyfile`, `docker-compose.yml`, `deploy.sh`.

---

## 🚀 Деплой за 5 шагов

### Шаг 1. Заказать VPS

1. Зарегистрируйтесь на [Timeweb Cloud](https://timeweb.cloud) (самый простой, оплата картой РФ / СБП).
2. Создайте сервер:
   - **ОС**: Ubuntu 22.04
   - **Конфиг**: 1 CPU, 512 MB RAM, 5 GB SSD — достаточно
   - **Регион**: любой российский (Москва / СПб)
   - Цена: ~150 ₽/мес
3. Скопируйте IP сервера и root-пароль.

### Шаг 2. Подключиться по SSH

```bash
ssh root@<IP_ВАШЕГО_VPS>
```

### Шаг 3. Скопировать файлы прокси

На VPS выполните:

```bash
mkdir -p /opt/kino-proxy && cd /opt/kino-proxy

# Caddyfile
cat > Caddyfile <<'EOF'
{DOMAIN_PLACEHOLDER}
EOF

# docker-compose.yml
cat > docker-compose.yml <<'EOF'
{COMPOSE_PLACEHOLDER}
EOF
```

> **Проще:** склонируйте репозиторий проекта и скопируйте каталог `deploy/russian-vps/`:
> ```bash
> apt update && apt install -y git
> git clone https://github.com/ketaevweb/kinovspyshka-cinema.git
> cd kinovspyshka-cinema/deploy/russian-vps
> cp Caddyfile docker-compose.yml deploy.sh /opt/kino-proxy/
> cd /opt/kino-proxy
> ```

### Шаг 4. Настроить DNS в Cloudflare

1. Откройте [dash.cloudflare.com](https://dash.cloudflare.com) → зона `kataevweb.ru`.
2. Раздел **DNS → Records**.
3. **Удалите** существующую запись для `kino` (CNAME на `cname.vercel-dns.com`).
4. **Создайте новую A-запись**:
   - **Type**: `A`
   - **Name**: `kino`
   - **IPv4 address**: `<IP_ВАШЕГО_VPS>`
   - **Proxy status**: 🩶 **DNS only** (серое облако) — **ВАЖНО!**
   - **TTL**: Auto

> ⚠️ **Обязательно серое облако!** Если включить оранжевое (прокси), трафик пойдёт через Cloudflare-IP, и нестабильность вернётся.

### Шаг 5. Запустить прокси

```bash
cd /opt/kino-proxy
chmod +x deploy.sh
./deploy.sh
```

Скрипт:
1. Установит Docker (если нет)
2. Проверит, что DNS указывает на этот VPS
3. Запустит Caddy
4. Дождётся выпуска Let's Encrypt сертификата (≈30 сек)
5. Проверит, что `https://kino.kataevweb.ru` отвечает 200

Готово! 🎉 Сайт открывается из России без VPN.

---

## 🔍 Проверка

```bash
# Должно вернуть 200 и IP вашего VPS
curl -sI https://kino.kataevweb.ru/ | head -5

# Логи прокси
docker compose logs -f
```

В браузере на T2 (БЕЗ VPN) откройте `https://kino.kataevweb.ru/` — должно загрузиться мгновенно.

---

## 🧰 Управление

```bash
cd /opt/kino-proxy

docker compose up -d        # Запуск
docker compose restart      # Рестарт
docker compose down         # Стоп
docker compose logs -f      | grep такого-то
docker compose pull && docker compose up -d  # Обновление Caddy
```

---

## ❓ Частые вопросы

**Q: Почему не Cloudflare прокси (оранжевое облако)?**
A: Cloudflare-IP периодически блокируются DPI Ростелекома при обращении к конкретному SNI (`kino.kataevweb.ru`). Российский VPS использует свой IP, который DPI не блокирует (фильтрация идёт по списку зарубежных CDN).

**Q: Что если Vercel удалит домен?**
A: Vercel хранит конфигурацию домена, даже если DNS указывает не на Vercel. Запрос с `Host: kino.kataevweb.ru` всё равно обслуживается. Проверьте в [Vercel → Settings → Domains](https://vercel.com/kinovspyshka-cinema/settings/domains), что домен есть в списке (даже со статусом "Invalid Configuration" — это нормально).

**Q: Сайт работает, но изображения не грузятся?**
A: Постеры отдаются с того же домена (`/posters/...`) — прокси обрабатывает их автоматически. Проверьте логи Caddy: `docker compose logs --tail=100`.

**Q: VPS лёг / перезагрузился. Что делать?**
A: Caddy запускается автоматически (`restart: unless-stopped`). Просто подождите 30 сек.

**Q: Можно ли без Docker?**
A: Да, можно установить Caddy напрямую:
```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install caddy
cp Caddyfile /etc/caddy/Caddyfile
systemctl restart caddy
```

---

## 💰 Стоимость

- VPS Timeweb 1CPU/512MB: **~150 ₽/мес**
- Let's Encrypt SSL: **бесплатно**
- Cloudflare DNS: **бесплатно**
- Vercel: **бесплатно** (Hobby plan)

**Итого: 150 ₽/мес** — сайт стабильно работает во всех регионах РФ.
