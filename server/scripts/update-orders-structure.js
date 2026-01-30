import 'dotenv/config'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
]

const jwt = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
})

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt)

async function updateOrdersStructure() {
  try {
    console.log('🔄 Connecting to Google Sheets...')
    await doc.loadInfo()
    console.log('✅ Connected to:', doc.title)

    const ordersSheet = doc.sheetsByTitle['orders']
    if (!ordersSheet) {
      console.error('❌ Orders sheet not found!')
      return
    }

    // Обновляем заголовки
    await ordersSheet.setHeaderRow([
      'id', 'userId', 'userName', 'services', 'carClass', 
      'date', 'time', 'phone', 'price', 'status', 'createdAt'
    ])
    console.log('✅ Заголовки обновлены')

    // Получаем все заказы
    const rows = await ordersSheet.getRows()
    console.log(`📊 Found ${rows.length} orders`)

    // Загружаем услуги для расчета цен
    const servicesSheet = doc.sheetsByTitle['services']
    const serviceRows = await servicesSheet.getRows()
    const servicesMap = new Map()
    
    for (const row of serviceRows) {
      const id = row.get('id')
      servicesMap.set(row.get('name'), {
        id,
        name: row.get('name'),
        economyPrice: parseFloat(row.get('economyPrice')) || 0,
        comfortPrice: parseFloat(row.get('comfortPrice')) || 0,
        businessPrice: parseFloat(row.get('businessPrice')) || 0,
        premiumPrice: parseFloat(row.get('premiumPrice')) || 0,
      })
    }

    // Обновляем каждый заказ
    for (const row of rows) {
      const orderId = row.get('id')
      
      // Проверяем есть ли уже services и price
      const existingServices = row.get('services')
      const existingPrice = row.get('price')
      
      if (existingServices && existingPrice) {
        console.log(`⏭️  Skipping ${orderId} - already has services and price`)
        continue
      }
      
      // Пытаемся получить старое поле service (может не существовать после обновления заголовков)
      let serviceName = null
      try {
        // Проверяем все возможные варианты
        serviceName = row._rawData[3] // 4-я колонка (индекс 3) - это services/service
      } catch (e) {
        console.log(`⚠️  Could not get service name for ${orderId}`)
      }
      
      const carClass = row.get('carClass')
      
      console.log(`\n📝 Order ${orderId}:`)
      console.log(`   Service name: "${serviceName}"`)
      console.log(`   Car class: "${carClass}"`)
      
      if (!serviceName) {
        console.log(`   ⏭️  Skipping - no service name`)
        continue
      }

      const service = servicesMap.get(serviceName)
      if (!service) {
        console.log(`⚠️  Service not found: ${serviceName}`)
        continue
      }

      // Определяем цену по классу авто
      let price = 0
      const carClassLower = carClass?.toLowerCase() || ''
      if (carClassLower.includes('эконом')) {
        price = service.economyPrice
      } else if (carClassLower.includes('комфорт')) {
        price = service.comfortPrice
      } else if (carClassLower.includes('бизнес')) {
        price = service.businessPrice
      } else if (carClassLower.includes('премиум')) {
        price = service.premiumPrice
      } else {
        price = service.economyPrice
      }

      // Создаем массив services
      const services = [{
        serviceId: service.id,
        serviceName: service.name,
        price: price
      }]

      // Обновляем строку
      row.set('services', JSON.stringify(services))
      row.set('price', price)
      await row.save()

      console.log(`✅ Updated order ${row.get('id')}: ${serviceName} - ${price} ₽`)
    }

    console.log('\n✅ All orders updated successfully!')
  } catch (error) {
    console.error('❌ Error updating orders:', error)
  }
}

updateOrdersStructure()
