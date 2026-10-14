#!/usr/bin/env bash
# ============================================================================
# КиноВспышка — Автоматический деплой reverse-proxy на российский VPS
# ----------------------------------------------------------------------------
# Что делает скрипт:
#   1. Проверяет Docker / Docker Compose
#   2. Запускает Caddy (reverse-proxy → Vercel)
#   3. Ждёт выпуска Let's Encrypt сертификата
#   4. Проверяет, что сайт отвечает 200
#
# ТРЕБОВАНИЯ:
#   - Ubuntu 22.04+ / Debian 12+ (Timeweb, Selectel, Beget, Aeza, ...)
#   - Открытые порты 80 и 443 в файрволе VPS
#   - DNS: A-запись kino.kataevweb.ru → IP этого VPS (DNS-only, серое облако CF)
#   - Vercel: домен kino.kataevweb.ru уже добавлен и верифицирован
# ============================================================================

set -euo pipefail

DOMAIN="kino.kataevweb.ru"
UPSTREAM="kinovspyshka-cinema.vercel.app"

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

echo "================================================"
echo "  КиноВспышка — Деплой reverse-proxy на VPS"
echo "  Домен: $DOMAIN"
echo "================================================"
echo ""

# 1. Проверка root/sudo
if [ "$EUID" -ne 0 ]; then
  warn "Скрипт лучше запускать от root (нужны порты 80/443)."
  echo "    Перезапуск через: sudo $0"
  echo ""
fi

# 2. Проверка Docker
if ! command -v docker &>/dev/null; then
  log "Docker не найден — устанавливаю..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

if ! docker compose version &>/dev/null; then
  err "Docker Compose v2 недоступен. Установите: apt install docker-compose-plugin"
  exit 1
fi
log "Docker $(docker --version) — OK"

# 3. Проверка DNS — должен резолвиться на IP этого VPS
PUBLIC_IP=$(curl -s4 https://ifconfig.me || curl -s4 https://api.ipify.org)
DNS_IP=$(dig +short "$DOMAIN" A | head -1)

echo ""
echo "  IP этого VPS:    $PUBLIC_IP"
echo "  DNS для домена:  $DNS_IP"
echo ""

if [ -z "$DNS_IP" ]; then
  err "Домен $DOMAIN не резолвится!"
  echo "   Создайте A-запись в Cloudflare:"
  echo "     Тип:  A"
  echo "     Имя:  kino"
  echo "     IP:   $PUBLIC_IP"
  echo "     Proxy status: DNS only (серое облако)"
  exit 1
fi

if [ "$DNS_IP" != "$PUBLIC_IP" ]; then
  warn "DNS ($DNS_IP) ≠ IP VPS ($PUBLIC_IP)"
  warn "В Cloudflare поставьте DNS-only (серое облако) и A-запись → $PUBLIC_IP"
  echo ""
  read -p "Продолжить несмотря на несоответствие? [y/N] " -n 1 -r
  echo
  [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
fi
log "DNS настроен корректно"

# 4. Проверка портов 80/443
if ss -tlnp | grep -qE ':80\s|:443\s'; then
  warn "Порт 80 или 443 уже занят. Caddy может не запуститься."
  echo "    Проверьте: sudo ss -tlnp | grep -E ':80|:443'"
  echo ""
  read -p "Всё равно продолжить? [y/N] " -n 1 -r
  echo
  [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
fi

# 5. Открыть файрвол (если ufw активен)
if command -v ufw &>/dev/null && ufw status | grep -q "active"; then
  log "Открываю порты 80, 443 в ufw..."
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow 443/udp
fi

# 6. Запуск Caddy
log "Запускаю Caddy через docker compose..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

# 7. Ждём выпуска SSL-сертификата (Let's Encrypt)
echo ""
log "Жду выпуска Let's Encrypt сертификата (до 60 сек)..."
for i in $(seq 1 30); do
  if curl -sI "https://$DOMAIN/" --max-time 5 2>/dev/null | grep -q "^HTTP"; then
    break
  fi
  sleep 2
  printf "."
done
echo ""

# 8. Финальная проверка
HTTP_CODE=$(curl -sI -o /dev/null -w "%{http_code}" --max-time 15 "https://$DOMAIN/" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo ""
  log "============================================================"
  log "  УСПЕХ! Сайт работает: https://$DOMAIN"
  log "============================================================"
  echo ""
  echo "  Проверка из России (T2/Ростелеком) теперь должна работать:"
  echo "    — IP, к которому подключается пользователь: $PUBLIC_IP (российский)"
  echo "    — Этот VPS проксирует на Vercel через транзит хостинга"
  echo "    — DPI Ростелекома не блокирует российские IP"
  echo ""
  echo "  Команды:"
  echo "    Логи:    docker compose logs -f"
  echo "    Рестарт: docker compose restart"
  echo "    Стоп:    docker compose down"
  echo ""
  echo "  Альтернативная проверка из браузера:"
  echo "    https://$DOMAIN/"
else
  echo ""
  err "Сайт вернул HTTP $HTTP_CODE. Проверьте логи:"
  echo "    docker compose logs --tail=50"
  echo ""
  echo "  Возможные причины:"
  echo "    1. SSL-сертификат ещё выпускается (подождите 2-3 мин)"
  echo "    2. Vercel не имеет домена $DOMAIN в конфигурации"
  echo "       → Проверьте: https://vercel.com/kinovspyshka-cinema/settings/domains"
  echo "    3. Cloudflare прокси включён (оранжевое облако) — выключите (серое)"
fi
