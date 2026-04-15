import { describe, expect, it } from 'vitest'
import {
  calculateNetCashflow,
  calculateTotalExpenses,
  calculateTotalIncome,
  getTransactionSummary,
} from '@/utils/calculations'

describe('Data integrity calculations (NF-03)', () => {
  it('computes exact income, expense, and net totals from transactions', () => {
    const transactions = [
      { id: '1', type: 'income', amount: 3000 },
      { id: '2', type: 'income', amount: 500 },
      { id: '3', type: 'expense', amount: 1200 },
      { id: '4', type: 'expense', amount: 350 },
    ]

    expect(calculateTotalIncome(transactions)).toBe(3500)
    expect(calculateTotalExpenses(transactions)).toBe(1550)
    expect(calculateNetCashflow(transactions)).toBe(1950)
  })

  it('returns consistent summary totals and counts', () => {
    const transactions = [
      { id: '1', type: 'income', amount: '1000' },
      { id: '2', type: 'expense', amount: '125' },
      { id: '3', type: 'expense', amount: 75 },
    ]

    const summary = getTransactionSummary(transactions)

    expect(summary.totalIncome).toBe(1000)
    expect(summary.totalExpenses).toBe(200)
    expect(summary.netCashflow).toBe(800)
    expect(summary.incomeCount).toBe(1)
    expect(summary.expenseCount).toBe(2)
    expect(summary.totalCount).toBe(3)
  })

  it('handles invalid input safely', () => {
    expect(calculateTotalIncome(null)).toBe(0)
    expect(calculateTotalExpenses(undefined)).toBe(0)
    expect(calculateNetCashflow([])).toBe(0)
  })
})
