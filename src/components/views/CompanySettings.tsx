import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, MapPin, Clock, Phone, Mail, Globe } from 'lucide-react'
import WebApp from '@twa-dev/sdk'
import { api } from '../../api/client'

interface CompanySettings {
  name: string
  address: string
  phone: string
  email: string
  website: string
  workingHours: {
    start: string
    end: string
  }
  workingDays: string[]
  description: string
  contactMethods: string[]
}

const weekDays = [
  { id: 'mon', name: 'Пн' },
  { id: 'tue', name: 'Вт' },
  { id: 'wed', name: 'Ср' },
  { id: 'thu', name: 'Чт' },
  { id: 'fri', name: 'Пт' },
  { id: 'sat', name: 'Сб' },
  { id: 'sun', name: 'Вс' }
]

export default function CompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>({
    name: 'Детейлинг Центр',
    address: 'ул. Автомобильная, 15',
    phone: '+7 (999) 123-45-67',
    email: 'info@detailing.ru',
    website: 'https://detailing.ru',
    workingHours: {
      start: '09:00',
      end: '21:00'
    },
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    description: 'Профессиональный детейлинг и уход за автомобилем',
    contactMethods: ['phone']
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await api.getSettings()
        if (data) {
          setSettings(data)
          setHasChanges(false)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value })
    setHasChanges(true)
  }

  const toggleWorkingDay = (dayId: string) => {
    const newDays = settings.workingDays.includes(dayId)
      ? settings.workingDays.filter(d => d !== dayId)
      : [...settings.workingDays, dayId]
    
    handleChange('workingDays', newDays)
  }

  const toggleContactMethod = (method: string) => {
    const newMethods = settings.contactMethods.includes(method)
      ? settings.contactMethods.filter(m => m !== method)
      : [...settings.contactMethods, method]
    
    handleChange('contactMethods', newMethods)
  }

  const handleSave = async () => {
    try {
      await api.updateSettings(settings)
      WebApp.showAlert('Настройки сохранены!')
      setHasChanges(false)
      WebApp.HapticFeedback.notificationOccurred('success')
    } catch (error) {
      console.error('Failed to save settings:', error)
      WebApp.showAlert('Ошибка сохранения настроек')
      WebApp.HapticFeedback.notificationOccurred('error')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Загрузка настроек...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Настройки компании</h2>

      {/* Basic Info */}
      <div className="glass-card p-4 rounded-xl space-y-3">
        <h3 className="font-semibold mb-3">Основная информация</h3>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Название компании</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
            <MapPin size={14} />
            Адрес
          </label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Описание</label>
          <textarea
            value={settings.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="glass-card p-4 rounded-xl space-y-3">
        <h3 className="font-semibold mb-3">Контактная информация</h3>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Phone size={14} />
            Телефон
          </label>
          <input
            type="tel"
            value={settings.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Mail size={14} />
            Email
          </label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Globe size={14} />
            Сайт
          </label>
          <input
            type="url"
            value={settings.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://example.com"
            className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Способы связи</label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={settings.contactMethods.includes('phone')}
                onChange={() => toggleContactMethod('phone')}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <span>📞 Прямой звонок</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={settings.contactMethods.includes('whatsapp')}
                onChange={() => toggleContactMethod('whatsapp')}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <span>💬 WhatsApp</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={settings.contactMethods.includes('telegram')}
                onChange={() => toggleContactMethod('telegram')}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <span>✈️ Telegram</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">Выберите способы связи, которые будут доступны клиентам</p>
        </div>
      </div>

      {/* Working Hours */}
      <div className="glass-card p-4 rounded-xl space-y-3">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Clock size={18} className="text-blue-400" />
          Режим работы
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Открытие</label>
            <input
              type="time"
              value={settings.workingHours.start}
              onChange={(e) => handleChange('workingHours', { ...settings.workingHours, start: e.target.value })}
              className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Закрытие</label>
            <input
              type="time"
              value={settings.workingHours.end}
              onChange={(e) => handleChange('workingHours', { ...settings.workingHours, end: e.target.value })}
              className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Рабочие дни</label>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <motion.button
                key={day.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleWorkingDay(day.id)}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  settings.workingDays.includes(day.id)
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                {day.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 sticky bottom-4"
        >
          <Save size={20} />
          Сохранить изменения
        </motion.button>
      )}
    </div>
  )
}
