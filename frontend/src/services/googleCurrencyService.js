const GOOGLE_FINANCE_QUOTE_URL = 'https://www.google.com/finance/quote'
const CORS_PROXY_URL = 'https://api.allorigins.win/raw?url='

function parseRateFromGoogleHtml(html) {
  if (!html || typeof html !== 'string') {
    return null
  }

  const patterns = [
    /data-last-price="([0-9.,]+)"/i,
    /"price"\s*:\s*"([0-9.,]+)"/i,
    /class="[^\"]*YMlKec[^\"]*"[^>]*>\s*([0-9.,]+)/i,
    /<div[^>]*class="[^\"]*P6K39c[^\"]*"[^>]*>\s*([0-9.,]+)/i
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (!match || !match[1]) continue

    const normalized = match[1].replace(/,/g, '')
    const rate = Number(normalized)
    if (Number.isFinite(rate) && rate > 0) {
      return rate
    }
  }

  return null
}

async function fetchRateFromGoogle(baseCurrency, targetCurrency) {
  const googleUrl = `${GOOGLE_FINANCE_QUOTE_URL}/${baseCurrency}-${targetCurrency}`
  const proxyUrl = `${CORS_PROXY_URL}${encodeURIComponent(googleUrl)}`

  const response = await fetch(proxyUrl)
  if (!response.ok) {
    throw new Error(`Google currency request failed with status ${response.status}`)
  }

  const html = await response.text()
  const parsedRate = parseRateFromGoogleHtml(html)
  if (!parsedRate) {
    throw new Error('Could not parse currency rate from Google response')
  }

  return parsedRate
}

async function fetchRateFallback(baseCurrency, targetCurrency) {
  const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`)
  if (!response.ok) {
    throw new Error(`Fallback currency request failed with status ${response.status}`)
  }

  const data = await response.json()
  const fallbackRate = Number(data?.rates?.[targetCurrency])
  if (!Number.isFinite(fallbackRate) || fallbackRate <= 0) {
    throw new Error('Fallback rate was not available')
  }

  return fallbackRate
}

export async function fetchExchangeRate(baseCurrency, targetCurrency) {
  const from = String(baseCurrency || '').toUpperCase()
  const to = String(targetCurrency || '').toUpperCase()

  if (!from || !to) {
    throw new Error('Both baseCurrency and targetCurrency are required')
  }

  if (from === to) {
    return 1
  }

  try {
    return await fetchRateFromGoogle(from, to)
  } catch {
    return await fetchRateFallback(from, to)
  }
}
