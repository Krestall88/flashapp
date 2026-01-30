import dotenv from 'dotenv'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

dotenv.config()

const seedServices = async () => {
  try {
    console.log('🌱 Начинаем заполнение Google Sheets...')

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth)
    await doc.loadInfo()

    console.log('📊 Подключено к:', doc.title)

    const servicesSheet = doc.sheetsByTitle['services']
    
    if (!servicesSheet) {
      console.error('❌ Лист "services" не найден!')
      return
    }

    // Очищаем существующие данные (кроме заголовков)
    const rows = await servicesSheet.getRows()
    console.log(`🗑️  Удаляем ${rows.length} существующих записей...`)
    for (const row of rows) {
      await row.delete()
    }

    // Тестовые услуги
    const services = [
      {
        id: 'SRV-1',
        name: 'Комплексная мойка',
        description: 'Полная мойка кузова и салона с использованием профессиональной химии',
        basePrice: '2500',
        economyPrice: '2500',
        comfortPrice: '3250',
        businessPrice: '4000',
        premiumPrice: '5000',
        category: 'detailing',
        image: '🚗',
        active: 'true'
      },
      {
        id: 'SRV-2',
        name: 'Полировка кузова',
        description: 'Восстановление блеска лакокрасочного покрытия, удаление мелких царапин',
        basePrice: '8500',
        economyPrice: '8500',
        comfortPrice: '11050',
        businessPrice: '13600',
        premiumPrice: '17000',
        category: 'detailing',
        image: '✨',
        active: 'true'
      },
      {
        id: 'SRV-3',
        name: 'Химчистка салона',
        description: 'Глубокая чистка всех поверхностей салона, удаление пятен и запахов',
        basePrice: '5500',
        economyPrice: '5500',
        comfortPrice: '7150',
        businessPrice: '8800',
        premiumPrice: '11000',
        category: 'detailing',
        image: '🧼',
        active: 'true'
      },
      {
        id: 'SRV-4',
        name: 'Керамическое покрытие',
        description: 'Защита кузова на 2-3 года, гидрофобный эффект, блеск',
        basePrice: '25000',
        economyPrice: '25000',
        comfortPrice: '32500',
        businessPrice: '40000',
        premiumPrice: '50000',
        category: 'protection',
        image: '🛡️',
        active: 'true'
      },
      {
        id: 'SRV-5',
        name: 'Оклейка пленкой',
        description: 'Защитная или тонировочная пленка премиум качества',
        basePrice: '35000',
        economyPrice: '35000',
        comfortPrice: '45500',
        businessPrice: '56000',
        premiumPrice: '70000',
        category: 'protection',
        image: '📦',
        active: 'true'
      },
      {
        id: 'SRV-6',
        name: 'Детейлинг премиум',
        description: 'Комплексная подготовка автомобиля: мойка, полировка, химчистка, защита',
        basePrice: '45000',
        economyPrice: '45000',
        comfortPrice: '58500',
        businessPrice: '72000',
        premiumPrice: '90000',
        category: 'detailing',
        image: '💎',
        active: 'true'
      }
    ]

    console.log(`➕ Добавляем ${services.length} услуг...`)
    
    for (const service of services) {
      await servicesSheet.addRow(service)
      console.log(`   ✓ ${service.name}`)
    }

    console.log('✅ Услуги успешно добавлены!')
    console.log('\n📋 Следующие шаги:')
    console.log('1. Проверьте Google Sheets - лист "services"')
    console.log('2. При необходимости добавьте фото в лист "gallery"')
    console.log('3. Задеплойте изменения: git push')
    console.log('\n🎉 Готово!')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

seedServices()
