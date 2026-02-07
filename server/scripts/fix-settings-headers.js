import dotenv from 'dotenv'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from server directory
const envPath = path.resolve(__dirname, '../.env')
dotenv.config({ path: envPath })

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
]

const jwt = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: SCOPES,
})

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt)

async function fixSettingsHeaders() {
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
    console.log('📊 Current headers:', settingsSheet.headerValues)

    // Удаляем старый лист и создаем новый с правильными заголовками
    console.log('\n🗑️  Deleting old settings sheet...')
    await settingsSheet.delete()
    
    console.log('📝 Creating new settings sheet with correct headers...')
    const newSheet = await doc.addSheet({
      title: 'settings',
      headerValues: ['key', 'value']
    })

    console.log('✅ New settings sheet created!')
    
    // Добавляем начальные данные
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
      await newSheet.addRow(setting)
      console.log(`✅ Added: ${setting.key} = ${setting.value.substring(0, 50)}${setting.value.length > 50 ? '...' : ''}`)
    }

    console.log('\n✅ Settings sheet fixed successfully!')
    
    // Проверяем результат
    await newSheet.loadHeaderRow()
    console.log('\n📊 New headers:', newSheet.headerValues)
    
    const rows = await newSheet.getRows()
    console.log(`\n📝 Total rows: ${rows.length}`)
    console.log('\n📋 Verification:')
    rows.forEach(row => {
      console.log(`  ${row.get('key')}: ${row.get('value')?.substring(0, 50)}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixSettingsHeaders()
