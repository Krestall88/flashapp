# 🔧 Решение проблем

## Проблема: Backend не запускается (ERR_MODULE_NOT_FOUND)

### Ошибка
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'google-auth-library'
```

### Решение
```bash
cd server
npm install
```

Пакет `google-auth-library` был добавлен в `server/package.json`.

---

## Проблема: Белый экран в Telegram Mini App

### Причины
1. **Неправильный URL в BotFather**
2. **CORS ошибки**
3. **Неправильный `VITE_API_URL`**

### Решение

#### 1. Проверьте настройки в BotFather

**Menu Button должен указывать на production URL:**
```
https://flashapp.vercel.app
```

**НЕ на ngrok:**
```
❌ https://emotionalistic-september-undefaulted.ngrok-free.dev
```

#### 2. Настройте `.env` для production

**Локально (`.env`):**
```env
VITE_API_URL=http://localhost:5000
VITE_ADMIN_ID=323976163
```

**На Vercel (Environment Variables):**
```env
VITE_API_URL=https://your-backend-url.railway.app
VITE_ADMIN_ID=323976163
```

#### 3. Проверьте CORS на backend

В `server/index.js` должно быть:
```javascript
app.use(cors({
  origin: ['https://flashapp.vercel.app', 'http://localhost:3000'],
  credentials: true
}))
```

---

## Проблема: Заявка не отправляется

### Симптомы
- Нажимаете "Отправить заявку"
- Ничего не происходит
- Нет ошибок в консоли

### Диагностика

**1. Откройте консоль браузера (F12)**
```
Проверьте вкладку Console на ошибки
Проверьте вкладку Network на запросы
```

**2. Проверьте, что backend запущен**
```bash
# Должно быть:
[SERVER] 🚀 Server running on port 5000
[SERVER] ✅ Telegram bot started
[SERVER] 📊 Google Sheets connected: ...
```

**3. Проверьте URL API**
```javascript
// В консоли браузера:
console.log(import.meta.env.VITE_API_URL)
// Должно быть: http://localhost:5000 (локально)
```

### Решение

#### Локальная разработка

**1. Запустите оба сервера:**
```bash
npm run dev
```

**2. Проверьте `.env`:**
```env
VITE_API_URL=http://localhost:5000
```

**3. Откройте в браузере:**
```
http://localhost:3000
```

**4. Для тестирования в Telegram используйте ngrok:**
```bash
ngrok http 3000
```

Затем в BotFather укажите ngrok URL.

#### Production

**1. Деплой backend на Railway:**
- Создайте проект
- Подключите GitHub repo
- Root Directory: `server`
- Start Command: `npm start`
- Добавьте все переменные из `server/.env`

**2. Получите URL backend:**
```
https://your-app.up.railway.app
```

**3. Обновите Environment Variables на Vercel:**
```env
VITE_API_URL=https://your-app.up.railway.app
```

**4. Обновите Menu Button в BotFather:**
```
https://flashapp.vercel.app
```

**5. Пересоберите frontend на Vercel:**
```bash
# Vercel автоматически пересоберет при push в GitHub
git add .
git commit -m "Update API URL"
git push
```

---

## Проблема: ngrok показывает 403 Forbidden

### Причина
Telegram блокирует некоторые ngrok домены из-за антиспам политики.

### Решение

**Вариант 1: Используйте другой регион ngrok**
```bash
ngrok http 3000 --region us
```

**Вариант 2: Используйте ngrok с авторизацией**
```bash
ngrok config add-authtoken YOUR_TOKEN
ngrok http 3000
```

**Вариант 3: Используйте локальный тоннель**
```bash
npm install -g localtunnel
lt --port 3000
```

**Вариант 4: Сразу деплойте на Vercel**
```bash
vercel --prod
```

---

## Проблема: Google Sheets не подключается

### Ошибка
```
Failed to initialize Google Sheets: ...
```

### Решение

**1. Проверьте Service Account Email:**
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=telegram-detailing-bot@telegram-detailing.iam.gserviceaccount.com
```

