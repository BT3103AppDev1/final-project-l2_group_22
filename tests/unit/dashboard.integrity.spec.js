import { shallowMount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Dashboard from '@/views/Dashboard.vue'

let transactionsStoreMock
let authStoreMock
let goalStoreMock

vi.mock('@/stores/transactions', () => ({
  useTransactionsStore: () => transactionsStoreMock,
}))

vi.mock('@/stores/AuthStore', () => ({
  useAuthStore: () => authStoreMock,
}))

vi.mock('@/stores/GoalStore', () => ({
  useGoalStore: () => goalStoreMock,
}))

function currentMonthDate(day) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), day)
}

function mountDashboard() {
  return shallowMount(Dashboard, {
    global: {
      stubs: {
        BottomNav: true,
        RouterLink: true,
      },
    },
  })
}

describe('Dashboard integrity requirements', () => {
  beforeEach(() => {
    transactionsStoreMock = reactive({
      loading: false,
      transactions: [
        { id: 'i1', type: 'income', amount: 3000, category: 'Salary', date: currentMonthDate(2) },
        { id: 'e1', type: 'expense', amount: 900, category: 'Groceries', date: currentMonthDate(4) },
        { id: 'e2', type: 'expense', amount: 300, category: 'Dining', date: currentMonthDate(7) },
      ],
      fetchTransactions: vi.fn(),
    })

    authStoreMock = {
      currentUserId: 'user-1',
    }

    goalStoreMock = reactive({
      loading: false,
      goals: [{ id: 'g1', type: 'Monthly Total Spending Cap', targetAmount: 1500 }],
      formattedGoals: [{ id: 'g1', type: 'Monthly Total Spending Cap', targetAmount: 1500, displayName: 'Monthly Total Spending Cap' }],
      init: vi.fn(),
      goalActual: vi.fn((goal, transactions) =>
        transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
      ),
      goalStatus: vi.fn((actual, target) => {
        if (actual >= target) return 'Exceeded'
        if (actual >= target * 0.8) return 'At risk'
        return 'On track'
      }),
    })
  })

  it('reconciles dashboard totals exactly with current period transactions', () => {
    const wrapper = mountDashboard()

    expect(wrapper.vm.periodIncome).toBe(3000)
    expect(wrapper.vm.periodExpenses).toBe(1200)
    expect(wrapper.vm.periodNetCashflow).toBe(1800)

    const incomeSum = wrapper.vm.periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expenseSum = wrapper.vm.periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    expect(incomeSum).toBe(wrapper.vm.periodIncome)
    expect(expenseSum).toBe(wrapper.vm.periodExpenses)
    expect(incomeSum - expenseSum).toBe(wrapper.vm.periodNetCashflow)
  })

  it('updates dashboard metrics and goal cards after create/edit/delete-like changes', async () => {
    const wrapper = mountDashboard()

    transactionsStoreMock.transactions.push({
      id: 'e3',
      type: 'expense',
      amount: 100,
      category: 'Transport',
      date: currentMonthDate(9),
    })
    await nextTick()
    expect(wrapper.vm.periodExpenses).toBe(1300)
    expect(wrapper.vm.goalProgress[0].actual).toBe(1300)

    const editTarget = transactionsStoreMock.transactions.find((t) => t.id === 'e1')
    editTarget.amount = 700
    await nextTick()
    expect(wrapper.vm.periodExpenses).toBe(1100)
    expect(wrapper.vm.goalProgress[0].actual).toBe(1100)

    const removeIndex = transactionsStoreMock.transactions.findIndex((t) => t.id === 'e2')
    transactionsStoreMock.transactions.splice(removeIndex, 1)
    await nextTick()
    expect(wrapper.vm.periodExpenses).toBe(800)
    expect(wrapper.vm.goalProgress[0].actual).toBe(800)
  })
})
