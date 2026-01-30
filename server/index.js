import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import { sheetsService } from './services/sheetsService.js'
import { ordersRouter } from './routes/orders.js'
import { servicesRouter } from './routes/services.js'
import { adminsRouter } from './routes/admins.js'
import { galleryRouter } from './routes/gallery.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: [
    'https://flashapp.vercel.app',
    'https://telegram-detailing-app.vercel.app',
    'http://localhost:3000',
    /\.ngrok-free\.dev$/,
    /\.vercel\.app$/
  ],
  credentials: true
}))
app.use(express.json())

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

bot.start((ctx) => {
  const webAppUrl = process.env.WEB_APP_URL || 'https://your-app.vercel.app'
  const adminUrl = `${webAppUrl}?tgWebAppStartParam=admin`
  ctx.reply('Добро пожаловать в бот детейлинга и аренды! 🚗', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Открыть приложение',
            web_app: { url: webAppUrl }
          }
        ],
        [
          {
            text: '📊 Админка',
            web_app: { url: adminUrl }
          }
        ]
      ]
    }
  })
})

bot.action(/accept_(.+)/, async (ctx) => {
  const orderId = ctx.match[1]
  try {
    await sheetsService.updateOrderStatus(orderId, 'in_progress')
    await ctx.answerCbQuery('✅ Заказ принят в работу')
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [
          {
            text: '✅ Заказ принят',
            callback_data: 'accepted'
          }
        ],
        [
          {
            text: '📊 Открыть админку',
            web_app: { url: `${process.env.WEB_APP_URL || 'https://your-app.vercel.app'}?tgWebAppStartParam=admin` }
          }
        ]
      ]
    })
  } catch (error) {
    await ctx.answerCbQuery('❌ Ошибка при обновлении заказа')
  }
})

bot.action(/reject_(.+)/, async (ctx) => {
  const orderId = ctx.match[1]
  await ctx.answerCbQuery('❌ Заказ отклонен')
  await ctx.editMessageReplyMarkup({
    inline_keyboard: [
      [
        {
          text: '❌ Заказ отклонен',
          callback_data: 'rejected'
        }
      ]
    ]
  })
})

bot.launch().then(() => {
  console.log('✅ Telegram bot started')
}).catch((err) => {
  console.error('❌ Failed to start bot:', err)
})

app.use('/api/orders', ordersRouter(bot))
app.use('/api/services', servicesRouter)
app.use('/api/admins', adminsRouter)
app.use('/api/gallery', galleryRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  sheetsService.initialize().then(() => {
    console.log('✅ Google Sheets initialized')
  }).catch((err) => {
    console.error('❌ Failed to initialize Google Sheets:', err)
  })
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
