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

async function populateClients() {
  try {
    console.log('🔄 Connecting to Google Sheets...')
    await doc.loadInfo()
    console.log('✅ Connected to:', doc.title)

    const ordersSheet = doc.sheetsByTitle['orders']
    const clientsSheet = doc.sheetsByTitle['clients']
    
    if (!ordersSheet) {
      console.error('❌ Orders sheet not found!')
      return
    }

    if (!clientsSheet) {
      console.error('❌ Clients sheet not found!')
      return
    }

    console.log('📊 Loading orders...')
    const orders = await ordersSheet.getRows()
    console.log(`Found ${orders.length} orders`)

    // Группируем заказы по userId
    const clientsMap = new Map()

    for (const order of orders) {
      const userId = order.get('userId')
      if (!userId) continue

      const userName = order.get('userName')
      const phone = order.get('phone')
      const price = parseFloat(order.get('price')) || 0
      const createdAt = order.get('createdAt')

      if (!clientsMap.has(userId)) {
        clientsMap.set(userId, {
          userId,
          userName,
          phone,
          firstName: '',
          lastName: '',
          username: '',
          firstOrderDate: createdAt,
          lastOrderDate: createdAt,
          totalOrders: 0,
          totalSpent: 0,
          orders: []
        })
      }

      const client = clientsMap.get(userId)
      client.totalOrders++
      client.totalSpent += price
      client.orders.push({ createdAt, price })
      
      // Обновляем lastOrderDate если текущий заказ новее
      if (new Date(createdAt) > new Date(client.lastOrderDate)) {
        client.lastOrderDate = createdAt
      }
      
      // Обновляем firstOrderDate если текущий заказ старше
      if (new Date(createdAt) < new Date(client.firstOrderDate)) {
        client.firstOrderDate = createdAt
      }
    }

    console.log(`\n📊 Found ${clientsMap.size} unique clients`)

    // Очищаем существующие данные в clients
    console.log('🗑️  Clearing existing clients...')
    const existingClients = await clientsSheet.getRows()
    for (const row of existingClients) {
      await row.delete()
    }

    // Добавляем клиентов
    console.log('➕ Adding clients...')
    for (const [userId, client] of clientsMap) {
      await clientsSheet.addRow({
        userId: client.userId,
        userName: client.userName,
        phone: client.phone,
        firstName: client.firstName,
        lastName: client.lastName,
        username: client.username,
        firstOrderDate: client.firstOrderDate,
        lastOrderDate: client.lastOrderDate,
        totalOrders: client.totalOrders,
        totalSpent: client.totalSpent
      })

      console.log(`✅ Added client: ${client.userName}`)
      console.log(`   Total orders: ${client.totalOrders}`)
      console.log(`   Total spent: ${client.totalSpent} ₽`)
      console.log(`   First order: ${new Date(client.firstOrderDate).toLocaleDateString('ru-RU')}`)
      console.log(`   Last order: ${new Date(client.lastOrderDate).toLocaleDateString('ru-RU')}`)
    }

    console.log('\n✅ All clients populated successfully!')
  } catch (error) {
    console.error('❌ Error populating clients:', error)
  }
}

populateClients()
