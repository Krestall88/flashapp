import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from 'lucide-react'
import { api } from '../../api/client'
import WebApp from '@twa-dev/sdk'

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
  active?: boolean
}

interface GalleryImage {
  id: string
  serviceId: string
  imageUrl: string
  description: string
  order: number
}

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedServiceForGallery, setSelectedServiceForGallery] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newImageDescription, setNewImageDescription] = useState('')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setIsLoading(true)
      const data = await api.getServices()
      console.log('ServiceManager: Loaded services:', data)
      setServices(data || [])
    } catch (error) {
      console.error('ServiceManager: Failed to load services:', error)
      WebApp.showAlert('Ошибка загрузки услуг')
      setServices([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadGallery = async (serviceId: string) => {
    try {
      const data = await api.getGallery(serviceId)
      setGalleryImages(data)
    } catch (error) {
      console.error('Failed to load gallery:', error)
    }
  }

  const handleCreateService = () => {
    setIsCreating(true)
    setEditingService({
      id: '',
      name: '',
      description: '',
      basePrice: 0,
      prices: {
        economy: 0,
        comfort: 0,
        business: 0,
        premium: 0,
      },
      category: 'detailing',
      image: '🚗',
      active: true,
    })
  }

  const handleSaveService = async () => {
    if (!editingService) return

    try {
      await api.createOrUpdateService(editingService)
      WebApp.HapticFeedback.notificationOccurred('success')
      setEditingService(null)
      setIsCreating(false)
      loadServices()
    } catch (error) {
      console.error('Failed to save service:', error)
      WebApp.showAlert('Ошибка сохранения услуги')
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Удалить эту услугу? Все фото также будут удалены.')) return

    try {
      await api.deleteService(serviceId)
      WebApp.HapticFeedback.notificationOccurred('success')
      loadServices()
    } catch (error) {
      console.error('Failed to delete service:', error)
      WebApp.showAlert('Ошибка удаления услуги')
    }
  }

  const handleAddImage = async () => {
    if (!selectedServiceForGallery || !newImageUrl) return

    try {
      await api.addGalleryImage(
        selectedServiceForGallery,
        newImageUrl,
        newImageDescription,
        galleryImages.length
      )
      setNewImageUrl('')
      setNewImageDescription('')
      loadGallery(selectedServiceForGallery)
      WebApp.HapticFeedback.notificationOccurred('success')
    } catch (error) {
      console.error('Failed to add image:', error)
      WebApp.showAlert('Ошибка добавления фото')
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Удалить это фото?')) return

    try {
      await api.removeGalleryImage(imageId)
      if (selectedServiceForGallery) {
        loadGallery(selectedServiceForGallery)
      }
      WebApp.HapticFeedback.notificationOccurred('success')
    } catch (error) {
      console.error('Failed to delete image:', error)
      WebApp.showAlert('Ошибка удаления фото')
    }
  }

  const updateEditingService = (field: string, value: any) => {
    if (!editingService) return
    setEditingService({ ...editingService, [field]: value })
  }

  const updatePrice = (carClass: keyof Service['prices'], value: number) => {
    if (!editingService) return
    setEditingService({
      ...editingService,
      prices: { ...editingService.prices, [carClass]: value },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка услуг...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление услугами</h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateService}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Добавить услугу
        </motion.button>
      </div>

      <div className="space-y-3">
        {services.length === 0 && !isLoading ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-400 mb-4">Услуги пока не добавлены</p>
            <p className="text-sm text-gray-500">
              Нажмите "Добавить услугу" чтобы создать первую услугу
            </p>
          </div>
        ) : (
          services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{service.image}</span>
                  <div>
                    <h3 className="font-bold text-lg">{service.name}</h3>
                    <p className="text-sm text-gray-400">{service.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <span className="text-gray-400">Эконом:</span>{' '}
                    <span className="font-semibold">{service.prices.economy.toLocaleString()} ₽</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Комфорт:</span>{' '}
                    <span className="font-semibold">{service.prices.comfort.toLocaleString()} ₽</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Бизнес:</span>{' '}
                    <span className="font-semibold">{service.prices.business.toLocaleString()} ₽</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Премиум:</span>{' '}
                    <span className="font-semibold">{service.prices.premium.toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedServiceForGallery(service.id)
                    loadGallery(service.id)
                  }}
                  className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                  title="Управление фото"
                >
                  <ImageIcon size={20} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingService(service)}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  title="Редактировать"
                >
                  <Edit2 size={20} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteService(service.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Удалить"
                >
                  <Trash2 size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
          ))
        )}
      </div>

      {/* Edit/Create Service Modal */}
      <AnimatePresence>
        {editingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setEditingService(null)
              setIsCreating(false)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {isCreating ? 'Новая услуга' : 'Редактирование услуги'}
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setEditingService(null)
                    setIsCreating(false)
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Название</label>
                  <input
                    type="text"
                    value={editingService.name}
                    onChange={(e) => updateEditingService('name', e.target.value)}
                    className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Описание</label>
                  <textarea
                    value={editingService.description}
                    onChange={(e) => updateEditingService('description', e.target.value)}
                    rows={3}
                    className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Категория</label>
                    <select
                      value={editingService.category}
                      onChange={(e) => updateEditingService('category', e.target.value)}
                      className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="detailing">Детейлинг</option>
                      <option value="rental">Аренда</option>
                      <option value="protection">Защита</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Эмодзи</label>
                    <input
                      type="text"
                      value={editingService.image}
                      onChange={(e) => updateEditingService('image', e.target.value)}
                      className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Базовая цена</label>
                  <input
                    type="number"
                    value={editingService.basePrice}
                    onChange={(e) => updateEditingService('basePrice', parseFloat(e.target.value) || 0)}
                    className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Цены по классам авто</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Эконом</label>
                      <input
                        type="number"
                        value={editingService.prices.economy}
                        onChange={(e) => updatePrice('economy', parseFloat(e.target.value) || 0)}
                        className="w-full glass-card p-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Комфорт</label>
                      <input
                        type="number"
                        value={editingService.prices.comfort}
                        onChange={(e) => updatePrice('comfort', parseFloat(e.target.value) || 0)}
                        className="w-full glass-card p-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Бизнес</label>
                      <input
                        type="number"
                        value={editingService.prices.business}
                        onChange={(e) => updatePrice('business', parseFloat(e.target.value) || 0)}
                        className="w-full glass-card p-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Премиум</label>
                      <input
                        type="number"
                        value={editingService.prices.premium}
                        onChange={(e) => updatePrice('premium', parseFloat(e.target.value) || 0)}
                        className="w-full glass-card p-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveService}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Save size={20} />
                    Сохранить
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingService(null)
                      setIsCreating(false)
                    }}
                    className="px-6 py-3 rounded-xl glass-card hover:bg-white/10 transition-colors"
                  >
                    Отмена
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Management Modal */}
      <AnimatePresence>
        {selectedServiceForGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedServiceForGallery(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Управление фото</h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedServiceForGallery(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">URL изображения</label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Описание (опционально)</label>
                  <input
                    type="text"
                    value={newImageDescription}
                    onChange={(e) => setNewImageDescription(e.target.value)}
                    placeholder="Описание фото"
                    className="w-full glass-card p-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddImage}
                  disabled={!newImageUrl}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                  Добавить фото
                </motion.button>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Текущие фото ({galleryImages.length})</h4>
                {galleryImages.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Фото пока не добавлены</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {galleryImages.map((image) => (
                      <div key={image.id} className="glass-card p-3 relative group">
                        <img
                          src={image.imageUrl}
                          alt={image.description}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        {image.description && (
                          <p className="text-xs text-gray-400 line-clamp-2">{image.description}</p>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteImage(image.id)}
                          className="absolute top-1 right-1 p-2 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
