import { Telegraf } from 'telegraf'
import { sheetsService } from '../services/sheetsService.js'

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN)

bot.start((ctx) => {
  const webAppUrl = process.env.WEB_APP_URL || process.env.VITE_WEB_APP_URL || 'http://localhost:3000'
  
  ctx.reply('Добро пожаловать в бот детейлинга и аренды! 🚗', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Открыть приложение',
            web_app: { url: webAppUrl }
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
    
    const webAppUrl = process.env.WEB_APP_URL || process.env.VITE_WEB_APP_URL || 'http://localhost:3000'
    
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
            web_app: { url: `${webAppUrl}?tgWebAppStartParam=admin` }
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

export { bot }
