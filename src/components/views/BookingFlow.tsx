import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { api } from '../../api/client'
import WebApp from '@twa-dev/sdk'

const carClasses = [
  { id: 'economy', name: 'Эконом', icon: '🚗', multiplier: 1 },
  { id: 'comfort', name: 'Комфорт', icon: '🚙', multiplier: 1.3 },
  { id: 'business', name: 'Бизнес', icon: '🚘', multiplier: 1.6 },
  { id: 'premium', name: 'Премиум', icon: '🏎️', multiplier: 2 },
]

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
]

export default function BookingFlow() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const { bookingData, updateBookingData, resetBookingData, setCurrentView, user } = useAppStore()

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else setCurrentView('home')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const orderData = {
        userId: user?.id,
        userName: bookingData.contactName,
        service: bookingData.serviceName,
        carClass: bookingData.carClass,
        date: bookingData.date?.toLocaleDateString('ru-RU'),
        time: bookingData.time,
        phone: bookingData.contactPhone,
      }

      await api.createOrder(orderData)
      
      setOrderSuccess(true)
      WebApp.HapticFeedback.notificationOccurred('success')
      
      setTimeout(() => {
        resetBookingData()
        setCurrentView('home')
      }, 3000)
    } catch (error) {
      WebApp.showAlert('Ошибка при создании заказа. Попробуйте еще раз.')
      WebApp.HapticFeedback.notificationOccurred('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return bookingData.carClass !== ''
      case 2: return bookingData.date !== null
      case 3: return bookingData.time !== ''
      case 4: return bookingData.contactName !== '' && bookingData.contactPhone !== ''
      default: return false
    }
  }

  if (orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
        >
          <Check size={48} className="text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Заказ создан!</h2>
        <p className="text-gray-400 text-center mb-6">
          Мы получили вашу заявку и свяжемся с вами в ближайшее время
        </p>
        <div className="glass-card p-4 rounded-xl w-full max-w-sm space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Услуга:</span>
            <span>{bookingData.serviceName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Дата:</span>
            <span>{bookingData.date?.toLocaleDateString('ru-RU')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Время:</span>
            <span>{bookingData.time}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-4 glass-card border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-lg">
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-semibold">{bookingData.serviceName}</h2>
          <div className="w-10" />
        </div>
        
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold mb-4">Выберите класс автомобиля</h3>
              {carClasses.map((carClass) => (
                <motion.button
                  key={carClass.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    updateBookingData({ carClass: carClass.name })
                    setTimeout(() => handleNext(), 300)
                  }}
                  className={`w-full glass-card p-4 text-left transition-all ${
                    bookingData.carClass === carClass.name
                      ? 'ring-2 ring-blue-500 bg-blue-500/10'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{carClass.icon}</span>
                      <div>
                        <div className="font-semibold">{carClass.name}</div>
                        <div className="text-sm text-gray-400">
                          Коэффициент: {carClass.multiplier}x
                        </div>
                      </div>
                    </div>
                    {bookingData.carClass === carClass.name && (
                      <Check className="text-blue-500" size={24} />
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold mb-4">Выберите дату</h3>
              <div className="glass-card p-4 rounded-xl">
                <DayPicker
                  mode="single"
                  selected={bookingData.date || undefined}
                  onSelect={(date) => {
                    updateBookingData({ date: date || null })
                    if (date) setTimeout(() => handleNext(), 300)
                  }}
                  disabled={{ before: new Date() }}
                  className="!bg-transparent"
                  classNames={{
                    months: 'text-white',
                    caption: 'text-white mb-4',
                    day: 'text-white hover:bg-blue-500/20 rounded-lg',
                    day_selected: 'bg-blue-500 text-white rounded-lg',
                    day_today: 'font-bold text-blue-400',
                  }}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold mb-4">Выберите время</h3>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((time) => (
                  <motion.button
                    key={time}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      updateBookingData({ time })
                      setTimeout(() => handleNext(), 300)
                    }}
                    className={`glass-card p-3 rounded-xl font-semibold transition-all ${
                      bookingData.time === time
                        ? 'ring-2 ring-blue-500 bg-blue-500/10'
                        : ''
                    }`}
                  >
                    {time}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold mb-4">Контактные данные</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ваше имя</label>
                  <input
                    type="text"
                    value={bookingData.contactName}
                    onChange={(e) => updateBookingData({ contactName: e.target.value })}
                    placeholder="Иван Иванов"
                    className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={bookingData.contactPhone}
                    onChange={(e) => updateBookingData({ contactPhone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl space-y-2 mt-6">
                <h4 className="font-semibold mb-3">Детали заказа:</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Услуга:</span>
                  <span>{bookingData.serviceName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Класс:</span>
                  <span>{bookingData.carClass}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Дата:</span>
                  <span>{bookingData.date?.toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Время:</span>
                  <span>{bookingData.time}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 glass-card border-t border-white/10">
        {step < 4 ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Далее
            <ChevronRight size={20} />
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Отправка...' : 'Подтвердить запись'}
            <Check size={20} />
          </motion.button>
        )}
      </div>
    </div>
  )
}
