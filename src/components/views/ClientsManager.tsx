import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Phone, MessageCircle, ArrowLeft, Filter, X } from 'lucide-react'
import { api } from '../../api/client'
import WebApp from '@twa-dev/sdk'

interface Client {
  userId: string
  userName: string
  phone: string
  firstName: string
  lastName: string
  username: string
  firstOrderDate: string
  lastOrderDate: string
  totalOrders: number
  totalSpent: number
}

interface Order {
  id: string
  services: { serviceName: string; price: number }[]
  totalPrice: number
  carClass: string
  date: string
  time: string
  status: string
  createdAt: string
}

export default function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientOrders, setClientOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7d' | '30d' | '90d'>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setIsLoading(true)
      const data = await api.getClients()
      setClients(data || [])
    } catch (error) {
      console.error('Failed to load clients:', error)
      WebApp.showAlert('Ошибка загрузки клиентов')
    } finally {
      setIsLoading(false)
    }
  }

  const loadClientOrders = async (userId: string) => {
    try {
      const data = await api.getClientOrders(userId)
      setClientOrders(data || [])
    } catch (error) {
      console.error('Failed to load client orders:', error)
      WebApp.showAlert('Ошибка загрузки заказов клиента')
    }
  }

  const handleClientClick = async (client: Client) => {
    setSelectedClient(client)
    await loadClientOrders(client.userId)
  }

  const handleOpenChat = (userId: string) => {
    window.open(`https://t.me/${userId}`, '_blank')
  }

  const getFilteredClients = () => {
    if (filterPeriod === 'all') return clients

    const now = new Date()
    const periodDays = filterPeriod === '7d' ? 7 : filterPeriod === '30d' ? 30 : 90

    return clients.filter(client => {
      const lastOrderDate = new Date(client.lastOrderDate)
      const daysDiff = (now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= periodDays
    })
  }

  const filteredClients = getFilteredClients()

  const statusConfig: Record<string, { label: string; color: string }> = {
    new: { label: 'Новый', color: 'blue' },
    confirmed: { label: 'Подтвержден', color: 'yellow' },
    in_progress: { label: 'В работе', color: 'purple' },
    completed: { label: 'Завершен', color: 'green' },
    cancelled: { label: 'Отменен', color: 'red' },
  }

  if (selectedClient) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedClient(null)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold">{selectedClient.userName}</h2>
            <p className="text-sm text-gray-400">Детали клиента</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Телефон</p>
              <p className="font-semibold">{selectedClient.phone || 'Не указан'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Username</p>
              <p className="font-semibold">@{selectedClient.username || 'Не указан'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Всего заказов</p>
              <p className="font-semibold text-blue-400">{selectedClient.totalOrders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Потрачено</p>
              <p className="font-semibold text-green-400">{selectedClient.totalSpent.toLocaleString()} ₽</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Первый заказ</p>
              <p className="font-semibold text-xs">{new Date(selectedClient.firstOrderDate).toLocaleDateString('ru-RU')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Последний заказ</p>
              <p className="font-semibold text-xs">{new Date(selectedClient.lastOrderDate).toLocaleDateString('ru-RU')}</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenChat(selectedClient.username || selectedClient.userId)}
            className="w-full mt-4 px-4 py-3 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Написать в Telegram
          </motion.button>
        </div>

        <h3 className="text-xl font-bold mb-3">История заказов</h3>
        <div className="space-y-3">
          {clientOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">Заказ #{order.id.slice(-6)}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')} в {order.time}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${statusConfig[order.status]?.color}-500/20 text-${statusConfig[order.status]?.color}-400`}>
                  {statusConfig[order.status]?.label || order.status}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                {order.services.map((service, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-300">{service.serviceName}</span>
                    <span className="text-blue-400">{service.price.toLocaleString()} ₽</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className="text-sm text-gray-400">{order.carClass}</span>
                <span className="text-lg font-bold text-green-400">{order.totalPrice.toLocaleString()} ₽</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-blue-400" />
            Клиенты
          </h2>
          <p className="text-sm text-gray-400">Всего: {filteredClients.length}</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors relative"
        >
          <Filter size={20} />
          {filterPeriod !== 'all' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {showFilterMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-3 rounded-xl mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Фильтр по периоду</p>
              <button onClick={() => setShowFilterMenu(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'all', label: 'Все' },
                { value: '7d', label: '7 дней' },
                { value: '30d', label: '30 дней' },
                { value: '90d', label: '90 дней' },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => {
                    setFilterPeriod(period.value as any)
                    setShowFilterMenu(false)
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    filterPeriod === period.value
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Users size={48} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">Клиенты не найдены</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <motion.div
              key={client.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClientClick(client)}
              className="glass-card p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{client.userName}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    {client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {client.phone}
                      </span>
                    )}
                    {client.username && (
                      <span className="text-blue-400">@{client.username}</span>
                    )}
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenChat(client.username || client.userId)
                  }}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  <MessageCircle size={18} />
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-400">Заказов</p>
                  <p className="text-lg font-bold text-blue-400">{client.totalOrders}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-400">Потрачено</p>
                  <p className="text-lg font-bold text-green-400">{(client.totalSpent / 1000).toFixed(0)}k ₽</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-400">Последний</p>
                  <p className="text-xs font-semibold">{new Date(client.lastOrderDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
