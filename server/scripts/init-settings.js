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

async function initSettings() {
  try {
    console.log('🔄 Connecting to Google Sheets...')
    await doc.loadInfo()
    console.log('✅ Connected to:', doc.title)

    let settingsSheet = doc.sheetsByTitle['settings']
    
    if (!settingsSheet) {
      console.log('📝 Creating settings sheet...')
      settingsSheet = await doc.addSheet({
        title: 'settings',
        headerValues: ['key', 'value']
      })
      console.log('✅ Settings sheet created!')
    } else {
      console.log('✅ Settings sheet already exists')
    }

    // Проверяем существующие данные
    const rows = await settingsSheet.getRows()
    const existingKeys = new Map(rows.map(r => [r.get('key'), r]))

    // Начальные данные для детейлинг-центра
    const defaultSettings = [
      { key: 'name', value: 'Детейлинг Центр' },
      { key: 'address', value: 'ул. Автомобильная, 15' },
      { key: 'phone', value: '+7 (999) 123-45-67' },
      { key: 'email', value: 'info@detailing.ru' },
      { key: 'website', value: 'https://detailing.ru' },
      { key: 'description', value: 'Профессиональный детейлинг и уход за автомобилем' },
      { key: 'workingHours', value: JSON.stringify({ start: '09:00', end: '21:00' }) },
      { key: 'workingDays', value: JSON.stringify(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']) },
      { key: 'contactMethods', value: JSON.stringify(['phone', 'whatsapp', 'telegram']) }
    ]

    console.log('\n📝 Adding default settings...')
    for (const setting of defaultSettings) {
      if (existingKeys.has(setting.key)) {
        console.log(`⏭️  Skipping existing: ${setting.key}`)
      } else {
        await settingsSheet.addRow(setting)
        console.log(`✅ Added: ${setting.key}`)
      }
    }

    console.log('\n✅ Settings initialization complete!')
    console.log('\n📊 Current settings:')
    const allRows = await settingsSheet.getRows()
    if (allRows.length === 0) {
      console.log('  No settings found')
    } else {
      allRows.forEach(row => {
        const key = row.get('key')
        const value = row.get('value')
        console.log(`  ${key}: ${value?.substring(0, 50)}${value?.length > 50 ? '...' : ''}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

initSettings()
