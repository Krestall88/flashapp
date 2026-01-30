import express from 'express'
import { sheetsService } from '../services/sheetsService.js'

export const ordersRouter = (bot) => {
  const router = express.Router()

  router.post('/', async (req, res) => {
    try {
      const orderData = req.body
      const order = await sheetsService.createOrder(orderData)

      const adminId = process.env.ADMIN_ID
      if (adminId && bot) {
        const userLink = order.userId ? `tg://user?id=${order.userId}` : 'не указан'
        const userDisplay = order.userId ? `[Открыть профиль](${userLink})` : 'не указан'
        const message = `
🆕 Новый заказ #${order.id}

👤 Клиент: ${order.userName || 'Не указано'}
📱 Telegram: ${userDisplay}
📞 Телефон: ${order.phone || 'Не указан'}
🚗 Услуга: ${order.service}
🏎️ Класс: ${order.carClass}
📅 Дата: ${order.date}
⏰ Время: ${order.time}

👉 Открыть админку для управления заказом
        `.trim()

        const webAppUrl = process.env.WEB_APP_URL || 'https://your-app.vercel.app'
        const adminUrl = `${webAppUrl}?tgWebAppStartParam=admin`

        try {
          await bot.telegram.sendMessage(adminId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '📊 Открыть админку',
                    web_app: { url: adminUrl }
                  }
                ],
                [
                  {
                    text: '✅ Принять заказ',
                    callback_data: `accept_${order.id}`
                  },
                  {
                    text: '❌ Отклонить',
                    callback_data: `reject_${order.id}`
                  }
                ]
              ]
            }
          })
        } catch (error) {
          console.error('Failed to send notification to admin:', error)
        }
      }

      res.status(201).json(order)
    } catch (error) {
      console.error('Error creating order:', error)
      res.status(500).json({ error: 'Failed to create order' })
    }
  })

  router.get('/', async (req, res) => {
    try {
      const orders = await sheetsService.getOrders()
      res.json(orders)
    } catch (error) {
      console.error('Error getting orders:', error)
      res.status(500).json({ error: 'Failed to get orders' })
    }
  })

  router.patch('/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params
      const { status } = req.body

      const result = await sheetsService.updateOrderStatus(orderId, status)

      const adminId = process.env.ADMIN_ID
      if (adminId && bot) {
        const statusEmoji = {
          new: '🆕',
          in_progress: '⏳',
          completed: '✅'
        }
        const statusText = {
          new: 'Новый',
          in_progress: 'В работе',
          completed: 'Завершен'
        }
        const message = `${statusEmoji[status] || '📝'} Заказ #${orderId}\nСтатус изменен на: ${statusText[status] || status}`
        
        const webAppUrl = process.env.WEB_APP_URL || 'https://your-app.vercel.app'
        const adminUrl = `${webAppUrl}?tgWebAppStartParam=admin`
        
        try {
          await bot.telegram.sendMessage(adminId, message, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '📊 Открыть админку',
                    web_app: { url: adminUrl }
                  }
                ]
              ]
            }
          })
        } catch (error) {
          console.error('Failed to send status update to admin:', error)
        }
      }

      res.json(result)
    } catch (error) {
      console.error('Error updating order status:', error)
      res.status(500).json({ error: 'Failed to update order status' })
    }
  })

  return router
}
