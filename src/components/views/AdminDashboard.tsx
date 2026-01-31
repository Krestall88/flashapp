import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Clock, CheckCircle, AlertCircle, Users, Edit, Trash2, MessageCircle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { api } from '../../api/client'
import AdminManagement from './AdminManagement'
import ServiceManager from './ServiceManager'
import OrderEditor from './OrderEditor'
import ClientsManager from './ClientsManager'

const statusConfig = {
  new: { label: 'Новый', color: 'bg-blue-500', icon: AlertCircle },
  in_progress: { label: 'В работе', color: 'bg-yellow-500', icon: Clock },
  completed: { label: 'Готов', color: 'bg-green-500', icon: CheckCircle },
}

export default function AdminDashboard() {
  const { orders, setOrders, updateOrderStatus } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'in_progress' | 'completed'>('all')
  const [activeTab, setActiveTab] = useState<'orders' | 'admins' | 'services' | 'clients'>('orders')
  const [editingOrder, setEditingOrder] = useState<any>(null)

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const data = await api.getOrders()
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: 'new' | 'in_progress' | 'completed') => {
    try {
      await api.updateOrderStatus(orderId, newStatus)
      updateOrderStatus(orderId, newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getNextStatus = (currentStatus: string) => {
    if (currentStatus === 'new') return 'in_progress'
    if (currentStatus === 'in_progress') return 'completed'
    return 'new'
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Удалить этот заказ?')) return

    try {
      await api.deleteOrder(orderId)
      loadOrders()
    } catch (error) {
      console.error('Failed to delete order:', error)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(statusConfig).map(([status, config]) => {
                const count = orders.filter(o => o.status === status).length
                return (
                  <div key={status} className="glass-card p-3 rounded-xl">
                    <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center mb-2`}>
                      <config.icon size={16} />
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-gray-400">{config.label}</div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {['all', 'new', 'in_progress', 'completed'].map((status) => (
                <motion.button
                  key={status}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-500 text-white'
                      : 'glass-card hover:bg-white/10'
                  }`}
                >
                  {status === 'all' ? 'Все' : statusConfig[status as keyof typeof statusConfig].label}
                </motion.button>
              ))}
            </div>

            {/* Итоговая сумма */}
            <div className="glass-card p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Итого по {filterStatus === 'all' ? 'всем заказам' : statusConfig[filterStatus as keyof typeof statusConfig]?.label.toLowerCase() || 'выбранным'}</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">
                    {orders.filter(o => filterStatus === 'all' || o.status === filterStatus).reduce((sum, order) => sum + (order.price || 0), 0).toLocaleString()} ₽
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Заказов</p>
                  <p className="text-2xl font-bold mt-1">
                    {orders.filter(o => filterStatus === 'all' || o.status === filterStatus).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="glass-card p-8 rounded-xl text-center text-gray-400">
                  Заказов пока нет
                </div>
              ) : (
                orders
                  .filter(order => filterStatus === 'all' || order.status === filterStatus)
                  .map((order, index) => {
                    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.new
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
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {(() => {
                                try {
                                  const services = typeof order.services === 'string' 
                                    ? JSON.parse(order.services) 
                                    : order.services
                                  return services && services.length > 0 
                                    ? services.map((s: any) => s.serviceName).join(', ')
                                    : order.service || 'Услуга не указана'
                                } catch (e) {
                                  return order.service || 'Услуга не указана'
                                }
                              })()}
                            </h3>
                            <p className="text-sm text-gray-400">{order.userName}</p>
                            {order.price && order.price > 0 && (
                              <p className="text-lg font-bold text-blue-400 mt-1">{order.price.toLocaleString()} ₽</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
                              <StatusIcon size={12} />
                              {config.label}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Класс:</span>
                            <span className="ml-2">{order.carClass}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Дата:</span>
                            <span className="ml-2">{order.date}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Время:</span>
                            <span className="ml-2">{order.time}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Телефон:</span>
                            <span className="ml-2">{order.phone}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setEditingOrder(order)}
                            className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit size={16} />
                            Редактировать
                          </motion.button>
                          {order.status !== 'completed' && (
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleStatusChange(order.id, getNextStatus(order.status) as any)}
                              className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                            >
                              {order.status === 'new' ? 'Начать работу' : 'Завершить'}
                            </motion.button>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDeleteOrder(order.id)}
                            className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.open(`tg://user?id=${order.userId}`, '_blank')}
                            className="bg-blue-500/20 text-blue-400 p-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                            title="Написать клиенту"
                          >
                            <MessageCircle size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })
              )}
            </div>
          </div>
        )
      case 'admins':
        return <AdminManagement />
      case 'services':
        return <ServiceManager />
      case 'clients':
        return <ClientsManager />
      default:
        return (
          <div className="space-y-4">
            {/* ... */}
          </div>
        )
    }
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Панель администратора</h1>
          <p className="text-gray-400 text-sm">
            {activeTab === 'orders' ? 'Управление заказами' : activeTab === 'services' ? 'Управление услугами' : 'Управление админами'}
          </p>
        </div>
        {activeTab === 'orders' && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={loadOrders}
            disabled={isLoading}
            className="p-3 glass-card rounded-xl"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </motion.button>
        )}
      </div>

      {/* Вкладки */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('orders')}
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'orders'
              ? 'bg-blue-500 text-white'
              : 'glass-card text-gray-400'
          }`}
        >
          Заказы
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('services')}
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'services'
              ? 'bg-blue-500 text-white'
              : 'glass-card text-gray-400'
          }`}
        >
          Услуги
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('admins')}
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'admins'
              ? 'bg-blue-500 text-white'
              : 'glass-card text-gray-400'
          }`}
        >
          <Users size={18} />
          Админы
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('clients')}
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'clients'
              ? 'bg-blue-500 text-white'
              : 'glass-card text-gray-400'
          }`}
        >
          <Users size={18} />
          Клиенты
        </motion.button>
      </div>

      {renderTabContent()}

      {/* Order Editor Modal */}
      <AnimatePresence>
        {editingOrder && (
          <OrderEditor
            order={editingOrder}
            onClose={() => setEditingOrder(null)}
            onSave={loadOrders}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
