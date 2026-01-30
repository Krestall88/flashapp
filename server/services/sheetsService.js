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
    this.gallerySheet = null
    this.clientsSheet = null
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
        headerValues: ['id', 'name', 'description', 'basePrice', 'economyPrice', 'comfortPrice', 'businessPrice', 'premiumPrice', 'category', 'image', 'active']
      })

      this.ordersSheet = this.doc.sheetsByTitle['orders'] || await this.doc.addSheet({ 
        title: 'orders',
        headerValues: ['id', 'userId', 'userName', 'service', 'carClass', 'date', 'time', 'phone', 'price', 'status', 'createdAt']
      })

      this.settingsSheet = this.doc.sheetsByTitle['settings'] || await this.doc.addSheet({ 
        title: 'settings',
        headerValues: ['key', 'value']
      })

      this.adminsSheet = this.doc.sheetsByTitle['admins'] || await this.doc.addSheet({ 
        title: 'admins',
        headerValues: ['userId', 'name', 'addedAt']
      })

      this.gallerySheet = this.doc.sheetsByTitle['gallery'] || await this.doc.addSheet({ 
        title: 'gallery',
        headerValues: ['id', 'serviceId', 'imageUrl', 'description', 'order']
      })

      this.clientsSheet = this.doc.sheetsByTitle['clients'] || await this.doc.addSheet({ 
        title: 'clients',
        headerValues: ['userId', 'userName', 'phone', 'firstName', 'lastName', 'username', 'firstOrderDate', 'lastOrderDate', 'totalOrders', 'totalSpent']
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
    if (cached) {
      console.log('📦 Returning cached services:', cached.length)
      return cached
    }

    try {
      console.log('🔍 Loading services from Google Sheets...')
      const rows = await this.servicesSheet.getRows()
      console.log('📊 Total rows in services sheet:', rows.length)
      
      const services = rows
        .filter(row => {
          const activeValue = row.get('active')
          const isActive = activeValue === 'true' || activeValue === 'TRUE' || activeValue === true
          console.log(`Service ${row.get('id')}: active=${activeValue}, filtered=${isActive}`)
          return isActive
        })
        .map(row => ({
          id: row.get('id'),
          name: row.get('name'),
          description: row.get('description'),
          basePrice: parseFloat(row.get('basePrice')) || 0,
          prices: {
            economy: parseFloat(row.get('economyPrice')) || parseFloat(row.get('basePrice')) || 0,
            comfort: parseFloat(row.get('comfortPrice')) || parseFloat(row.get('basePrice')) * 1.3 || 0,
            business: parseFloat(row.get('businessPrice')) || parseFloat(row.get('basePrice')) * 1.6 || 0,
            premium: parseFloat(row.get('premiumPrice')) || parseFloat(row.get('basePrice')) * 2 || 0,
          },
          category: row.get('category'),
          image: row.get('image'),
        }))

      console.log('✅ Loaded services:', services.length)
      cache.set(cacheKey, services)
      return services
    } catch (error) {
      console.error('❌ Failed to get services:', error)
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
        services: JSON.stringify(orderData.services || [{ serviceId: orderData.serviceId, serviceName: orderData.service, price: orderData.price }]),
        carClass: orderData.carClass,
        date: orderData.date,
        time: orderData.time,
        phone: orderData.phone,
        price: orderData.price || 0,
        status: 'new',
        createdAt: new Date().toISOString(),
      }

      await this.ordersSheet.addRow(order)
      
      // Сохранить/обновить клиента
      if (orderData.userId) {
        await this.updateClient(orderData)
      }
      
      cache.del('orders')
      
      return order
    } catch (error) {
      console.error('Failed to create order:', error)
      throw error
    }
  }

  async updateClient(orderData) {
    try {
      const rows = await this.clientsSheet.getRows()
      const existingClient = rows.find(row => row.get('userId') === String(orderData.userId))

      if (existingClient) {
        // Обновить существующего клиента
        existingClient.set('userName', orderData.userName)
        existingClient.set('phone', orderData.phone || existingClient.get('phone'))
        existingClient.set('lastOrderDate', new Date().toISOString())
        existingClient.set('totalOrders', (parseInt(existingClient.get('totalOrders')) || 0) + 1)
        existingClient.set('totalSpent', (parseFloat(existingClient.get('totalSpent')) || 0) + (orderData.price || 0))
        await existingClient.save()
      } else {
        // Создать нового клиента
        await this.clientsSheet.addRow({
          userId: String(orderData.userId),
          userName: orderData.userName,
          phone: orderData.phone || '',
          firstName: orderData.firstName || '',
          lastName: orderData.lastName || '',
          username: orderData.username || '',
          firstOrderDate: new Date().toISOString(),
          lastOrderDate: new Date().toISOString(),
          totalOrders: 1,
          totalSpent: orderData.price || 0
        })
      }
      
      cache.del('clients')
    } catch (error) {
      console.error('Failed to update client:', error)
    }
  }

  async getClients() {
    const cacheKey = 'clients'
    const cached = cache.get(cacheKey)
    if (cached) {
      console.log('📦 Returning cached clients:', cached.length)
      return cached
    }

    try {
      console.log('🔍 Loading clients from Google Sheets...')
      const rows = await this.clientsSheet.getRows()
      console.log('📊 Total rows in clients sheet:', rows.length)
      
      const clients = rows.map(row => ({
        userId: row.get('userId'),
        userName: row.get('userName'),
        phone: row.get('phone'),
        firstName: row.get('firstName'),
        lastName: row.get('lastName'),
        username: row.get('username'),
        firstOrderDate: row.get('firstOrderDate'),
        lastOrderDate: row.get('lastOrderDate'),
        totalOrders: parseInt(row.get('totalOrders')) || 0,
        totalSpent: parseFloat(row.get('totalSpent')) || 0
      }))

      console.log('✅ Loaded clients:', clients.length)
      cache.set(cacheKey, clients)
      return clients
    } catch (error) {
      console.error('❌ Failed to get clients:', error)
      return []
    }
  }

  async getOrdersByUserId(userId) {
    try {
      console.log(`🔍 Loading orders for user ${userId}...`)
      const rows = await this.ordersSheet.getRows()
      
      const orders = rows
        .filter(row => row.get('userId') === String(userId))
        .map(row => {
          let services = []
          try {
            services = JSON.parse(row.get('services'))
          } catch (e) {
            services = [{ serviceName: row.get('service'), price: parseFloat(row.get('price')) || 0 }]
          }
          
          return {
            id: row.get('id'),
            userId: row.get('userId'),
            userName: row.get('userName'),
            services: services,
            totalPrice: services.reduce((sum, s) => sum + (s.price || 0), 0),
            carClass: row.get('carClass'),
            date: row.get('date'),
            time: row.get('time'),
            phone: row.get('phone'),
            price: parseFloat(row.get('price')) || 0,
            status: row.get('status'),
            createdAt: row.get('createdAt')
          }
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      console.log(`✅ Found ${orders.length} orders for user ${userId}`)
      return orders
    } catch (error) {
      console.error('❌ Failed to get orders by userId:', error)
      return []
    }
  }

  async getOrders() {
    const cacheKey = 'orders'
    const cached = cache.get(cacheKey)
    if (cached) return cached

    try {
      const rows = await this.ordersSheet.getRows()
      
      const orders = rows.map(row => {
        let services = []
        try {
          services = JSON.parse(row.get('services') || '[]')
        } catch (e) {
          // Fallback для старых заказов с одной услугой
          const serviceName = row.get('service')
          if (serviceName) {
            services = [{ serviceId: '', serviceName, price: parseFloat(row.get('price')) || 0 }]
          }
        }

        return {
          id: row.get('id'),
          userId: row.get('userId'),
          userName: row.get('userName'),
          services,
          service: services.length > 0 ? services.map(s => s.serviceName).join(', ') : '',
          carClass: row.get('carClass'),
          date: row.get('date'),
          time: row.get('time'),
          phone: row.get('phone'),
          price: parseFloat(row.get('price')) || 0,
          status: row.get('status'),
          createdAt: row.get('createdAt'),
        }
      })

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

  async updateOrder(orderId, orderData) {
    try {
      const rows = await this.ordersSheet.getRows()
      const orderRow = rows.find(row => row.get('id') === orderId)
      
      if (!orderRow) {
        throw new Error('Order not found')
      }

      if (orderData.services) {
        orderRow.set('services', JSON.stringify(orderData.services))
      }
      if (orderData.carClass) orderRow.set('carClass', orderData.carClass)
      if (orderData.date) orderRow.set('date', orderData.date)
      if (orderData.time) orderRow.set('time', orderData.time)
      if (orderData.phone) orderRow.set('phone', orderData.phone)
      if (orderData.price !== undefined) orderRow.set('price', orderData.price.toString())
      if (orderData.status) orderRow.set('status', orderData.status)
      
      await orderRow.save()
      cache.del('orders')
      
      return { id: orderId, ...orderData }
    } catch (error) {
      console.error('Failed to update order:', error)
      throw error
    }
  }

  async deleteOrder(orderId) {
    try {
      const rows = await this.ordersSheet.getRows()
      const orderRow = rows.find(row => row.get('id') === orderId)
      
      if (!orderRow) {
        throw new Error('Order not found')
      }

      await orderRow.delete()
      cache.del('orders')
      
      return { id: orderId }
    } catch (error) {
      console.error('Failed to delete order:', error)
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

  async getGallery(serviceId = null) {
    const cacheKey = serviceId ? `gallery_${serviceId}` : 'gallery_all'
    const cached = cache.get(cacheKey)
    
    if (cached) {
      console.log(`📦 Returning cached gallery for ${serviceId || 'all'}:`, cached.length)
      return cached
    }

    try {
      console.log(`🔍 Loading gallery from Google Sheets for serviceId: ${serviceId || 'all'}`)
      const rows = await this.gallerySheet.getRows()
      console.log('📊 Total rows in gallery sheet:', rows.length)
      
      let gallery = rows.map(row => ({
        id: row.get('id'),
        serviceId: row.get('serviceId'),
        imageUrl: row.get('imageUrl'),
        description: row.get('description') || '',
        order: parseInt(row.get('order')) || 0
      }))

      if (serviceId) {
        console.log(`🔍 Filtering gallery for serviceId: ${serviceId}`)
        const serviceIdStr = String(serviceId)
        gallery = gallery.filter(item => {
          const itemServiceIdStr = String(item.serviceId)
          const match = itemServiceIdStr === serviceIdStr
          console.log(`Image ${item.id}: serviceId="${item.serviceId}" (${itemServiceIdStr}) vs "${serviceId}" (${serviceIdStr}), match=${match}`)
          return match
        })
      }

      gallery.sort((a, b) => a.order - b.order)
      console.log(`✅ Loaded gallery images:`, gallery.length)
      
      cache.set(cacheKey, gallery)
      return gallery
    } catch (error) {
      console.error('❌ Failed to get gallery:', error)
      return []
    }
  }

  async addGalleryImage(serviceId, imageUrl, description = '', order = 0) {
    try {
      const id = `IMG-${Date.now()}`
      await this.gallerySheet.addRow({
        id,
        serviceId,
        imageUrl,
        description,
        order: order.toString()
      })
      
      cache.del('gallery_all')
      cache.del(`gallery_${serviceId}`)
      
      return { id, serviceId, imageUrl, description, order }
    } catch (error) {
      console.error('Failed to add gallery image:', error)
      throw error
    }
  }

  async removeGalleryImage(imageId) {
    try {
      const rows = await this.gallerySheet.getRows()
      const imageRow = rows.find(row => row.get('id') === imageId)
      
      if (!imageRow) {
        throw new Error('Image not found')
      }

      const serviceId = imageRow.get('serviceId')
      await imageRow.delete()
      
      cache.del('gallery_all')
      cache.del(`gallery_${serviceId}`)
      
      return { id: imageId }
    } catch (error) {
      console.error('Failed to remove gallery image:', error)
      throw error
    }
  }

  async createOrUpdateService(serviceData) {
    try {
      const rows = await this.servicesSheet.getRows()
      
      if (serviceData.id) {
        // Обновление существующей услуги
        const serviceRow = rows.find(row => row.get('id') === serviceData.id)
        
        if (!serviceRow) {
          throw new Error('Service not found')
        }

        serviceRow.set('name', serviceData.name)
        serviceRow.set('description', serviceData.description)
        serviceRow.set('basePrice', serviceData.basePrice.toString())
        serviceRow.set('economyPrice', serviceData.prices.economy.toString())
        serviceRow.set('comfortPrice', serviceData.prices.comfort.toString())
        serviceRow.set('businessPrice', serviceData.prices.business.toString())
        serviceRow.set('premiumPrice', serviceData.prices.premium.toString())
        serviceRow.set('category', serviceData.category)
        serviceRow.set('image', serviceData.image)
        serviceRow.set('active', serviceData.active ? 'true' : 'false')
        
        await serviceRow.save()
        cache.del('services')
        
        return serviceData
      } else {
        // Создание новой услуги
        const newId = `SRV-${Date.now()}`
        const newService = {
          id: newId,
          name: serviceData.name,
          description: serviceData.description,
          basePrice: serviceData.basePrice.toString(),
          economyPrice: serviceData.prices.economy.toString(),
          comfortPrice: serviceData.prices.comfort.toString(),
          businessPrice: serviceData.prices.business.toString(),
          premiumPrice: serviceData.prices.premium.toString(),
          category: serviceData.category,
          image: serviceData.image,
          active: 'true'
        }
        
        await this.servicesSheet.addRow(newService)
        cache.del('services')
        
        return { ...serviceData, id: newId }
      }
    } catch (error) {
      console.error('Failed to create/update service:', error)
      throw error
    }
  }

  async deleteService(serviceId) {
    try {
      const rows = await this.servicesSheet.getRows()
      const serviceRow = rows.find(row => row.get('id') === serviceId)
      
      if (!serviceRow) {
        throw new Error('Service not found')
      }

      await serviceRow.delete()
      cache.del('services')
      
      // Также удаляем все фото этой услуги
      const galleryRows = await this.gallerySheet.getRows()
      const serviceImages = galleryRows.filter(row => row.get('serviceId') === serviceId)
      
      for (const imageRow of serviceImages) {
        await imageRow.delete()
      }
      
      cache.del('gallery_all')
      cache.del(`gallery_${serviceId}`)
      
      return { id: serviceId }
    } catch (error) {
      console.error('Failed to delete service:', error)
      throw error
    }
  }

  clearCache() {
    cache.flushAll()
  }
}

export const sheetsService = new SheetsService()
