import express from 'express'
import { sheetsService } from '../services/sheetsService.js'

export const clientsRouter = express.Router()

// Получить всех клиентов
clientsRouter.get('/', async (req, res) => {
  try {
    console.log('📥 API: GET /api/clients')
    const clients = await sheetsService.getClients()
    console.log(`📤 API: Returning ${clients.length} clients`)
    res.json(clients)
  } catch (error) {
    console.error('❌ API: Error getting clients:', error)
    res.status(500).json({ error: 'Failed to get clients' })
  }
})

// Получить заказы клиента
clientsRouter.get('/:userId/orders', async (req, res) => {
  try {
    const { userId } = req.params
    console.log(`📥 API: GET /api/clients/${userId}/orders`)
    const orders = await sheetsService.getOrdersByUserId(userId)
    console.log(`📤 API: Returning ${orders.length} orders for user ${userId}`)
    res.json(orders)
  } catch (error) {
    console.error('❌ API: Error getting client orders:', error)
    res.status(500).json({ error: 'Failed to get client orders' })
  }
})

export default clientsRouter
