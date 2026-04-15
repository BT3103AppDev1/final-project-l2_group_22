import { defineStore } from 'pinia'
import { db, firebaseConfigError } from '@/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { fetchExchangeRate } from '@/services/googleCurrencyService'

const LOCAL_STORAGE_KEY = 'bt3103_currency_preference'
const DEFAULT_BASE_CURRENCY = 'SGD'
const DEFAULT_DISPLAY_CURRENCY = 'SGD'

const SUPPORTED_CURRENCIES = [
  { code: 'SGD', label: 'Singapore Dollar' },
  { code: 'USD', label: 'US Dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'MYR', label: 'Malaysian Ringgit' },
  { code: 'VND', label: 'Vietnamese Dong' },
  { code: 'THB', label: 'Thai Baht' }
]

function normalizeCurrencyCode(input) {
  const value = String(input || '').toUpperCase().trim()
  const exists = SUPPORTED_CURRENCIES.some(currency => currency.code === value)
  return exists ? value : DEFAULT_DISPLAY_CURRENCY
}

function toNumericAmount(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getCurrencySymbol(code) {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).formatToParts(0)

    return parts.find(part => part.type === 'currency')?.value || code
  } catch {
    return code
  }
}

export const useCurrencyStore = defineStore('currency', {
  state: () => ({
    baseCurrency: DEFAULT_BASE_CURRENCY,
    selectedCurrency: DEFAULT_DISPLAY_CURRENCY,
    rates: {
      [DEFAULT_BASE_CURRENCY]: 1
    },
    isLoading: false,
    error: '',
    lastUpdatedAt: null,
    initializedUserId: null,
    supportedCurrencies: SUPPORTED_CURRENCIES
  }),

  getters: {
    currentRate: (state) => {
      const rate = Number(state.rates[state.selectedCurrency])
      return Number.isFinite(rate) && rate > 0 ? rate : 1
    },

    currencySymbol: (state) => getCurrencySymbol(state.selectedCurrency),

    exchangeRateLabel: (state) => {
      const rate = Number(state.rates[state.selectedCurrency])
      const safeRate = Number.isFinite(rate) && rate > 0 ? rate : 1
      return `1 ${state.baseCurrency} = ${safeRate.toFixed(4)} ${state.selectedCurrency}`
    }
  },

  actions: {
    async init(userId = null) {
      if (this.initializedUserId === userId && this.rates[this.selectedCurrency]) {
        return
      }

      let preferred = normalizeCurrencyCode(localStorage.getItem(LOCAL_STORAGE_KEY))

      if (userId && !firebaseConfigError && db) {
        try {
          const preferenceRef = doc(db, 'user_preferences', userId)
          const snapshot = await getDoc(preferenceRef)
          const fromDb = normalizeCurrencyCode(snapshot.data()?.currency)
          if (snapshot.exists() && fromDb) {
            preferred = fromDb
          }
        } catch {
          // Keep local preference when remote read fails.
        }
      }

      this.selectedCurrency = preferred
      localStorage.setItem(LOCAL_STORAGE_KEY, preferred)
      this.initializedUserId = userId
      await this.refreshExchangeRate(preferred)
    },

    async setSelectedCurrency(code, userId = null) {
      const normalized = normalizeCurrencyCode(code)
      this.selectedCurrency = normalized
      this.error = ''
      localStorage.setItem(LOCAL_STORAGE_KEY, normalized)

      if (userId && !firebaseConfigError && db) {
        try {
          const preferenceRef = doc(db, 'user_preferences', userId)
          await setDoc(preferenceRef, {
            currency: normalized,
            updatedAt: serverTimestamp()
          }, { merge: true })
        } catch {
          // Local persistence remains available even if remote write fails.
        }
      }

      await this.refreshExchangeRate(normalized)
    },

    async refreshExchangeRate(targetCurrency = null) {
      const target = normalizeCurrencyCode(targetCurrency || this.selectedCurrency)

      if (target === this.baseCurrency) {
        this.rates[target] = 1
        this.lastUpdatedAt = Date.now()
        this.error = ''
        return
      }

      this.isLoading = true
      this.error = ''

      try {
        const rate = await fetchExchangeRate(this.baseCurrency, target)
        this.rates[target] = rate
        this.lastUpdatedAt = Date.now()
      } catch (error) {
        this.error = error?.message || 'Failed to refresh currency exchange rate.'
      } finally {
        this.isLoading = false
      }
    },

    convertFromBase(amount) {
      const numericAmount = toNumericAmount(amount)
      return numericAmount * this.currentRate
    },

    convertToBase(amount) {
      const numericAmount = toNumericAmount(amount)
      const rate = this.currentRate
      return rate > 0 ? numericAmount / rate : numericAmount
    },

    formatAmount(amount, options = {}) {
      const {
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
        notation = 'standard'
      } = options

      const converted = this.convertFromBase(amount)

      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: this.selectedCurrency,
        minimumFractionDigits,
        maximumFractionDigits,
        notation
      }).format(converted)
    },

    formatSignedAmount(amount, type = 'income', options = {}) {
      const sign = type === 'expense' ? '−' : '+'
      return `${sign}${this.formatAmount(amount, options)}`
    },

    formatSignedValue(amount, options = {}) {
      const numericAmount = toNumericAmount(amount)
      if (numericAmount < 0) {
        return `−${this.formatAmount(Math.abs(numericAmount), options)}`
      }
      return `+${this.formatAmount(numericAmount, options)}`
    }
  }
})
