import express from 'express'
import { sheetsService } from '../services/sheetsService.js'

export const servicesRouter = express.Router()

servicesRouter.get('/', async (req, res) => {
  try {
    const services = await sheetsService.getServices()
    res.json(services)
  } catch (error) {
    console.error('Error getting services:', error)
    res.status(500).json({ error: 'Failed to get services' })
  }
})

// Создание или обновление услуги
servicesRouter.post('/', async (req, res) => {
  try {
    const serviceData = req.body
    
    if (!serviceData.name || !serviceData.category) {
      return res.status(400).json({ error: 'Name and category are required' })
    }

    const service = await sheetsService.createOrUpdateService(serviceData)
    res.status(serviceData.id ? 200 : 201).json(service)
  } catch (error) {
    console.error('Error creating/updating service:', error)
    res.status(500).json({ error: 'Failed to save service' })
  }
})

// Удаление услуги
servicesRouter.delete('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params
    const result = await sheetsService.deleteService(serviceId)
    res.json(result)
  } catch (error) {
    console.error('Error deleting service:', error)
    res.status(500).json({ error: 'Failed to delete service' })
  }
})
