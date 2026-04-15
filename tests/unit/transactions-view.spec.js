import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Transactions from '@/views/Transactions.vue'

let transactionsStoreMock
let authStoreMock

vi.mock('@/stores/transactions', () => ({
  useTransactionsStore: () => transactionsStoreMock,
}))

vi.mock('@/stores/AuthStore', () => ({
  useAuthStore: () => authStoreMock,
}))

function mountTransactions(routeQuery = {}) {
  const push = vi.fn()

  const wrapper = shallowMount(Transactions, {
    global: {
      mocks: {
        $route: { query: routeQuery },
        $router: { push },
      },
      stubs: {
        BottomNav: true,
        TransactionItem: true,
        EmptyState: true,
      },
    },
  })

  return { wrapper, push }
}

describe('Transactions list requirements', () => {
  beforeEach(() => {
    transactionsStoreMock = {
      loading: false,
      transactions: [],
      fetchTransactions: vi.fn(),
    }

    authStoreMock = {
      currentUserId: 'user-1',
    }
  })

  it('fetches transactions for the logged-in user', () => {
    mountTransactions()

    expect(transactionsStoreMock.fetchTransactions).toHaveBeenCalledWith('user-1')
  })

  it('opens Add Transaction with Expense type from the Expenses tab', async () => {
    const { wrapper, push } = mountTransactions()

    await wrapper.find('.fab').trigger('click')

    expect(push).toHaveBeenCalledWith('/transactions/add?type=expense')
  })

  it('opens Add Transaction with Income type from the Income tab', async () => {
    const { wrapper, push } = mountTransactions()

    const tabButtons = wrapper.findAll('.tab-button')
    await tabButtons[1].trigger('click')
    await wrapper.find('.fab').trigger('click')

    expect(wrapper.vm.activeTab).toBe('income')
    expect(push).toHaveBeenCalledWith('/transactions/add?type=income')
  })

  it('filters 5,000 transactions by tab within 1 second', () => {
    transactionsStoreMock.transactions = Array.from({ length: 5000 }, (_, index) => ({
      id: `txn-${index}`,
      type: index % 2 === 0 ? 'expense' : 'income',
      amount: index + 1,
      category: 'Test',
      date: new Date(),
    }))

    const { wrapper } = mountTransactions()

    const start = performance.now()
    const filtered = wrapper.vm.filteredTransactions
    const durationMs = performance.now() - start

    expect(filtered.length).toBe(2500)
    expect(durationMs).toBeLessThan(1000)
  })
})
