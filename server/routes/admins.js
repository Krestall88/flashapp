import express from 'express'
import { sheetsService } from '../services/sheetsService.js'

export const adminsRouter = express.Router()

// Получить список админов
adminsRouter.get('/', async (req, res) => {
  try {
    const admins = await sheetsService.getAdmins()
    res.json(admins)
  } catch (error) {
    console.error('Error getting admins:', error)
    res.status(500).json({ error: 'Failed to get admins' })
  }
})

// Добавить админа
adminsRouter.post('/', async (req, res) => {
  try {
    const { userId, name } = req.body
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const admin = await sheetsService.addAdmin(userId, name)
    res.status(201).json(admin)
  } catch (error) {
    console.error('Error adding admin:', error)
    res.status(500).json({ error: 'Failed to add admin' })
  }
})

// Удалить админа
adminsRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const result = await sheetsService.removeAdmin(userId)
    res.json(result)
  } catch (error) {
    console.error('Error removing admin:', error)
    res.status(500).json({ error: 'Failed to remove admin' })
  }
})
