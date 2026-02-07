import { sheetsService } from './services/sheetsService.js'
import { bot } from './bot/webhook.js'

// Initialize sheets service once
let initialized = false
async function ensureInitialized() {
  if (!initialized) {
    await sheetsService.initialize()
    initialized = true
  }
}

export default async function handler(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`)
  const method = req.method

  try {
    await ensureInitialized()

    // Bot webhook (Telegram sends updates here)
    if (pathname === '/api' && method === 'POST') {
      try {
        await bot.handleUpdate(req.body, res)
        return
      } catch (error) {
        console.error('Bot webhook error:', error)
        return res.status(200).json({ ok: true })
      }
    }

    // Health check
    if (pathname === '/api/health' || (pathname === '/api' && method === 'GET')) {
      return res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: 'vercel' })
    }

    // Orders
    if (pathname === '/api/orders') {
      if (method === 'GET') {
        const orders = await sheetsService.getOrders()
        return res.json(orders)
      }
      if (method === 'POST') {
        const orderData = req.body
        if (!orderData || !orderData.date || !orderData.time) {
          return res.status(400).json({ error: 'date and time are required' })
        }
        const order = await sheetsService.createOrder(orderData)

        // Send notification to admin
        const adminId = process.env.ADMIN_ID || process.env.VITE_ADMIN_ID
        if (adminId && bot) {
          const userLink = order.userId ? `tg://user?id=${order.userId}` : 'не указан'
          const userDisplay = order.userId ? `[Открыть профиль](${userLink})` : 'не указан'
          const priceText = order.price > 0 ? `\n💰 Цена: ${order.price.toLocaleString()} ₽` : ''
          const carClassText = order.carClass ? `\n🚗 Класс авто: ${order.carClass}` : ''
          const message = `
🆕 Новый заказ #${order.id}

👤 Клиент: ${order.userName || 'Не указано'}
📱 Telegram: ${userDisplay}
📞 Телефон: ${order.phone || 'Не указан'}
🧼 Услуга: ${order.service}${carClassText}
📅 Дата: ${order.date}
⏰ Время: ${order.time}${priceText}

👉 Открыть админку для управления заказом
          `.trim()

          const webAppUrl = process.env.WEB_APP_URL || process.env.VITE_WEB_APP_URL || 'http://localhost:3000'
          const adminUrl = `${webAppUrl}?tgWebAppStartParam=admin`

          try {
            await bot.telegram.sendMessage(adminId, message, {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📊 Открыть админку', web_app: { url: adminUrl } }],
                  [
                    { text: '✅ Принять заказ', callback_data: `accept_${order.id}` },
                    { text: '❌ Отклонить', callback_data: `reject_${order.id}` }
                  ]
                ]
              }
            })
          } catch (error) {
            console.error('Failed to send notification to admin:', error)
          }
        }
        return res.status(201).json(order)
      }
    }

    // Order by ID
    const orderMatch = pathname.match(/^\/api\/orders\/([^\/]+)$/)
    if (orderMatch) {
      const orderId = orderMatch[1]
      if (method === 'PATCH') {
        const result = await sheetsService.updateOrder(orderId, req.body)
        return res.json(result)
      }
      if (method === 'DELETE') {
        const result = await sheetsService.deleteOrder(orderId)
        return res.json(result)
      }
    }

    // Order status
    const statusMatch = pathname.match(/^\/api\/orders\/([^\/]+)\/status$/)
    if (statusMatch && method === 'PATCH') {
      const orderId = statusMatch[1]
      const { status } = req.body
      const result = await sheetsService.updateOrderStatus(orderId, status)
      
      const orders = await sheetsService.getOrders()
      const order = orders.find(o => o.id === orderId)
      
      if (order && order.userId) {
        const statusText = { 'new': 'принят', 'in_progress': 'в работе', 'completed': 'завершен' }[status]
        const webAppUrl = process.env.WEB_APP_URL || process.env.VITE_WEB_APP_URL || 'http://localhost:3000'

        try {
          await bot.telegram.sendMessage(
            order.userId,
            `🔔 Статус вашего заказа изменен\n\nУслуга: ${order.service}\nСтатус: ${statusText}\nДата: ${order.date}\nВремя: ${order.time}`,
            {
              reply_markup: {
                inline_keyboard: [[
                  { text: '📱 Открыть приложение', web_app: { url: `${webAppUrl}?startapp=orders` } }
                ]]
              }
            }
          )
        } catch (error) {
          console.error('Failed to send notification to client:', error)
        }
      }
      return res.json(result)
    }

    // Services
    if (pathname === '/api/services') {
      if (method === 'GET') {
        const includeInactive = req.query?.includeInactive === 'true'
        const services = await sheetsService.getServices({ includeInactive })
        return res.json(services)
      }
      if (method === 'POST') {
        const serviceData = req.body
        if (!serviceData.name || !serviceData.category) {
          return res.status(400).json({ error: 'Name and category are required' })
        }
        const service = await sheetsService.createOrUpdateService(serviceData)
        return res.status(serviceData.id ? 200 : 201).json(service)
      }
    }

    // Service by ID
    const serviceMatch = pathname.match(/^\/api\/services\/([^\/]+)$/)
    if (serviceMatch && method === 'DELETE') {
      const serviceId = serviceMatch[1]
      const result = await sheetsService.deleteService(serviceId)
      return res.json(result)
    }

    // Clients
    if (pathname === '/api/clients' && method === 'GET') {
      const clients = await sheetsService.getClients()
      return res.json(clients)
    }

    // Client orders
    const clientOrdersMatch = pathname.match(/^\/api\/clients\/([^\/]+)\/orders$/)
    if (clientOrdersMatch && method === 'GET') {
      const userId = clientOrdersMatch[1]
      const orders = await sheetsService.getOrdersByUserId(userId)
      return res.json(orders)
    }

    // Settings
    if (pathname === '/api/settings') {
      if (method === 'GET') {
        const settings = await sheetsService.getSettings()
        return res.json(settings)
      }
      if (method === 'PUT') {
        const result = await sheetsService.updateSettings(req.body)
        return res.json(result)
      }
    }

    // Admins
    if (pathname === '/api/admins') {
      if (method === 'GET') {
        const admins = await sheetsService.getAdmins()
        return res.json(admins)
      }
      if (method === 'POST') {
        const { userId, name } = req.body
        if (!userId) {
          return res.status(400).json({ error: 'userId is required' })
        }
        const admin = await sheetsService.addAdmin(userId, name)
        return res.status(201).json(admin)
      }
    }

    // Admin by ID
    const adminMatch = pathname.match(/^\/api\/admins\/([^\/]+)$/)
    if (adminMatch && method === 'DELETE') {
      const userId = adminMatch[1]
      const result = await sheetsService.removeAdmin(userId)
      return res.json(result)
    }

    // Gallery
    if (pathname === '/api/gallery') {
      if (method === 'GET') {
        const { serviceId } = req.query
        const gallery = await sheetsService.getGallery(serviceId)
        return res.json(gallery)
      }
      if (method === 'POST') {
        const { serviceId, imageUrl, description, order } = req.body
        if (!serviceId || !imageUrl) {
          return res.status(400).json({ error: 'serviceId and imageUrl are required' })
        }
        const image = await sheetsService.addGalleryImage(serviceId, imageUrl, description, order)
        return res.status(201).json(image)
      }
    }

    // Gallery by ID
    const galleryMatch = pathname.match(/^\/api\/gallery\/([^\/]+)$/)
    if (galleryMatch && method === 'DELETE') {
      const imageId = galleryMatch[1]
      const result = await sheetsService.removeGalleryImage(imageId)
      return res.json(result)
    }

    // Not found
    return res.status(404).json({ error: 'Not found' })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error', message: error.message })
  }
}
