import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../../api/client'

interface GalleryImage {
  id: string
  serviceId: string
  imageUrl: string
  description: string
  order: number
}

interface GalleryProps {
  serviceId: string
  serviceName: string
  onClose: () => void
}

export default function Gallery({ serviceId, serviceName, onClose }: GalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGallery()
  }, [serviceId])

  const loadGallery = async () => {
    try {
      setIsLoading(true)
      const data = await api.getGallery(serviceId)
      setImages(data)
    } catch (error) {
      console.error('Failed to load gallery:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length])

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Загрузка галереи...</p>
        </div>
      </motion.div>
    )
  }

  if (images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div className="glass-card p-8 max-w-md text-center">
          <h3 className="text-xl font-bold mb-4">{serviceName}</h3>
          <p className="text-gray-400 mb-6">
            Фотографии работ пока не добавлены
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Закрыть
          </motion.button>
        </div>
      </motion.div>
    )
  }

  const currentImage = images[currentIndex]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 glass-card">
        <div>
          <h3 className="font-bold text-lg">{serviceName}</h3>
          <p className="text-sm text-gray-400">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </motion.button>
      </div>

      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-4xl w-full"
          >
            <img
              src={currentImage.imageUrl}
              alt={currentImage.description || serviceName}
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EИзображение не найдено%3C/text%3E%3C/svg%3E'
              }}
            />
            {currentImage.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 mt-4"
              >
                <p className="text-gray-300">{currentImage.description}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass-card hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass-card hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={24} />
            </motion.button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="p-4 glass-card overflow-x-auto">
          <div className="flex gap-2 justify-center">
            {images.map((image, index) => (
              <motion.button
                key={image.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-blue-500 opacity-100'
                    : 'border-white/20 opacity-50 hover:opacity-75'
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
