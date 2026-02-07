const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN

function normalizeBaseUrl(url) {
  if (!url) return ''
  return url.endsWith('/') ? url.slice(0, -1) : url
}

async function setWebhook() {
  if (!BOT_TOKEN) {
    console.error('BOT_TOKEN / TELEGRAM_BOT_TOKEN is not set')
    process.exit(1)
  }

  const argBaseUrl = process.argv[2]
  const baseUrl = normalizeBaseUrl(
    argBaseUrl || process.env.WEBHOOK_BASE_URL || process.env.WEB_APP_URL || process.env.VITE_WEB_APP_URL
  )

  if (!baseUrl) {
    console.error('Base URL is not set. Provide as argument or set WEBHOOK_BASE_URL/WEB_APP_URL')
    console.error('Example: node api/bot/set-webhook.js https://flashapp-beta.vercel.app')
    process.exit(1)
  }

  const webhookUrl = `${baseUrl}/api`

  const setUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
  console.log('Setting webhook to:', webhookUrl)

  const setRes = await fetch(setUrl, { method: 'POST' })
  const setData = await setRes.json().catch(() => ({}))
  console.log('setWebhook response:', setData)

  const infoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
  const infoRes = await fetch(infoUrl)
  const infoData = await infoRes.json().catch(() => ({}))
  console.log('getWebhookInfo response:', infoData)
}

setWebhook().catch((err) => {
  console.error('Failed to set webhook:', err)
  process.exit(1)
})
