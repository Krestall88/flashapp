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

async function checkSheets() {
  try {
    console.log('🔄 Connecting to Google Sheets...')
    await doc.loadInfo()
    console.log('✅ Connected to:', doc.title)

    const servicesSheet = doc.sheetsByTitle['services']
    if (!servicesSheet) {
      console.error('❌ Services sheet not found!')
      return
    }

    await servicesSheet.loadHeaderRow()
    console.log('\n📊 Services sheet headers:')
    console.log(servicesSheet.headerValues)

    const rows = await servicesSheet.getRows()
    if (rows.length > 0) {
      console.log('\n📝 First service data:')
      const firstRow = rows[0]
      console.log('All columns:', firstRow._rawData)
      
      // Попробуем получить все возможные варианты названий
      const possibleNames = ['basePrice', 'base_price', 'price', 'Price', 'BasePrice']
      for (const name of possibleNames) {
        const value = firstRow.get(name)
        console.log(`  ${name}: ${value}`)
      }
    }

    const ordersSheet = doc.sheetsByTitle['orders']
    if (ordersSheet) {
      await ordersSheet.loadHeaderRow()
      console.log('\n📊 Orders sheet headers:')
      console.log(ordersSheet.headerValues)

      const orderRows = await ordersSheet.getRows()
      if (orderRows.length > 0) {
        console.log('\n📝 First order data:')
        const firstOrder = orderRows[0]
        console.log('All columns:', firstOrder._rawData)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkSheets()
