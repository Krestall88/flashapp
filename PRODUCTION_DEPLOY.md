# 🚀 Деплой в Production: Пошаговая инструкция

## 📋 Что будем делать

1. Создадим GitHub репозиторий
2. Задеплоим Backend на Railway
3. Задеплоим Frontend на Vercel
4. Настроим все переменные окружения
5. Обновим BotFather

---

## Шаг 1: Подготовка к деплою

### 1.1 Проверьте .gitignore

Убедитесь, что файл `.gitignore` содержит:
```
node_modules/
.env
server/.env
dist/
.vercel
.DS_Store
```

### 1.2 Создайте файл README.md (если нет)

Можете использовать существующий `README.md`.

---

## Шаг 2: Создание GitHub репозитория

### 2.1 Инициализируйте Git

```bash
# В папке проекта
cd c:\Users\Тайм\Documents\flashapp

# Инициализируйте Git (если еще не сделали)
git init

# Добавьте все файлы
git add .

# Сделайте первый коммит
git commit -m "Initial commit: Telegram Mini App"
```

### 2.2 Создайте репозиторий на GitHub

1. Откройте [github.com](https://github.com)
2. Нажмите **"New repository"** (зеленая кнопка)
3. Заполните:
   - **Repository name**: `telegram-detailing-app`
   - **Description**: `Telegram Mini App для детейлинга и аренды`
   - **Public** или **Private** (на ваш выбор)
   - **НЕ добавляйте** README, .gitignore, license (у вас уже есть)
4. Нажмите **"Create repository"**

### 2.3 Загрузите код на GitHub

GitHub покажет команды, выполните их:

```bash
# Добавьте remote
git remote add origin https://github.com/YOUR_USERNAME/telegram-detailing-app.git

# Переименуйте ветку в main (если нужно)
git branch -M main

# Загрузите код
git push -u origin main
```

**Готово!** Код теперь на GitHub.

---

## Шаг 3: Деплой Backend на Railway

### 3.1 Зарегистрируйтесь на Railway

1. Откройте [railway.app](https://railway.app)
2. Нажмите **"Login"**
3. Войдите через **GitHub**

### 3.2 Создайте новый проект

1. Нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Выберите репозиторий **`telegram-detailing-app`**
4. Railway начнет деплой

### 3.3 Настройте Root Directory

**ВАЖНО:** Backend находится в папке `server`, нужно указать это.

1. Откройте ваш проект на Railway
2. Нажмите на сервис (будет называться как репозиторий)
3. Перейдите в **Settings**
4. Найдите **"Root Directory"**
5. Введите: `server`
6. Нажмите **"Save"**

### 3.4 Настройте Start Command

1. В **Settings** найдите **"Start Command"**
2. Введите: `npm start`
3. Нажмите **"Save"**

### 3.5 Добавьте переменные окружения

1. Перейдите в **Variables**
2. Нажмите **"New Variable"**
3. Добавьте следующие переменные:

```
PORT=5000
TELEGRAM_BOT_TOKEN=7741841139:AAFEXYsVbzpcEioW0p9ai0qURcynT3Ub0bI
ADMIN_ID=323976163
WEB_APP_URL=https://flashapp.vercel.app
GOOGLE_SHEET_ID=19cLDSm-zbuZho-ZKovJcUN_xGBoMnZRxbCyu7aUNaKM
GOOGLE_SERVICE_ACCOUNT_EMAIL=telegram-detailing-bot@telegram-detailing.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLfWtic0Q7DyzZ\nhGBEiQO7+U2WRKtvYlD4Ws5nyCoGI2Zqhi/xVZBhNNB9AI5Fku6Uc3rjBv9mEHtE\nP2Q04ffhvAF0Di6/da0Jor6vth/3fxlA8BAFd+akSyYqTlhrTrVSykeqTiewvCAS\nYAoor8u56DiP7470odxfx+xx9V1Z2wt1ZpuG0hC5vREVe1Qb9Dvd9sxM+AQ8O1sS\n6ZSFASl2UVP8aVmvD0fhWnBpyS1KNb63d1Qy6d23ujtzOa19z4UFlxSjJQQ869yc\nbmtKlVxJvqo15LLg2GmSk3v9s9IT5RlDP8DfVq4nPggutGwiC8xb8MfWi9mduwBp\nKCVWamcvAgMBAAECggEAHqefaJPmbffnG5eabF4FtCjQ5uJ5FGJdF0+QCPNkXUtc\n747qebKYTwSGpKYo81M4t3VpcvpdZEdMV+eC1Yf1xfRYIF8jQhAyB/cT6eLdEEr9\n3MStbTLMXz4Q8E5Kz1OVSPUUdGlUslu3gH0mWqMXukMWWPH6TmEfPUX1bo92R4Wi\n1RaJouvI7/xWCYxx7O38AiTtXWTFhKRXsQ39mX7Rub2EEZTzwD99MSPYdXGBJSjl\nEZipYR81qcByfOn3P1w80AmDnPyly+bg6RxFQfNqaN+LyGXbsLY+44x6ThYgy3+C\nhUtwEhSU6DyTVHjz+Xq2GaPQkKN1X9f0qSfDzQ/vkQKBgQDm7Fx15hZtIhhqbLmA\nrvA7VasH+xt+hb7XvF9L3x0oqJcx7Ffr4RvjGYT40jF20rKftmFgT7Fon9UICAhU\nR8YoXU8n3VWUOxR0gtpxPDY2KGntArPaT8IcK7xNKfG1fdXzROZLAFCl8ZiCrq5z\nV+GQR8HcBgNLZgzm5ADOCPfhEQKBgQDhlmoDFhEsBNxcR0ZU89S886w1Pn4gnFcA\nV/qXEqewbJi+rQUvjy1h/WQI8mC/gOBI+eApfW5YT/T1vWMNNhE0nV1daVVxl4m1\nbmt17gLdQph/gYQ+C5gFm4vUn+VsIqWKWMJGuMgp/fi3H8GTKyIQk7DPlSdZU3JT\nw5t9d4nEPwKBgQCldKNHAmX9KdnOnzpGvpF4IgiafkwT2maEEv9A0IsG78ztQ0c3\nxiICFO3WjlxMo+jCUJ3ysQcPTL4JtB+rq4WKtFib2pWP0Mj2Ni+nxJmfMlO7Mx2E\nhXMyVg/kRfJetNvQIwTSplYioDlDIT/zevsuMovvRwujQWprIOCGv5xD0QKBgC6+\niEETdYN1jmPgsQYxcEenBmwSAvim7LA5isd7Khw4pH3+RDDSrki7xNrFvp5wCgmV\nHYn7X74U82FoWPoH1hDc+te8V+Qtzm817jaFlzpZ7ledctWYeWvQC22HpHZ/x2Wf\ndsJIz9FDuyHXBrmEGo7sy5p4AatUyz/oLHQXLQjpAoGBAJm+7VdarwJ337qcUivC\n8usFsp9aPEaElpbEXjYRU7NhVKn/K/zJSIgSXcMC7CIQlPy+WJzKtPx0ZUl2hN4K\nt/2imL1pTiYYcUYicmL5lCfuWFfHoIPEP03peW/nSW3IP1mjXAYLFO8LM6FlbBdp\njrkHdmscfMgyaaBceR7NBpIF\n-----END PRIVATE KEY-----\n"
```

**ВАЖНО для `GOOGLE_PRIVATE_KEY`:**
- Должен быть в кавычках
- Переносы строк как `\n`
- Скопируйте весь ключ целиком

**ВАЖНО для `WEB_APP_URL`:**
- Пока укажите `https://flashapp.vercel.app`
- После деплоя на Vercel обновим на реальный URL

### 3.6 Дождитесь деплоя

Railway автоматически задеплоит backend. Смотрите логи в разделе **"Deployments"**.

### 3.7 Получите URL backend

1. В проекте Railway найдите **"Settings"**
2. Найдите **"Domains"**
3. Нажмите **"Generate Domain"**
4. Скопируйте URL (будет вида `https://your-app.up.railway.app`)

**Сохраните этот URL!** Он понадобится для Vercel.

---

## Шаг 4: Деплой Frontend на Vercel

### 4.1 Зарегистрируйтесь на Vercel

1. Откройте [vercel.com](https://vercel.com)
2. Нажмите **"Sign Up"**
3. Войдите через **GitHub**

### 4.2 Создайте новый проект

1. Нажмите **"Add New..."** → **"Project"**
2. Выберите репозиторий **`telegram-detailing-app`**
3. Нажмите **"Import"**

### 4.3 Настройте проект

**Framework Preset:**
- Vercel автоматически определит **Vite**

**Root Directory:**
- Оставьте пустым (`.` - корень проекта)

**Build Command:**
- `npm run build` (должно быть по умолчанию)

**Output Directory:**
- `dist` (должно быть по умолчанию)

**Install Command:**
- `npm install` (должно быть по умолчанию)

### 4.4 Добавьте Environment Variables

**ВАЖНО:** Нажмите **"Environment Variables"** перед деплоем.

Добавьте следующие переменные:

```
VITE_API_URL=https://your-app.up.railway.app
VITE_ADMIN_ID=323976163
```

**Замените `https://your-app.up.railway.app` на реальный URL из Railway (Шаг 3.7)!**

### 4.5 Деплой

1. Нажмите **"Deploy"**
2. Дождитесь завершения (1-2 минуты)
3. Vercel покажет **"Congratulations!"**

### 4.6 Получите URL frontend

Vercel покажет URL вашего приложения:
```
https://telegram-detailing-app.vercel.app
```

Или можете настроить свой домен.

**Сохраните этот URL!**

---

## Шаг 5: Обновите WEB_APP_URL на Railway

Теперь у вас есть реальный URL frontend от Vercel.

1. Откройте проект на Railway
2. Перейдите в **Variables**
3. Найдите **`WEB_APP_URL`**
4. Измените на: `https://telegram-detailing-app.vercel.app`
5. Сохраните

Railway автоматически перезапустит backend.

---

## Шаг 6: Обновите BotFather

### 6.1 Настройте Main App

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте: `/mybots`
3. Выберите **@detailingservice_bot**
4. **Bot Settings** → **Main App**
5. **Enter URL**
6. Вставьте: `https://telegram-detailing-app.vercel.app`
7. **Launch Mode**: Compact
8. Сохраните

### 6.2 Отключите Menu Button (опционально)

Если Menu Button показывает старый URL:

1. **Bot Settings** → **Menu Button**
2. **Disable Menu Button**

---

## Шаг 7: Проверка работы

### 7.1 Откройте Mini App в Telegram

1. Найдите бота **@detailingservice_bot**
2. Отправьте `/start`
3. Нажмите кнопку **"🚀 Открыть приложение"**
4. Должен открыться ваш UI (не белый экран!)

### 7.2 Создайте тестовый заказ

1. Выберите услугу
2. Заполните форму
3. Отправьте заявку
4. Должен появиться экран успеха
5. Админу должно прийти уведомление

### 7.3 Проверьте админку

1. Нажмите **"📊 Открыть админку"** в уведомлении
2. Должна открыться админка
3. Увидите новый заказ

### 7.4 Проверьте "Мои заказы"

1. Перейдите на вкладку **"Заказы"**
2. Увидите свой заказ со статусом

---

## 📋 Checklist

- [ ] GitHub репозиторий создан
- [ ] Код загружен на GitHub
- [ ] Backend задеплоен на Railway
- [ ] Root Directory: `server`
- [ ] Start Command: `npm start`
- [ ] Все переменные окружения добавлены на Railway
- [ ] URL backend получен
- [ ] Frontend задеплоен на Vercel
- [ ] Environment Variables добавлены на Vercel
- [ ] `VITE_API_URL` указывает на Railway URL
- [ ] URL frontend получен
- [ ] `WEB_APP_URL` обновлен на Railway
- [ ] Main App настроен в BotFather
- [ ] Mini App открывается в Telegram
- [ ] Можно создать заказ
- [ ] Уведомления приходят админу
- [ ] Админка работает
- [ ] "Мои заказы" показывает заказы

---

## 🎯 Итоговые URL

**Frontend (Vercel):**
```
https://telegram-detailing-app.vercel.app
```

**Backend (Railway):**
```
https://your-app.up.railway.app
```

**Google Sheets:**
```
https://docs.google.com/spreadsheets/d/19cLDSm-zbuZho-ZKovJcUN_xGBoMnZRxbCyu7aUNaKM/edit
```

**Telegram Bot:**
```
https://t.me/detailingservice_bot
```

---

## 🔧 Если что-то не работает

### Backend не запускается на Railway

**Проверьте логи:**
1. Railway → Deployments → Latest Deployment → Logs
2. Ищите ошибки

**Частые проблемы:**
- Неправильный Root Directory (должен быть `server`)
- Отсутствуют переменные окружения
- Неправильный `GOOGLE_PRIVATE_KEY` (должен быть в кавычках)

### Frontend показывает ошибки

**Проверьте:**
1. `VITE_API_URL` правильный (URL Railway)
2. Backend работает (откройте `https://your-app.up.railway.app` в браузере)
3. CORS настроен в `server/index.js`

### Уведомления не приходят

**Проверьте:**
1. `WEB_APP_URL` правильный (URL Vercel)
2. `TELEGRAM_BOT_TOKEN` правильный
3. `ADMIN_ID` правильный
4. Отправили `/start` боту

---

## 🚀 Готово!

Теперь ваше приложение работает в production:
- ✅ Frontend на Vercel (быстро, CDN)
- ✅ Backend на Railway (надежно)
- ✅ Google Sheets как БД
- ✅ Telegram Bot работает
- ✅ Уведомления приходят
- ✅ Админка доступна

Можете пользоваться! 🎉

---

## 📝 Обновление кода

Когда захотите обновить код:

```bash
# Внесите изменения в код
# Закоммитьте
git add .
git commit -m "Update: описание изменений"

# Загрузите на GitHub
git push

# Vercel и Railway автоматически задеплоят новую версию!
```

Автоматический деплой настроен! 🚀
