import dotenv from 'dotenv'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Загружаем .env из папки server
dotenv.config({ path: join(__dirname, '..', '.env') })

const seedGallery = async () => {
  try {
    console.log('🖼️  Начинаем заполнение галереи...')

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth)
    await doc.loadInfo()

    console.log('📊 Подключено к:', doc.title)

    const gallerySheet = doc.sheetsByTitle['gallery']
    
    if (!gallerySheet) {
      console.error('❌ Лист "gallery" не найден!')
      return
    }

    // Очищаем существующие данные
    const rows = await gallerySheet.getRows()
    console.log(`🗑️  Удаляем ${rows.length} существующих фото...`)
    for (const row of rows) {
      await row.delete()
    }

    // Примеры фото (замените на реальные URL)
    const galleryImages = [
      {
        id: 'IMG-1',
        serviceId: 'SRV-1',
        imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800',
        description: 'Комплексная мойка - до и после',
        order: '1'
      },
      {
        id: 'IMG-2',
        serviceId: 'SRV-1',
        imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800',
        description: 'Чистый салон после мойки',
        order: '2'
      },
      {
        id: 'IMG-3',
        serviceId: 'SRV-2',
        imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
        description: 'Полировка кузова - результат',
        order: '1'
      },
      {
        id: 'IMG-4',
        serviceId: 'SRV-2',
        imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
        description: 'Зеркальный блеск после полировки',
        order: '2'
      },
      {
        id: 'IMG-5',
        serviceId: 'SRV-3',
        imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800',
        description: 'Химчистка салона - процесс',
        order: '1'
      },
      {
        id: 'IMG-6',
        serviceId: 'SRV-4',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
        description: 'Керамическое покрытие - гидрофобный эффект',
        order: '1'
      },
      {
        id: 'IMG-7',
        serviceId: 'SRV-5',
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
        description: 'Оклейка защитной пленкой',
        order: '1'
      },
      {
        id: 'IMG-8',
        serviceId: 'SRV-6',
        imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
        description: 'Премиум детейлинг - финальный результат',
        order: '1'
      }
    ]

    console.log(`➕ Добавляем ${galleryImages.length} фото...`)
    
    for (const image of galleryImages) {
      await gallerySheet.addRow(image)
      console.log(`   ✓ ${image.description}`)
    }

    console.log('✅ Фото успешно добавлены!')
    console.log('\n📋 Примечание:')
    console.log('Используются примеры фото с Unsplash.')
    console.log('Замените URL на свои реальные фотографии работ.')
    console.log('\n🎉 Готово!')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

seedGallery()
