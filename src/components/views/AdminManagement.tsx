import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Trash2, RefreshCw, Shield } from 'lucide-react'
import { api } from '../../api/client'
import WebApp from '@twa-dev/sdk'

interface Admin {
  userId: string
  name: string
  addedAt: string
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newUserId, setNewUserId] = useState('')
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const loadAdmins = async () => {
    setIsLoading(true)
    try {
      const data = await api.getAdmins()
      setAdmins(data)
    } catch (error) {
      console.error('Failed to load admins:', error)
      WebApp.showAlert('Ошибка загрузки списка админов')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  const handleAddAdmin = async () => {
    if (!newUserId.trim()) {
      WebApp.showAlert('Введите User ID')
      return
    }

    setIsAdding(true)
    try {
      await api.addAdmin(newUserId, newName)
      WebApp.HapticFeedback.notificationOccurred('success')
      setNewUserId('')
      setNewName('')
      await loadAdmins()
    } catch (error) {
      console.error('Failed to add admin:', error)
      WebApp.showAlert('Ошибка добавления админа')
      WebApp.HapticFeedback.notificationOccurred('error')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    const confirmed = window.confirm('Удалить этого админа?')
    if (!confirmed) return

    try {
      await api.removeAdmin(userId)
      WebApp.HapticFeedback.notificationOccurred('success')
      await loadAdmins()
    } catch (error) {
      console.error('Failed to remove admin:', error)
      WebApp.showAlert('Ошибка удаления админа')
      WebApp.HapticFeedback.notificationOccurred('error')
    }
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление админами</h1>
          <p className="text-gray-400 text-sm">Добавляйте и удаляйте администраторов</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={loadAdmins}
          disabled={isLoading}
          className="p-3 glass-card rounded-xl"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {/* Форма добавления */}
      <div className="glass-card p-4 rounded-xl space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <UserPlus size={20} />
          Добавить админа
        </h3>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            User ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="323976163"
            className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Узнать User ID можно через @userinfobot
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Имя (необязательно)
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Иван Иванов"
            className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddAdmin}
          disabled={isAdding || !newUserId.trim()}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus size={20} />
          {isAdding ? 'Добавление...' : 'Добавить админа'}
        </motion.button>
      </div>

      {/* Список админов */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield size={20} />
          Список админов ({admins.length})
        </h3>

        {admins.length === 0 ? (
          <div className="glass-card p-8 rounded-xl text-center text-gray-400">
            Админов пока нет
          </div>
        ) : (
          admins.map((admin, index) => (
            <motion.div
              key={admin.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={16} className="text-blue-400" />
                    <h4 className="font-semibold">
                      {admin.name || 'Без имени'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-400">
                    User ID: <span className="font-mono">{admin.userId}</span>
                  </p>
                  {admin.addedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Добавлен: {new Date(admin.addedAt).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveAdmin(admin.userId)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Инструкция */}
      <div className="glass-card p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-semibold text-blue-400 mb-2">💡 Как узнать User ID?</h4>
        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
          <li>Попросите пользователя написать боту @userinfobot</li>
          <li>Бот покажет User ID</li>
          <li>Введите этот ID в форму выше</li>
          <li>Пользователь получит доступ к админ-панели</li>
        </ol>
      </div>
    </div>
  )
}
