# 🚀 Руководство по деплою

## Архитектура проекта

Проект использует **раздельную архитектуру**:
- **Frontend**: React + Vite (статические файлы)
- **Backend**: Node.js + Express (API + Telegram Bot)

Это позволяет:
- ✅ Независимо масштабировать frontend и backend
- ✅ Использовать CDN для frontend (быстрая загрузка)
- ✅ Легко мигрировать на микросервисы в будущем
- ✅ Разделять команды разработки

---

## Вариант 1: Раздельный деплой (рекомендуется)

### Frontend → Vercel

**Шаг 1:** Установите Vercel CLI
```bash
npm i -g vercel
```

**Шаг 2:** Деплой
```bash
vercel --prod
```

**Шаг 3:** Настройте Environment Variables в Vercel Dashboard
- `VITE_API_URL` = `https://your-backend.railway.app`
- `VITE_ADMIN_ID` = `your_telegram_user_id`

**Результат:** `https://your-app.vercel.app`

---

### Backend → Railway

**Шаг 1:** Создайте аккаунт на [Railway.app](https://railway.app)

**Шаг 2:** Создайте новый проект
- New Project → Deploy from GitHub repo
- Выберите ваш репозиторий

**Шаг 3:** Настройте проект
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

**Шаг 4:** Добавьте Environment Variables
```
PORT=5000
TELEGRAM_BOT_TOKEN=your_token
ADMIN_ID=your_telegram_id
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Шаг 5:** Deploy
Railway автоматически задеплоит при push в GitHub.

**Результат:** `https://your-app.railway.app`

---

### Обновление Telegram Bot

После деплоя обновите Web App URL:

1. Откройте @BotFather в Telegram
2. `/mybots` → Выберите вашего бота
3. Bot Settings → Menu Button → Configure menu button
4. Введите URL: `https://your-app.vercel.app`

---

## Вариант 2: Netlify + Render

### Frontend → Netlify

**Через UI:**
1. Зайдите на [Netlify](https://netlify.com)
2. New site from Git → Выберите репозиторий
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variables:
   - `VITE_API_URL`
   - `VITE_ADMIN_ID`

**Через CLI:**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

---

### Backend → Render

1. Зайдите на [Render](https://render.com)
2. New → Web Service
3. Connect repository
4. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Environment variables (как в Railway)

---

## Вариант 3: Monorepo на Railway

Если хотите деплоить весь проект на один сервис:

**Шаг 1:** Создайте `Procfile` в корне:
```
web: npm start
```

**Шаг 2:** Railway настройки:
- Root Directory: `/`
- Build Command: `npm run install:all && npm run build`
- Start Command: `npm start`

**Шаг 3:** Обновите `package.json` скрипт `start`:
```json
"start": "concurrently \"npm run preview\" \"npm run server\""
```

**Минусы:**
- ❌ Frontend не на CDN (медленнее загрузка)
- ❌ Нельзя масштабировать отдельно
- ❌ Больше потребление ресурсов

**Плюсы:**
- ✅ Проще настройка
- ✅ Один URL
- ✅ Нет CORS

---

## Настройка CI/CD

### GitHub Actions для автоматического деплоя

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}
```

---

## Проверка деплоя

### Frontend
```bash
curl https://your-app.vercel.app
```

Должен вернуть HTML страницу.

### Backend
```bash
curl https://your-backend.railway.app/api/health
```

Должен вернуть:
```json
{
  "status": "ok",
  "timestamp": "2026-01-29T12:00:00.000Z"
}
```

### Telegram Bot
```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo
```

---

## Мониторинг

### Railway
- Встроенные логи в реальном времени
- Метрики CPU/RAM
- Автоматический restart при падении

### Vercel
- Analytics встроен
- Edge Functions логи
- Performance metrics

### Дополнительно
Можно добавить:
- [Sentry](https://sentry.io) - отслеживание ошибок
- [LogRocket](https://logrocket.com) - session replay
- [Uptime Robot](https://uptimerobot.com) - мониторинг доступности

---

## Масштабирование

### Текущая архитектура → CRM

**Этап 1 (сейчас):**
```
Frontend (Vercel)     Backend (Railway)
     ↓                      ↓
  Mini App    ←→    API + Telegram Bot
                           ↓
                    Google Sheets
```

**Этап 2 (Desktop Admin):**
```
Frontend (Vercel)
  ├── /app (Mini App)
  └── /admin (Desktop)
           ↓
    Backend (Railway)
      ├── API
      ├── Telegram Bot
      └── Google Sheets
```

**Этап 3 (Full CRM):**
```
Frontend (Vercel)
  ├── /app (Mini App)
  ├── /admin (Desktop)
  └── /dashboard (Analytics)
           ↓
    Backend (Railway/VPS)
      ├── API Gateway
      ├── Auth Service
      ├── Orders Service
      ├── Notifications (Telegram)
      └── PostgreSQL + Redis
```

### Миграция с Google Sheets на PostgreSQL

Когда будете готовы:

1. **Добавьте PostgreSQL** на Railway (бесплатно)
2. **Создайте миграции** с помощью Prisma/TypeORM
3. **Перенесите данные** из Google Sheets
4. **Обновите `sheetsService.js`** на `dbService.js`

Код API останется тем же, только изменится источник данных.

---

## Troubleshooting

### Ошибка: "Cannot connect to backend"
- Проверьте `VITE_API_URL` в Vercel
- Убедитесь, что backend запущен
- Проверьте CORS настройки в `server/index.js`

### Ошибка: "Telegram bot not responding"
- Проверьте `TELEGRAM_BOT_TOKEN`
- Убедитесь, что бот не запущен локально (конфликт)
- Проверьте логи в Railway

### Ошибка: "Google Sheets authentication failed"
- Проверьте формат `GOOGLE_PRIVATE_KEY` (должны быть `\n`)
- Убедитесь, что Service Account добавлен в Sheet
- Проверьте, что Google Sheets API включен

### Frontend не обновляется
- Очистите кэш Vercel: Settings → Clear cache and redeploy
- Проверьте, что изменения закоммичены в Git

---

## Стоимость

### Бесплатные tier (достаточно для MVP)

**Vercel:**
- ✅ 100 GB bandwidth/месяц
- ✅ Unlimited deployments
- ✅ Automatic HTTPS

**Railway:**
- ✅ $5 бесплатно каждый месяц
- ✅ ~500 часов работы
- ✅ Достаточно для 1 backend сервиса

**Google Sheets API:**
- ✅ 60 запросов/минуту (бесплатно)
- ✅ Кэширование на 5 минут снижает нагрузку

### При росте (платные планы)

**Vercel Pro** ($20/месяц):
- 1 TB bandwidth
- Advanced analytics

**Railway** (pay-as-you-go):
- $0.000463/GB-hour RAM
- $0.000231/vCPU-hour

**PostgreSQL** (Railway):
- Включен в стоимость
- Или отдельно на Supabase (бесплатно до 500 MB)

---

## Checklist деплоя

- [ ] Frontend задеплоен на Vercel/Netlify
- [ ] Backend задеплоен на Railway/Render
- [ ] Environment variables настроены
- [ ] Google Sheets доступна для Service Account
- [ ] Telegram Bot обновлен с production URL
- [ ] `/api/health` возвращает 200 OK
- [ ] Frontend загружается в браузере
- [ ] Mini App открывается в Telegram
- [ ] Можно создать тестовый заказ
- [ ] Админ получает уведомление в Telegram
- [ ] Admin панель доступна для ADMIN_ID

---

## Полезные ссылки

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Netlify Docs](https://docs.netlify.com)
- [Render Docs](https://render.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Google Sheets API](https://developers.google.com/sheets/api)
