import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Car, Droplets, Shield, Star, Image as ImageIcon } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { api } from '../../api/client'
import Gallery from './Gallery'

const categories = [
  { id: 'all', name: 'Все', icon: Sparkles },
  { id: 'detailing', name: 'Детейлинг', icon: Droplets },
  { id: 'rental', name: 'Аренда', icon: Car },
  { id: 'protection', name: 'Защита', icon: Shield },
]

const mockServices = [
  {
    id: '1',
    name: 'Комплексная мойка',
    description: 'Полная мойка кузова и салона',
    basePrice: 2500,
    prices: { economy: 2500, comfort: 3250, business: 4000, premium: 5000 },
    category: 'detailing',
    image: '🚗',
  },
  {
    id: '2',
    name: 'Полировка кузова',
    description: 'Восстановление блеска ЛКП',
    basePrice: 8500,
    prices: { economy: 8500, comfort: 11050, business: 13600, premium: 17000 },
    category: 'detailing',
    image: '✨',
  },
  {
    id: '3',
    name: 'Химчистка салона',
    description: 'Глубокая чистка всех поверхностей',
    basePrice: 5500,
    prices: { economy: 5500, comfort: 7150, business: 8800, premium: 11000 },
    category: 'detailing',
    image: '🧼',
  },
  {
    id: '4',
    name: 'Аренда BMW X5',
    description: 'Премиум кроссовер',
    basePrice: 7500,
    prices: { economy: 7500, comfort: 9750, business: 12000, premium: 15000 },
    category: 'rental',
    image: '🚙',
  },
  {
    id: '5',
    name: 'Керамическое покрытие',
    description: 'Защита на 2-3 года',
    basePrice: 25000,
    prices: { economy: 25000, comfort: 32500, business: 40000, premium: 50000 },
    category: 'protection',
    image: '🛡️',
  },
  {
    id: '6',
    name: 'Оклейка пленкой',
    description: 'Защитная или тонировочная',
    basePrice: 35000,
    prices: { economy: 35000, comfort: 45500, business: 56000, premium: 70000 },
    category: 'protection',
    image: '📦',
  },
]

export default function HomeView() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [galleryService, setGalleryService] = useState<typeof mockServices[0] | null>(null)
  const { setCurrentView, setServices, updateBookingData, setSelectedService, user } = useAppStore()

  useEffect(() => {
    const loadServices = async () => {
      try {
        const services = await api.getServices()
        setServices(services)
      } catch (error) {
        setServices(mockServices)
      }
    }
    loadServices()
  }, [setServices])

  const filteredServices = selectedCategory === 'all' 
    ? mockServices 
    : mockServices.filter(s => s.category === selectedCategory)

  const handleServiceSelect = (service: typeof mockServices[0]) => {
    setSelectedService(service)
    updateBookingData({
      services: [{
        serviceId: service.id,
        serviceName: service.name,
        price: service.basePrice
      }],
      totalPrice: service.basePrice
    })
    setCurrentView('booking')
  }

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          Привет, {user?.firstName || 'Гость'}! 👋
        </h1>
        <p className="text-gray-400">
          Выберите услугу для записи
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = selectedCategory === category.id
          
          return (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'glass-card text-gray-300'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{category.name}</span>
            </motion.button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 relative group"
          >
            <div 
              onClick={() => handleServiceSelect(service)}
              className="cursor-pointer"
            >
              <div className="text-4xl mb-3">{service.image}</div>
              <h3 className="font-semibold mb-1 text-sm">{service.name}</h3>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                {service.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-bold text-sm">
                  от {service.basePrice.toLocaleString()} ₽
                </span>
                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                  <Star size={12} fill="currentColor" />
                  <span>4.8</span>
                </div>
              </div>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                setGalleryService(service)
              }}
              className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              title="Посмотреть фото работ"
            >
              <ImageIcon size={16} className="text-white" />
            </motion.button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {galleryService && (
          <Gallery
            serviceId={galleryService.id}
            serviceName={galleryService.name}
            onClose={() => setGalleryService(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
