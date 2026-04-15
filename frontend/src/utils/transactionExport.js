import ExcelJS from 'exceljs'

function resolveTransactionDate(transaction) {
  const value = transaction?.date

  if (value && typeof value.toDate === 'function') {
    return value.toDate()
  }

  if (value instanceof Date) {
    return value
  }

  const parsed = value ? new Date(value) : null
  if (parsed && !Number.isNaN(parsed.getTime())) {
    return parsed
  }

  return null
}

function formatDate(date) {
  if (!(date instanceof Date)) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toAmount(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : 0
}

function csvEscape(value) {
  const stringValue = value == null ? '' : String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function normalizeRows(transactions) {
  return transactions
    .map(transaction => {
      const date = resolveTransactionDate(transaction)
      return {
        id: transaction.id || '',
        type: transaction.type || '',
        category: transaction.category || 'Uncategorized',
        date,
        dateLabel: formatDate(date),
        merchant: transaction.merchant || '',
        note: transaction.note || '',
        amount: toAmount(transaction.amount)
      }
    })
    .filter(row => row.date instanceof Date)
    .sort((a, b) => a.date - b.date)
}

export function exportTransactionsCsv(transactions, fileName = 'transactions.csv') {
  const rows = normalizeRows(transactions)
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Merchant', 'Note']
  const csvLines = [headers.join(',')]

  rows.forEach(row => {
    const line = [
      row.dateLabel,
      row.type,
      row.category,
      row.amount.toFixed(2),
      row.merchant,
      row.note
    ].map(csvEscape).join(',')

    csvLines.push(line)
  })

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function buildSheetRowsByType(normalizedRows, type) {
  const rows = normalizedRows.filter(row => row.type === type)
  const categories = [...new Set(rows.map(row => row.category).filter(Boolean))].sort((a, b) => a.localeCompare(b))

  const headers = ['Date', 'Merchant', 'Note', ...categories]
  const outputRows = rows.map(row => {
    const sheetRow = [
      row.dateLabel,
      row.merchant,
      row.note,
      ...categories.map(category => (category === row.category ? row.amount : null))
    ]
    return sheetRow
  })

  return { headers, outputRows, categories }
}

export async function exportTransactionsExcel(transactions, fileName = 'transactions.xlsx') {
  const normalizedRows = normalizeRows(transactions)
  const workbook = new ExcelJS.Workbook()

  const expenseSheet = buildSheetRowsByType(normalizedRows, 'expense')
  const incomeSheet = buildSheetRowsByType(normalizedRows, 'income')

  // Create Expenses sheet
  const expenseWorksheet = workbook.addWorksheet('Expenses')
  expenseWorksheet.columns = expenseSheet.headers.map(header => ({
    header,
    key: header,
    width: Math.max(12, String(header).length + 2)
  }))
  expenseWorksheet.addRows(expenseSheet.outputRows)

  // Create Income sheet
  const incomeWorksheet = workbook.addWorksheet('Income')
  incomeWorksheet.columns = incomeSheet.headers.map(header => ({
    header,
    key: header,
    width: Math.max(12, String(header).length + 2)
  }))
  incomeWorksheet.addRows(incomeSheet.outputRows)

  // Download file
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
