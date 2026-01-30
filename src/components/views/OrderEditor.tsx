import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Save } from 'lucide-react'
import WebApp from '@twa-dev/sdk'
import { api } from '../../api/client'

interface ServiceItem {
  serviceId: string
  serviceName: string
  price: number
}

interface Order {
  id: string
  services: ServiceItem[]
  carClass: string
  date: string
  time: string
  phone: string
  price: number
  status: string
}

interface OrderEditorProps {
  order: Order
  onClose: () => void
  onSave: () => void
}

export default function OrderEditor({ order, onClose, onSave }: OrderEditorProps) {
  const [editedOrder, setEditedOrder] = useState<Order>(order)
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showServiceSelector, setShowServiceSelector] = useState(false)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const services = await api.getServices()
      setAvailableServices(services)
    } catch (error) {
      console.error('Failed to load services:', error)
    }
  }

  const calculateTotalPrice = (services: ServiceItem[]) => {
    return services.reduce((sum, item) => sum + item.price, 0)
  }

  const handleAddService = (service: any) => {
    const carClassPrices = {
      'economy': service.prices.economy,
      'comfort': service.prices.comfort,
      'business': service.prices.business,
      'premium': service.prices.premium,
    }

    const price = carClassPrices[editedOrder.carClass as keyof typeof carClassPrices] || service.basePrice

    const newService: ServiceItem = {
      serviceId: service.id,
      serviceName: service.name,
      price,
    }

    const updatedServices = [...editedOrder.services, newService]
    const totalPrice = calculateTotalPrice(updatedServices)

    setEditedOrder({
      ...editedOrder,
      services: updatedServices,
      price: totalPrice,
    })
    setShowServiceSelector(false)
    WebApp.HapticFeedback.impactOccurred('light')
  }

  const handleRemoveService = (index: number) => {
    const updatedServices = editedOrder.services.filter((_, i) => i !== index)
    const totalPrice = calculateTotalPrice(updatedServices)

    setEditedOrder({
      ...editedOrder,
      services: updatedServices,
      price: totalPrice,
    })
    WebApp.HapticFeedback.impactOccurred('light')
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await api.updateOrder(order.id, {
        services: editedOrder.services,
        carClass: editedOrder.carClass,
        date: editedOrder.date,
        time: editedOrder.time,
        phone: editedOrder.phone,
        price: editedOrder.price,
      })
      WebApp.HapticFeedback.notificationOccurred('success')
      onSave()
      onClose()
    } catch (error) {
      console.error('Failed to save order:', error)
      WebApp.showAlert('Ошибка сохранения заказа')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Редактирование заказа</h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </motion.button>
        </div>

        <div className="space-y-4">
          {/* Услуги */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-400">Услуги</label>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowServiceSelector(true)}
                className="flex items-center gap-2 text-sm bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <Plus size={16} />
                Добавить услугу
              </motion.button>
            </div>

            <div className="space-y-2">
              {editedOrder.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="font-medium">{service.serviceName}</p>
                    <p className="text-sm text-gray-400">{service.price.toLocaleString()} ₽</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveService(index)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              ))}
            </div>
          </div>

          {/* Класс авто */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Класс автомобиля</label>
            <select
              value={editedOrder.carClass}
              onChange={(e) => setEditedOrder({ ...editedOrder, carClass: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            >
              <option value="economy">Эконом</option>
              <option value="comfort">Комфорт</option>
              <option value="business">Бизнес</option>
              <option value="premium">Премиум</option>
            </select>
          </div>

          {/* Дата */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Дата</label>
            <input
              type="date"
              value={editedOrder.date}
              onChange={(e) => setEditedOrder({ ...editedOrder, date: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Время */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Время</label>
            <input
              type="time"
              value={editedOrder.time}
              onChange={(e) => setEditedOrder({ ...editedOrder, time: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Телефон */}
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Телефон</label>
            <input
              type="tel"
              value={editedOrder.phone}
              onChange={(e) => setEditedOrder({ ...editedOrder, phone: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Итоговая цена */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Итоговая цена:</span>
              <span className="text-2xl font-bold text-blue-400">{editedOrder.price.toLocaleString()} ₽</span>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 bg-white/10 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              Отмена
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving || editedOrder.services.length === 0}
              className="flex-1 bg-blue-500 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Service Selector Modal */}
      <AnimatePresence>
        {showServiceSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowServiceSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Выберите услугу</h3>
              <div className="space-y-2">
                {availableServices.map((service) => (
                  <motion.button
                    key={service.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddService(service)}
                    className="w-full text-left bg-white/5 hover:bg-white/10 p-4 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{service.image}</span>
                      <div className="flex-1">
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-400">{service.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
