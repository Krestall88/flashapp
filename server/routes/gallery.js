import express from 'express'
import { sheetsService } from '../services/sheetsService.js'

export const galleryRouter = express.Router()

// Получить все фото или фото для конкретной услуги
galleryRouter.get('/', async (req, res) => {
  try {
    const { serviceId } = req.query
    console.log(`📥 API: GET /api/gallery?serviceId=${serviceId || 'all'}`)
    const gallery = await sheetsService.getGallery(serviceId)
    console.log(`📤 API: Returning ${gallery.length} gallery images`)
    res.json(gallery)
  } catch (error) {
    console.error('❌ API: Error getting gallery:', error)
    res.status(500).json({ error: 'Failed to get gallery' })
  }
})

// Добавить фото в галерею
galleryRouter.post('/', async (req, res) => {
  try {
    const { serviceId, imageUrl, description, order } = req.body
    
    if (!serviceId || !imageUrl) {
      return res.status(400).json({ error: 'serviceId and imageUrl are required' })
    }

    const image = await sheetsService.addGalleryImage(serviceId, imageUrl, description, order)
    res.status(201).json(image)
  } catch (error) {
    console.error('Error adding gallery image:', error)
    res.status(500).json({ error: 'Failed to add gallery image' })
  }
})

// Удалить фото из галереи
galleryRouter.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params
    const result = await sheetsService.removeGalleryImage(imageId)
    res.json(result)
  } catch (error) {
    console.error('Error removing gallery image:', error)
    res.status(500).json({ error: 'Failed to remove gallery image' })
  }
})