**2. Проверьте Private Key (должен быть в кавычках):**
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0...\n-----END PRIVATE KEY-----\n"
```

**3. Проверьте права доступа к таблице:**
- Откройте Google Sheet
- Нажмите "Share"
- Добавьте `telegram-detailing-bot@telegram-detailing.iam.gserviceaccount.com`
- Права: Editor

**4. Проверьте Sheet ID:**
```env
GOOGLE_SHEET_ID=19cLDSm-zbuZho-ZKovJcUN_xGBoMnZRxbCyu7aUNaKM
```

Из URL:
```
https://docs.google.com/spreadsheets/d/19cLDSm-zbuZho-ZKovJcUN_xGBoMnZRxbCyu7aUNaKM/edit
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

---

## Проблема: Админка не появляется

### Причина
`ADMIN_ID` не совпадает с вашим Telegram ID.

### Решение

**1. Получите свой Telegram ID:**
- Найдите [@userinfobot](https://t.me/userinfobot)
- Отправьте `/start`
- Скопируйте User ID

**2. Обновите оба `.env` файла:**

**Frontend (`.env`):**
```env
VITE_ADMIN_ID=323976163
```

**Backend (`server/.env`):**
```env
ADMIN_ID=323976163
```

**3. Пересоберите приложение:**
```bash
npm run build
```

---

## Проблема: Уведомления не приходят

### Причина
Бот не запущен или не начат диалог.

### Решение

**1. Найдите вашего бота в Telegram**

**2. Отправьте команду:**
```
/start
```

**3. Проверьте логи backend:**
```
[SERVER] ✅ Telegram bot started
```

**4. Проверьте `TELEGRAM_BOT_TOKEN`:**
```env
TELEGRAM_BOT_TOKEN=7741841139:AAFEXYsVbzpcEioW0p9ai0qURcynT3Ub0bI
```

**5. Проверьте `ADMIN_ID`:**
```env
ADMIN_ID=323976163
```

---

## Checklist для запуска

### Локальная разработка

- [ ] Установлены зависимости: `npm run install:all`
- [ ] Созданы `.env` файлы (frontend и backend)
- [ ] Google Sheets настроен и расшарен
- [ ] Telegram Bot создан через @BotFather
- [ ] Backend запускается без ошибок
- [ ] Frontend открывается на `http://localhost:3000`
- [ ] Можно создать тестовый заказ
- [ ] Уведомление приходит админу

### Production

- [ ] Backend задеплоен на Railway
- [ ] Frontend задеплоен на Vercel
- [ ] Environment Variables настроены на обоих
- [ ] `VITE_API_URL` указывает на Railway URL
- [ ] `WEB_APP_URL` указывает на Vercel URL
- [ ] Menu Button в BotFather указывает на Vercel URL
- [ ] CORS настроен для Vercel домена
- [ ] Бот запущен (команда `/start`)
- [ ] Можно создать заказ через Mini App
- [ ] Уведомление приходит с кнопками

---

## Полезные команды

### Проверка логов

**Backend:**
```bash
cd server
npm run dev
# Смотрите на вывод в терминале
```

**Frontend:**
```bash
npm run dev:client
# Откройте http://localhost:3000
# Нажмите F12 -> Console
```

### Очистка кэша

**Backend:**
```bash
cd server
rm -rf node_modules
npm install
```

**Frontend:**
```bash
rm -rf node_modules
npm install
```

### Пересборка

```bash
npm run build
npm run preview
```

### Проверка переменных окружения

**В терминале:**
```bash
# Windows
echo %VITE_API_URL%

# Linux/Mac
echo $VITE_API_URL
```

**В коде (консоль браузера):**
```javascript
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.VITE_ADMIN_ID)
```

---

## Контакты для помощи

Если проблема не решается:

1. Проверьте логи в терминале
2. Проверьте консоль браузера (F12)
3. Убедитесь, что все переменные окружения настроены
4. Проверьте права доступа к Google Sheets
5. Убедитесь, что бот запущен (команда `/start`)

Все должно работать! 🚀
