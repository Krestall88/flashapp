import axios from 'axios'

// Автоматически добавляем https:// если отсутствует
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  API_URL = `https://${API_URL}`
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  getServices: async () => {
    const response = await apiClient.get('/api/services')
    return response.data
  },

  createOrUpdateService: async (serviceData: any) => {
    const response = await apiClient.post('/api/services', serviceData)
    return response.data
  },

  deleteService: async (serviceId: string) => {
    const response = await apiClient.delete(`/api/services/${serviceId}`)
    return response.data
  },

  createOrder: async (orderData: any) => {
    try {
      console.log('Creating order with data:', orderData)
      console.log('API URL:', API_URL)
      const response = await apiClient.post('/api/orders', orderData)
      console.log('Order created successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Error creating order:', error.response?.data || error.message)
      throw error
    }
  },

  getOrders: async () => {
    const response = await apiClient.get('/api/orders')
    return response.data
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await apiClient.patch(`/api/orders/${orderId}/status`, { status })
    return response.data
  },

  updateOrder: async (orderId: string, orderData: any) => {
    const response = await apiClient.patch(`/api/orders/${orderId}`, orderData)
    return response.data
  },

  deleteOrder: async (orderId: string) => {
    const response = await apiClient.delete(`/api/orders/${orderId}`)
    return response.data
  },

  getAdmins: async () => {
    const response = await apiClient.get('/api/admins')
    return response.data
  },

  addAdmin: async (userId: string, name: string) => {
    const response = await apiClient.post('/api/admins', { userId, name })
    return response.data
  },

  removeAdmin: async (userId: string) => {
    const response = await apiClient.delete(`/api/admins/${userId}`)
    return response.data
  },

  getGallery: async (serviceId?: string) => {
    const url = serviceId ? `/api/gallery?serviceId=${serviceId}` : '/api/gallery'
    const response = await apiClient.get(url)
    return response.data
  },

  addGalleryImage: async (serviceId: string, imageUrl: string, description?: string, order?: number) => {
    const response = await apiClient.post('/api/gallery', { serviceId, imageUrl, description, order })
    return response.data
  },

  removeGalleryImage: async (imageId: string) => {
    const response = await apiClient.delete(`/api/gallery/${imageId}`)
    return response.data
  },
}
