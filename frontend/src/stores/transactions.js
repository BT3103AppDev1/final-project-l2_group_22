import { defineStore } from 'pinia'
import { db, firebaseConfigError } from '@/firebase'
import { collection, getDocs, query, orderBy, where, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { calculateTotalIncome, calculateTotalExpenses, calculateNetCashflow } from '@/utils/calculations'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Calculate total income from all transactions
     */
    totalIncome: (state) => calculateTotalIncome(state.transactions),

    /**
     * Calculate total expenses from all transactions
     */
    totalExpenses: (state) => calculateTotalExpenses(state.transactions),

    /**
     * Calculate net cashflow (income - expenses)
     */
    netCashflow: (state) => calculateNetCashflow(state.transactions),

    /**
     * Get count of income transactions
     */
    incomeCount: (state) => state.transactions.filter(t => t.type === 'income').length,

    /**
     * Get count of expense transactions
     */
    expenseCount: (state) => state.transactions.filter(t => t.type === 'expense').length,

    /**
     * Get transaction summary object
     */
    summary: (state) => ({
      totalIncome: calculateTotalIncome(state.transactions),
      totalExpenses: calculateTotalExpenses(state.transactions),
      netCashflow: calculateNetCashflow(state.transactions),
      incomeCount: state.transactions.filter(t => t.type === 'income').length,
      expenseCount: state.transactions.filter(t => t.type === 'expense').length,
      totalCount: state.transactions.length
    })
  },
  actions: {
    async fetchTransactions(userId) {
      if (firebaseConfigError) {
        this.error = firebaseConfigError
        return
      }
      if (!userId) {
        this.transactions = []
        return
      }
      this.loading = true
      this.error = null
      try {
        const q = query(collection(db, 'transactions'), where('userId', '==', userId), orderBy('date', 'desc'))
        const snapshot = await getDocs(q)
        this.transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    async addTransaction(payload) {
      if (firebaseConfigError) {
        this.error = firebaseConfigError
        throw new Error(firebaseConfigError)
      }

      const docData = {
        type: payload.type,
        amount: Number(payload.amount),
        category: payload.category,
        date: Timestamp.fromDate(payload.date),
        ...(payload.userId ? { userId: payload.userId } : {}),
        ...(payload.merchant ? { merchant: payload.merchant } : {}),
        ...(payload.note ? { note: payload.note } : {})
      }

      // Add transaction optimistically to store immediately for instant feedback
      const optimisticTransaction = { id: `_temp_${Date.now()}`, ...docData }
      this.transactions.unshift(optimisticTransaction)

      try {
        // Implement 2-second timeout for save operation (NF-01 requirement)
        const savePromise = addDoc(collection(db, 'transactions'), docData)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Save operation timed out after 2 seconds')), 2000)
        )

        const ref = await Promise.race([savePromise, timeoutPromise])

        // Replace optimistic transaction with real one
        const index = this.transactions.findIndex(t => t.id === optimisticTransaction.id)
        if (index !== -1) {
          this.transactions[index] = { id: ref.id, ...docData }
        }

        return { id: ref.id, ...docData }
      } catch (e) {
        // Rollback optimistic update on error
        this.transactions = this.transactions.filter(t => t.id !== optimisticTransaction.id)
        this.error = e.message
        throw e
      }
    },

    async updateTransaction(id, updatedData) {
      if (firebaseConfigError) {
        this.error = firebaseConfigError
        throw new Error(firebaseConfigError)
      }

      // Optimistic update: replace transaction in store immediately
      const index = this.transactions.findIndex(t => t.id === id)
      const original = index !== -1 ? this.transactions[index] : null
      if (index !== -1) {
        this.transactions[index] = { id, ...updatedData }
      }

      try {
        const updatePromise = updateDoc(doc(db, 'transactions', id), updatedData)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Update operation timed out after 2 seconds')), 2000)
        )
        await Promise.race([updatePromise, timeoutPromise])
      } catch (e) {
        // Rollback optimistic update on error
        if (index !== -1 && original) {
          this.transactions[index] = original
        }
        this.error = e.message
        throw e
      }
    },

    async deleteTransaction(id) {
      if (firebaseConfigError) {
        this.error = firebaseConfigError
        throw new Error(firebaseConfigError)
      }

      // Optimistic removal: remove transaction from store immediately
      const index = this.transactions.findIndex(t => t.id === id)
      const original = index !== -1 ? this.transactions[index] : null
      if (index !== -1) {
        this.transactions.splice(index, 1)
      }

      try {
        const deletePromise = deleteDoc(doc(db, 'transactions', id))
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Delete operation timed out after 2 seconds')), 2000)
        )
        await Promise.race([deletePromise, timeoutPromise])
      } catch (e) {
        // Rollback optimistic removal on error
        if (index !== -1 && original) {
          this.transactions.splice(index, 0, original)
        }
        this.error = e.message
        throw e
      }
    },

    async deleteTransactionsByPeriod({ userId, startDate = null, endDate = null, allTime = false, transactionType = null }) {
      if (firebaseConfigError) {
        this.error = firebaseConfigError
        throw new Error(firebaseConfigError)
      }

      if (!userId) {
        return 0
      }

      const resolveDate = (transaction) => {
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

      const inSelectedPeriod = (transaction) => {
        if (transaction?.userId !== userId) {
          return false
        }

        if (transactionType && transaction?.type !== transactionType) {
          return false
        }

        if (allTime) {
          return true
        }

        const date = resolveDate(transaction)
        if (!date || !startDate || !endDate) {
          return false
        }

        return date >= startDate && date <= endDate
      }

      const idsToDelete = this.transactions
        .filter(inSelectedPeriod)
        .map(t => t.id)
        .filter(id => Boolean(id) && !String(id).startsWith('_temp_'))

      if (!idsToDelete.length) {
        return 0
      }

      const idSet = new Set(idsToDelete)
      const original = [...this.transactions]
      this.transactions = this.transactions.filter(t => !idSet.has(t.id))

      try {
        const deletePromise = Promise.all(idsToDelete.map(id => deleteDoc(doc(db, 'transactions', id))))
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Bulk delete operation timed out after 6 seconds')), 6000)
        )

        await Promise.race([deletePromise, timeoutPromise])
        return idsToDelete.length
      } catch (e) {
        this.transactions = original
        this.error = e.message
        throw e
      }
    }
  }
})
