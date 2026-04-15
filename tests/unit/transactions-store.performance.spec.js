import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTransactionsStore } from '@/stores/transactions'

const addDocMock = vi.fn()
const updateDocMock = vi.fn()
const deleteDocMock = vi.fn()
const timestampFromDateMock = vi.fn((date) => ({ toDate: () => date }))

vi.mock('@/firebase', () => ({
  db: {},
  firebaseConfigError: null,
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'transactions-collection'),
  getDocs: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  addDoc: (...args) => addDocMock(...args),
  updateDoc: (...args) => updateDocMock(...args),
  deleteDoc: (...args) => deleteDocMock(...args),
  doc: vi.fn((_db, collectionName, id) => `${collectionName}/${id}`),
  Timestamp: {
    fromDate: (...args) => timestampFromDateMock(...args),
  },
}))

function basePayload() {
  return {
    type: 'expense',
    amount: 25,
    category: 'Groceries',
    date: new Date('2026-04-09T00:00:00.000Z'),
    userId: 'user-1',
    merchant: 'Store',
    note: 'Weekly shop',
  }
}

describe('Transactions store NF-01 performance behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('completes save in under 2 seconds on a fast response', async () => {
    const store = useTransactionsStore()
    addDocMock.mockResolvedValue({ id: 'saved-1' })

    const start = Date.now()
    const result = await store.addTransaction(basePayload())
    const durationMs = Date.now() - start

    expect(durationMs).toBeLessThan(2000)
    expect(result.id).toBe('saved-1')
    expect(store.transactions[0].id).toBe('saved-1')
  })

  it('shows optimistic save state immediately and rolls back on 2-second timeout', async () => {
    vi.useFakeTimers()

    const store = useTransactionsStore()
    addDocMock.mockImplementation(() => new Promise(() => {}))

    const savePromise = store.addTransaction(basePayload())
    const saveRejection = expect(savePromise).rejects.toThrow('Save operation timed out after 2 seconds')

    expect(store.transactions).toHaveLength(1)
    expect(store.transactions[0].id.startsWith('_temp_')).toBe(true)

    await vi.advanceTimersByTimeAsync(2000)

    await saveRejection
    expect(store.transactions).toHaveLength(0)
  })

  it('rolls back optimistic edit when update exceeds 2 seconds', async () => {
    vi.useFakeTimers()

    const store = useTransactionsStore()
    store.transactions = [
      {
        id: 'txn-1',
        type: 'expense',
        amount: 100,
        category: 'Groceries',
        date: new Date('2026-04-09T00:00:00.000Z'),
      },
    ]

    updateDocMock.mockImplementation(() => new Promise(() => {}))

    const updated = {
      type: 'expense',
      amount: 180,
      category: 'Groceries',
      date: new Date('2026-04-09T00:00:00.000Z'),
    }

    const updatePromise = store.updateTransaction('txn-1', updated)
    const updateRejection = expect(updatePromise).rejects.toThrow('Update operation timed out after 2 seconds')

    expect(store.transactions[0].amount).toBe(180)

    await vi.advanceTimersByTimeAsync(2000)

    await updateRejection
    expect(store.transactions[0].amount).toBe(100)
  })

  it('rolls back optimistic delete when delete exceeds 2 seconds', async () => {
    vi.useFakeTimers()

    const store = useTransactionsStore()
    store.transactions = [
      {
        id: 'txn-1',
        type: 'expense',
        amount: 100,
        category: 'Groceries',
        date: new Date('2026-04-09T00:00:00.000Z'),
      },
    ]

    deleteDocMock.mockImplementation(() => new Promise(() => {}))

    const deletePromise = store.deleteTransaction('txn-1')
    const deleteRejection = expect(deletePromise).rejects.toThrow('Delete operation timed out after 2 seconds')

    expect(store.transactions).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(2000)

    await deleteRejection
    expect(store.transactions).toHaveLength(1)
    expect(store.transactions[0].id).toBe('txn-1')
  })
})
