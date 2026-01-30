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

async function createTestOrder() {
  try {
    console.log('🔄 Connecting to Google Sheets...')
    await doc.loadInfo()
    console.log('✅ Connected to:', doc.title)

    const ordersSheet = doc.sheetsByTitle['orders']
    if (!ordersSheet) {
      console.error('❌ Orders sheet not found!')
      return
    }

    // Создаем тестовый заказ с правильной структурой
    const testOrder = {
      id: `ORD-${Date.now()}`,
      userId: '323976163',
      userName: 'Николай',
      services: JSON.stringify([
        {
          serviceId: 'SRV-1',
          serviceName: 'Комплексная мойка',
          price: 3250
        }
      ]),
      carClass: 'Комфорт',
      date: new Date().toLocaleDateString('ru-RU'),
      time: '14:00',
      phone: '79144026684',
      price: 3250,
      status: 'new',
      createdAt: new Date().toISOString()
    }

    await ordersSheet.addRow(testOrder)
    console.log('✅ Test order created:')
    console.log(`   ID: ${testOrder.id}`)
    console.log(`   Service: Комплексная мойка`)
    console.log(`   Price: ${testOrder.price} ₽`)
    console.log(`   Car class: ${testOrder.carClass}`)

    console.log('\n🎉 Done! Now refresh the admin panel to see the order.')
  } catch (error) {
    console.error('❌ Error creating test order:', error)
  }
}

createTestOrder()
