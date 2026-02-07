import dotenv from 'dotenv'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from server directory
const envPath = path.resolve(__dirname, '../.env')
console.log('Loading .env from:', envPath)
dotenv.config({ path: envPath })

console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'Set' : 'Not set')
console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? 'Set (length: ' + process.env.GOOGLE_PRIVATE_KEY.length + ')' : 'Not set')
console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID ? 'Set' : 'Not set')

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
]

const jwt = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
})

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt)

async function checkSettings() {
  try {
    console.log('🔄 Connecting to Google Sheets...')
    await doc.loadInfo()
    console.log('✅ Connected to:', doc.title)

    const settingsSheet = doc.sheetsByTitle['settings']
    if (!settingsSheet) {
      console.error('❌ Settings sheet not found!')
      return
    }

    await settingsSheet.loadHeaderRow()
    console.log('\n📊 Settings sheet headers:')
    console.log(settingsSheet.headerValues)

    const rows = await settingsSheet.getRows()
    console.log(`\n📝 Total rows: ${rows.length}`)
    
    if (rows.length > 0) {
      console.log('\n📋 All settings:')
      rows.forEach((row, index) => {
        console.log(`\nRow ${index + 1}:`)
        console.log('  Raw data:', row._rawData)
        console.log('  key:', row.get('key'))
        console.log('  value:', row.get('value'))
      })
    } else {
      console.log('⚠️  No data found in settings sheet')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkSettings()
