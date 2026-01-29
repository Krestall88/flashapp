import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { api } from '../../api/client'

const statusConfig = {
  new: { label: 'Новый', color: 'bg-blue-500', icon: AlertCircle },
  in_progress: { label: 'В работе', color: 'bg-yellow-500', icon: Clock },
  completed: { label: 'Завершен', color: 'bg-green-500', icon: CheckCircle },
}

export default function MyOrders() {
  const { user } = useAppStore()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadMyOrders = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const allOrders = await api.getOrders()
      const myOrders = allOrders.filter((order: any) => order.userId === user.id.toString())
      setOrders(myOrders)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMyOrders()
  }, [user?.id])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Мои заказы</h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={loadMyOrders}
          disabled={isLoading}
          className="p-2 glass-card rounded-lg"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="glass-card p-8 rounded-xl text-center text-gray-400">
          Загрузка...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-8 rounded-xl text-center text-gray-400">
          У вас пока нет заказов
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, index) => {
            const config = statusConfig[order.status as keyof typeof statusConfig]
            const StatusIcon = config.icon

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 rounded-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{order.service}</h3>
                    <p className="text-sm text-gray-400">{order.carClass}</p>
                  </div>
                  <div className={`flex items-center gap-2 ${config.color} px-3 py-1 rounded-full text-xs`}>
                    <StatusIcon size={14} />
                    {config.label}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Дата:</span>
                    <span>{order.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Время:</span>
                    <span>{order.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Телефон:</span>
                    <span>{order.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Номер заказа:</span>
                    <span className="text-xs">{order.id}</span>
                  </div>
                </div>

                {order.status === 'new' && (
                  <div className="mt-3 p-2 bg-blue-500/10 rounded-lg text-xs text-blue-400">
                    ⏳ Ожидает подтверждения
                  </div>
                )}
                {order.status === 'in_progress' && (
                  <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg text-xs text-yellow-400">
                    🔧 Заказ в работе
                  </div>
                )}
                {order.status === 'completed' && (
                  <div className="mt-3 p-2 bg-green-500/10 rounded-lg text-xs text-green-400">
                    ✅ Заказ выполнен
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
