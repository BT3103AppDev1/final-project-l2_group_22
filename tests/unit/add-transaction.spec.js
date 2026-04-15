import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddTransaction from '@/views/AddTransaction.vue'

let transactionsStoreMock
let authStoreMock
let categoriesStoreMock

vi.mock('@/stores/transactions', () => ({
  useTransactionsStore: () => transactionsStoreMock,
}))

vi.mock('@/stores/AuthStore', () => ({
  useAuthStore: () => authStoreMock,
}))

vi.mock('@/stores/categories', () => ({
  useCategoriesStore: () => categoriesStoreMock,
}))

function mountAddTransaction(queryType = 'expense') {
  const push = vi.fn()

  const wrapper = shallowMount(AddTransaction, {
    global: {
      mocks: {
        $route: { query: queryType ? { type: queryType } : {} },
        $router: { push },
      },
      stubs: {
        BottomNav: true,
      },
    },
  })

  return { wrapper, push }
}

describe('AddTransaction requirements', () => {
  beforeEach(() => {
    transactionsStoreMock = {
      addTransaction: vi.fn().mockResolvedValue({ id: 'txn-1' }),
    }

    authStoreMock = {
      currentUserId: 'user-1',
    }

    categoriesStoreMock = {
      categories: [
        { id: 'e1', type: 'expense', name: 'Groceries' },
        { id: 'e2', type: 'expense', name: 'Dining' },
        { id: 'i1', type: 'income', name: 'Salary' },
      ],
      fetchCategories: vi.fn().mockResolvedValue(undefined),
    }

    vi.stubGlobal('alert', vi.fn())
  })

  it('pre-selects Income when page is opened from + Add Income', async () => {
    const { wrapper } = mountAddTransaction('income')
    await nextTick()

    expect(wrapper.vm.type).toBe('income')
  })

  it('allows type toggle and clears incompatible category', async () => {
    const { wrapper } = mountAddTransaction('income')
    wrapper.vm.category = 'Salary'

    wrapper.vm.handleTypeChange('expense')
    await nextTick()

    expect(wrapper.vm.type).toBe('expense')
    expect(wrapper.vm.category).toBe('')
  })

  it('blocks save and shows field-level errors for missing/invalid required fields', async () => {
    const { wrapper } = mountAddTransaction('expense')

    wrapper.vm.amount = ''
    wrapper.vm.category = ''
    wrapper.vm.clearDate()

    await wrapper.vm.handleSave()
    await nextTick()

    expect(transactionsStoreMock.addTransaction).not.toHaveBeenCalled()
    expect(wrapper.vm.errors.amount).toBe('Amount is required')
    expect(wrapper.vm.errors.category).toBe('Please select a category')
    expect(wrapper.vm.errors.date).toBe('Please select a date')
    expect(wrapper.findAll('.error-text').length).toBeGreaterThan(0)
  })

  it('persists valid transaction and navigates back to transactions tab', async () => {
    const { wrapper, push } = mountAddTransaction('income')

    wrapper.vm.amount = '1200.50'
    wrapper.vm.category = 'Salary'
    wrapper.vm.dateObj = new Date('2026-04-09T00:00:00.000Z')
    wrapper.vm.merchant = '  Acme Corp  '
    wrapper.vm.notes = '  April payroll  '

    await wrapper.vm.handleSave()

    expect(transactionsStoreMock.addTransaction).toHaveBeenCalledWith({
      type: 'income',
      amount: '1200.50',
      category: 'Salary',
      date: expect.any(Date),
      userId: 'user-1',
      merchant: 'Acme Corp',
      note: 'April payroll',
    })
    expect(push).toHaveBeenCalledWith('/transactions?tab=income')
    expect(window.alert).toHaveBeenCalled()
  })

  it('loads categories for the current user on mount', async () => {
    mountAddTransaction('expense')
    await Promise.resolve()

    expect(categoriesStoreMock.fetchCategories).toHaveBeenCalledWith('user-1')
  })
})
