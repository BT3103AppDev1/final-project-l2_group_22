/**
 * Transaction Calculation Utilities
 * Implements NF-03: Data Integrity requirements
 */

/**
 * Calculate total income from all transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Sum of all income transaction amounts
 */
export function calculateTotalIncome(transactions) {
  if (!Array.isArray(transactions)) return 0
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
}

/**
 * Calculate total expenses from all transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Sum of all expense transaction amounts
 */
export function calculateTotalExpenses(transactions) {
  if (!Array.isArray(transactions)) return 0
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
}

/**
 * Calculate net cashflow (income - expenses)
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Net cashflow amount
 */
export function calculateNetCashflow(transactions) {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions)
}

/**
 * Validate transaction object has all required fields
 * @param {Object} transaction - Transaction object to validate
 * @returns {boolean} True if transaction is valid
 */
export function isValidTransaction(transaction) {
  if (!transaction || typeof transaction !== 'object') return false

  const hasRequiredFields =
    typeof transaction.type === 'string' &&
    !isNaN(Number(transaction.amount)) &&
    typeof transaction.category === 'string' &&
    (transaction.date instanceof Date || transaction.date.toDate)

  return hasRequiredFields
}

/**
 * Format transaction amount as currency
 * @param {number} amount - Amount to format
 * @param {string} type - Transaction type ('income' or 'expense')
 * @returns {string} Formatted currency string with sign
 */
export function formatCurrencyAmount(amount, type) {
  const sign = type === 'expense' ? '−' : '+'
  const formatted = Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })
  return `${sign}$${formatted}`
}

/**
 * Format date as ISO string
 * @param {Date|Timestamp} date - Date to format
 * @returns {string} ISO format date string (YYYY-MM-DD)
 */
export function formatDateToISO(date) {
  if (!date) return ''

  // Handle Firestore Timestamp
  if (date.toDate) {
    date = date.toDate()
  }

  // Convert to Date if string
  if (typeof date === 'string') {
    date = new Date(date)
  }

  if (!(date instanceof Date)) return ''

  return date.toISOString().split('T')[0]
}

/**
 * Get summary of transactions by type
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Summary with income, expenses, and net cashflow
 */
export function getTransactionSummary(transactions) {
  return {
    totalIncome: calculateTotalIncome(transactions),
    totalExpenses: calculateTotalExpenses(transactions),
    netCashflow: calculateNetCashflow(transactions),
    incomeCount: transactions.filter(t => t.type === 'income').length,
    expenseCount: transactions.filter(t => t.type === 'expense').length,
    totalCount: transactions.length
  }
}
