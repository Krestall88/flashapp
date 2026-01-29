import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

  createOrder: async (orderData: any) => {
    const response = await apiClient.post('/api/orders', orderData)
    return response.data
  },

  getOrders: async () => {
    const response = await apiClient.get('/api/orders')
    return response.data
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await apiClient.patch(`/api/orders/${orderId}`, { status })
    return response.data
  },
}
