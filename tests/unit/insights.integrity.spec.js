import { shallowMount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Insights from '@/views/Insights.vue'

let transactionsStoreMock
let authStoreMock

vi.mock('@/stores/transactions', () => ({
  useTransactionsStore: () => transactionsStoreMock,
}))

vi.mock('@/stores/AuthStore', () => ({
  useAuthStore: () => authStoreMock,
}))

function currentMonthDate(day) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), day)
}

function previousMonthDate(day) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - 1, day)
}

function mountInsights() {
  return shallowMount(Insights, {
    global: {
      stubs: {
        BottomNav: true,
        NetCashFlowExplanation: true,
        TopSpendingCategoriesExplanation: true,
        SpendingTrendsExplanation: true,
        IncomeVolatilityExplanation: true,
        CategoryVolatilityExplanation: true,
        RecurringExpensesExplanation: true,
        WeekdaySpendingExplanation: true,
        SeasonalSpendingExplanation: true,
      },
    },
  })
}

describe('Insights data integrity requirements', () => {
  beforeEach(() => {
    transactionsStoreMock = reactive({
      loading: false,
      transactions: [
        { id: 'income-1', type: 'income', amount: 3000, category: 'Salary', date: currentMonthDate(3) },
        { id: 'expense-1', type: 'expense', amount: 1000, category: 'Groceries', date: currentMonthDate(5) },
        { id: 'expense-2', type: 'expense', amount: 500, category: 'Dining', date: currentMonthDate(8) },
        { id: 'previous-month', type: 'expense', amount: 999, category: 'Shopping', date: previousMonthDate(12) },
      ],
      fetchTransactions: vi.fn(),
    })

    authStoreMock = {
      currentUserId: 'user-1',
    }
  })

  it('matches period totals exactly to normalized transactions', () => {
    const wrapper = mountInsights()

    expect(wrapper.vm.periodIncome).toBe(3000)
    expect(wrapper.vm.periodExpenses).toBe(1500)
    expect(wrapper.vm.periodNetCashFlow).toBe(1500)

    const reconciledExpenseTotal = wrapper.vm.periodTransactions
      .filter((item) => item.normalizedType === 'expense')
      .reduce((sum, item) => sum + item.normalizedAmount, 0)

    expect(reconciledExpenseTotal).toBe(wrapper.vm.periodExpenses)
  })

  it('keeps top category totals reconciled with period expense values', () => {
    const wrapper = mountInsights()

    const categoryTotalFromCards = wrapper.vm.topExpenseCategories
      .reduce((sum, item) => sum + item.total, 0)

    expect(categoryTotalFromCards).toBe(wrapper.vm.periodExpenses)

    const topCategory = wrapper.vm.topExpenseCategories[0]
    const topCategoryDrilldownTotal = wrapper.vm.periodTransactions
      .filter(
        (item) =>
          item.normalizedType === 'expense' &&
          item.normalizedCategory === topCategory.category,
      )
      .reduce((sum, item) => sum + item.normalizedAmount, 0)

    expect(topCategory.total).toBe(topCategoryDrilldownTotal)
  })

  it('reflects create, edit, and delete changes when revisiting the page state', async () => {
    const wrapper = mountInsights()

    transactionsStoreMock.transactions.push({
      id: 'expense-3',
      type: 'expense',
      amount: 200,
      category: 'Dining',
      date: currentMonthDate(10),
    })
    await nextTick()
    expect(wrapper.vm.periodExpenses).toBe(1700)

    const existing = transactionsStoreMock.transactions.find((t) => t.id === 'expense-1')
    existing.amount = 900
    await nextTick()
    expect(wrapper.vm.periodExpenses).toBe(1600)

    const removeIndex = transactionsStoreMock.transactions.findIndex((t) => t.id === 'expense-2')
    transactionsStoreMock.transactions.splice(removeIndex, 1)
    await nextTick()
    expect(wrapper.vm.periodExpenses).toBe(1100)
  })
})
