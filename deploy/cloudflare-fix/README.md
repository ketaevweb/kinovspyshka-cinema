# ⚡ Быстрое решение — правильная настройка Cloudflare (10 минут)

> **Если не хотите поднимать VPS**, попробуйте сначала этот вариант.
> Он работает в ~70% случаев блокировок Ростелекома.
> Если не поможет — используйте [Russian VPS proxy](../russian-vps/README.md).

## Почему предыдущие попытки не сработали

В worklog (Task 22/24) Cloudflare-прокси включался, но сайт всё равно не открывался.
Самая частая причина — **SSL-режим Cloudflare стоял в Flexible**, что создавало
бесконечный redirect-loop (Vercel форсирует HTTPS, а Cloudflare в Flexible шлёт HTTP → Vercel редиректит → зацикливание → `ERR_TOO_MANY_REDIRECTS` или `ERR_CONNECTION_RESET`).

Вторая причина — оранжевое облако **не было фактически включено** (Cloudflare кэширует DNS 5–10 мин).

## Пошаговая настройка

### 1. Включить прокси (оранжевое облако)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → зона `kataevweb.ru` → **DNS → Records**.
2. Найдите запись `kino` (тип CNAME → `cname.vercel-dns.com` или A-запись).
3. Нажмите **Edit**.
4. **Proxy status** → 🟧 **Proxied** (оранжевое облако).
5. Сохранить.

> ⚠️ После изменения DNS резолвинг переключится с Vercel-IP (76.76.21.x)
> на Cloudflare-IP (104.21.x / 172.67.x) в течение 1–5 минут.

### 2. Поставить SSL = Full (strict)

1. Cloudflare → **SSL/TLS → Overview**.
2. Выберите **Full (strict)** (НЕ Flexible, НЕ Full).

Зачем:
- `Full (strict)` — Cloudflare → Vercel по HTTPS с проверкой сертификата.
- `Flexible` — вызывает redirect loop (Vercel требует HTTPS).
- `Full` (без strict) — работает, но без проверки сертификата.

### 3. Выключить «Always Use HTTPS» для домена Vercel

1. **SSL/TLS → Edge Certificates**.
2. **Always Use HTTPS** → ON (это OK).
3. **Automatic HTTPS Rewrites** → ON.

### 4. Отключить gRPC и включить HTTP/3

1. **Network**:
   - **HTTP/3 (with QUIC)** → ON — ускоряет загрузку на мобильной сети T2.
   - **0-RTT Connection Resumption** → ON.
   - **IPv6 Compatibility** → ON.

### 5. Кэширование статических ассетов (ускоряет повторные загрузки)

1. **Caching → Configuration**:
   - **Browser Cache TTL** → 4 часа.
   - **Always Use HTTPS** → ON.

2. **Caching → Cache Rules → Create rule**:
   - **If**: URI Path starts with `/_next/static/`
   - **Then**: Cache eligibility = Eligible for cache; Edge TTL = 1 month.
   - Имя: «Next.js static assets»
   - Сохранить.

3. Ещё одно правило для постеров:
   - **If**: URI Path starts with `/posters/`
   - **Then**: Cache eligibility = Eligible for cache; Edge TTL = 7 days.
   - Имя: «Movie posters»
   - Сохранить.

### 6. (Опционально) Under Attack Mode — если DPI агрессивный

Если сайт всё ещё периодически падает:

1. **Security → Settings**.
2. **Security Level** → **Essentially Off** (чтобы не было капчи).
3. НЕ включайте «Under Attack Mode» — добавит задержку.

### 7. Подождать 5–10 минут

Cloudflare нужно время на:
- Проксирование DNS (1–5 мин)
- Выпуск Universal SSL сертификата (до 15 мин для нового домена)
- Распространение конфигурации по edge-узлам (5 мин)

Проверьте:
```bash
# Должно показать Cloudflare-IP (104.21.x или 172.67.x), НЕ Vercel
dig +short kino.kataevweb.ru

# Должно вернуть 200, header: server: cloudflare
curl -sI https://kino.kataevweb.ru/ | head -10
```

---

## 🧪 Проверка блокировки на T2 (Пермь)

После настройки попросите пользователя на T2:

1. **Очистить кэш DNS** (Android: включить/выключить «Авиарежим»).
2. Открыть `https://kino.kataevweb.ru/` **без VPN**.
3. Если `ERR_CONNECTION_RESET`:
   - Поменять DNS телефона на `1.1.1.1` или `8.8.8.8`
   - Открыть ещё раз

Если с DNS `1.1.1.1` работает — проблема в DNS Ростелекома (кэширует старый Vercel IP).
Если всё равно `ERR_CONNECTION_RESET` — DPI Ростелекома блокирует Cloudflare-IP по SNI.
В этом случае **единственная надёжная альтернатива — российский VPS proxy**:
→ [`deploy/russian-vps/README.md`](../russian-vps/README.md)

---

## ⚖️ Сравнение решений

| Критерий | Cloudflare (этот гайд) | Российский VPS proxy |
|---|---|---|
| Время настройки | 10 минут | 30 минут |
| Стоимость | 0 ₽ | ~150 ₽/мес |
| Стабильность на T2 (Пермь) | ⚠️ ~70% (DPI нестабилен) | ✅ ~100% |
| Поддержка HTTP/3 | ✅ | ✅ |
| Поддержка IPv6 | ✅ | зависит от хостинга |
| Кастомные cache rules | ✅ | ✅ (через Caddy) |
| Зависимость от 3rd party | Cloudflare (US) | VPS-провайдер (РФ) |

**Рекомендация:** начните с Cloudflare (бесплатно, быстро). Если проблема вернётся
в течение 1–2 дней — поднимите российский VPS proxy как постоянное решение.
