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
