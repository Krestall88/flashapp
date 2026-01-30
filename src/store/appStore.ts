import { create } from 'zustand'

export type ViewType = 'home' | 'booking' | 'orders' | 'admin' | 'ai'

interface User {
  id: number
  firstName: string
  lastName: string
  username: string
}

interface Service {
  id: string
  name: string
  description: string
  basePrice: number
  prices: {
    economy: number
    comfort: number
    business: number
    premium: number
  }
  category: string
  image: string
}

interface ServiceItem {
  serviceId: string
  serviceName: string
  price: number
}

interface BookingData {
  services: ServiceItem[]
  carClass: string
  date: Date | null
  time: string
  contactName: string
  contactPhone: string
  totalPrice: number
}

interface Order {
  id: string
  userId: number
  userName: string
  services: ServiceItem[]
  service?: string
  carClass: string
  date: string
  time: string
  phone: string
  price: number
  status: 'new' | 'in_progress' | 'completed'
  createdAt: string
}

interface AppState {
  currentView: ViewType
  user: User | null
  isAdmin: boolean
  services: Service[]
  bookingData: BookingData
  selectedService: Service | null
  orders: Order[]
  setCurrentView: (view: ViewType) => void
  setUser: (user: User) => void
  setIsAdmin: (isAdmin: boolean) => void
  setServices: (services: Service[]) => void
  updateBookingData: (data: Partial<BookingData>) => void
  resetBookingData: () => void
  setSelectedService: (service: Service | null) => void
  setOrders: (orders: Order[]) => void
  updateOrderStatus: (orderId: string, status: Order['status']) => void
}

const initialBookingData: BookingData = {
  services: [],
  carClass: '',
  date: null,
  time: '',
  contactName: '',
  contactPhone: '',
  totalPrice: 0,
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  user: null,
  isAdmin: false,
  services: [],
  bookingData: initialBookingData,
  selectedService: null,
  orders: [],
  
  setCurrentView: (view) => set({ currentView: view }),
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setServices: (services) => set({ services }),
  updateBookingData: (data) => set((state) => ({
    bookingData: { ...state.bookingData, ...data }
  })),
  resetBookingData: () => set({ bookingData: initialBookingData }),
  setSelectedService: (service) => set({ selectedService: service }),
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    )
  })),
}))
