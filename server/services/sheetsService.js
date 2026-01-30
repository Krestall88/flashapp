import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import NodeCache from 'node-cache'
import dotenv from 'dotenv'

dotenv.config()

const cache = new NodeCache({ stdTTL: 300 })

class SheetsService {
  constructor() {
    this.doc = null
    this.servicesSheet = null
    this.ordersSheet = null
    this.settingsSheet = null
    this.adminsSheet = null
  }

  async initialize() {
    try {
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })

      this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth)
      await this.doc.loadInfo()

      this.servicesSheet = this.doc.sheetsByTitle['services'] || await this.doc.addSheet({ 
        title: 'services',
        headerValues: ['id', 'name', 'description', 'price', 'category', 'image', 'active']
      })

      this.ordersSheet = this.doc.sheetsByTitle['orders'] || await this.doc.addSheet({ 
        title: 'orders',
        headerValues: ['id', 'userId', 'userName', 'service', 'carClass', 'date', 'time', 'phone', 'status', 'createdAt']
      })

      this.settingsSheet = this.doc.sheetsByTitle['settings'] || await this.doc.addSheet({ 
        title: 'settings',
        headerValues: ['key', 'value']
      })

      this.adminsSheet = this.doc.sheetsByTitle['admins'] || await this.doc.addSheet({ 
        title: 'admins',
        headerValues: ['userId', 'name', 'addedAt']
      })

      console.log('📊 Google Sheets connected:', this.doc.title)
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error)
      throw error
    }
  }

  async getServices() {
    const cacheKey = 'services'
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      await this.servicesSheet.loadCells()
      const rows = await this.servicesSheet.getRows()
      
      const services = rows
        .filter(row => row.get('active') === 'true')
        .map(row => ({
          id: row.get('id'),
          name: row.get('name'),
          description: row.get('description'),
          price: parseFloat(row.get('price')),
          category: row.get('category'),
          image: row.get('image'),
        }))

      cache.set(cacheKey, services)
      return services
    } catch (error) {
      console.error('Failed to get services:', error)
      return []
    }
  }

  async createOrder(orderData) {
    try {
      const orderId = `ORD-${Date.now()}`
      const order = {
        id: orderId,
        userId: orderData.userId || '',
        userName: orderData.userName,
        service: orderData.service,
        carClass: orderData.carClass,
        date: orderData.date,
        time: orderData.time,
        phone: orderData.phone,
        status: 'new',
        createdAt: new Date().toISOString(),
      }

      await this.ordersSheet.addRow(order)
      
      cache.del('orders')
      
      return order
    } catch (error) {
      console.error('Failed to create order:', error)
      throw error
    }
  }

  async getOrders() {
    const cacheKey = 'orders'
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const rows = await this.ordersSheet.getRows()
      
      const orders = rows.map(row => ({
        id: row.get('id'),
        userId: row.get('userId'),
        userName: row.get('userName'),
        service: row.get('service'),
        carClass: row.get('carClass'),
        date: row.get('date'),
        time: row.get('time'),
        phone: row.get('phone'),
        status: row.get('status'),
        createdAt: row.get('createdAt'),
      }))

      cache.set(cacheKey, orders)
      return orders
    } catch (error) {
      console.error('Failed to get orders:', error)
      return []
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const rows = await this.ordersSheet.getRows()
      const orderRow = rows.find(row => row.get('id') === orderId)
      
      if (!orderRow) {
        throw new Error('Order not found')
      }

      orderRow.set('status', newStatus)
      await orderRow.save()
      
      cache.del('orders')
      
      return { id: orderId, status: newStatus }
    } catch (error) {
      console.error('Failed to update order status:', error)
      throw error
    }
  }

  async getAdmins() {
    const cacheKey = 'admins'
    const cached = cache.get(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const rows = await this.adminsSheet.getRows()
      const admins = rows.map(row => ({
        userId: row.get('userId'),
        name: row.get('name') || '',
        addedAt: row.get('addedAt') || ''
      }))
      
      cache.set(cacheKey, admins)
      return admins
    } catch (error) {
      console.error('Failed to get admins:', error)
      return []
    }
  }

  async addAdmin(userId, name = '') {
    try {
      await this.adminsSheet.addRow({
        userId: userId.toString(),
        name,
        addedAt: new Date().toISOString()
      })
      
      cache.del('admins')
      return { userId, name, addedAt: new Date().toISOString() }
    } catch (error) {
      console.error('Failed to add admin:', error)
      throw error
    }
  }

  async removeAdmin(userId) {
    try {
      const rows = await this.adminsSheet.getRows()
      const adminRow = rows.find(row => row.get('userId') === userId.toString())
      
      if (!adminRow) {
        throw new Error('Admin not found')
      }

      await adminRow.delete()
      cache.del('admins')
      
      return { userId }
    } catch (error) {
      console.error('Failed to remove admin:', error)
      throw error
    }
  }

  clearCache() {
    cache.flushAll()
  }
}

export const sheetsService = new SheetsService()
