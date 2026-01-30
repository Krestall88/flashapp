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

async function updatePrices() {
  try {
    console.log('🔄 Connecting to Google Sheets...')
    await doc.loadInfo()
    console.log('✅ Connected to:', doc.title)

    const servicesSheet = doc.sheetsByTitle['services']
    if (!servicesSheet) {
      console.error('❌ Services sheet not found!')
      return
    }

    console.log('📊 Loading services...')
    const rows = await servicesSheet.getRows()
    console.log(`Found ${rows.length} services`)

    // Обновляем цены для каждой услуги
    for (const row of rows) {
      const serviceId = row.get('id')
      const basePriceRaw = row.get('basePrice')
      console.log(`\n📝 Service ${serviceId}: basePrice raw = "${basePriceRaw}" (type: ${typeof basePriceRaw})`)
      
      const basePrice = parseFloat(basePriceRaw) || 0
      console.log(`   Parsed basePrice = ${basePrice}`)

      // Если basePrice = 0, пропускаем
      if (basePrice === 0) {
        console.log(`   ⚠️  Skipping ${serviceId} - basePrice is 0`)
        continue
      }

      // Рассчитываем цены для разных классов авто
      const economyPrice = basePrice
      const comfortPrice = Math.round(basePrice * 1.3)
      const businessPrice = Math.round(basePrice * 1.6)
      const premiumPrice = Math.round(basePrice * 2.0)

      // Обновляем строку
      row.set('economyPrice', economyPrice)
      row.set('comfortPrice', comfortPrice)
      row.set('businessPrice', businessPrice)
      row.set('premiumPrice', premiumPrice)

      await row.save()

      console.log(`✅ Updated prices for ${serviceId}:`)
      console.log(`   Economy: ${economyPrice} ₽`)
      console.log(`   Comfort: ${comfortPrice} ₽`)
      console.log(`   Business: ${businessPrice} ₽`)
      console.log(`   Premium: ${premiumPrice} ₽`)
    }

    console.log('✅ All prices updated successfully!')
  } catch (error) {
    console.error('❌ Error updating prices:', error)
  }
}

updatePrices()
