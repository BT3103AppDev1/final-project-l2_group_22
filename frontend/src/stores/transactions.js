import { defineStore } from 'pinia'
import { db, firebaseConfigError } from '@/firebase'
import { collection, getDocs, query, orderBy, where, addDoc, updateDoc, deleteDoc, doc, Timestamp, writeBatch } from 'firebase/firestore'
import { calculateTotalIncome, calculateTotalExpenses, calculateNetCashflow } from '@/utils/calculations'
import { generateRecurrenceDates } from '@/utils/recurrenceHelper'

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

      const baseDocData = {
        type: payload.type,
        amount: Number(payload.amount),
        category: payload.category,
        date: Timestamp.fromDate(payload.date),
        ...(payload.userId ? { userId: payload.userId } : {}),
        ...(payload.merchant ? { merchant: payload.merchant } : {}),
        ...(payload.note ? { note: payload.note } : {}),
        recurrence: payload.recurrence || 'none',
        ...(payload.recurrence && payload.recurrence !== 'none' ? {
          recurrenceEndType: payload.recurrenceEndType || 'never',
          recurrenceOccurrences: payload.recurrenceOccurrences || null,
          recurrenceEndDate: payload.recurrenceEndDate ? Timestamp.fromDate(payload.recurrenceEndDate) : null,
          baseTransactionId: null // Will be set after creating the base
        } : {})
      }

      // Generate recurring dates if applicable
      const recurrenceDates = generateRecurrenceDates(
        payload.date,
        payload.recurrence || 'none',
        payload.recurrenceEndType || 'never',
        payload.recurrenceEndDate || payload.recurrenceOccurrences || null
      )

      // Add all transactions optimistically to store
      const optimisticTransactions = recurrenceDates.map((date, idx) => ({
        id: `_temp_${Date.now()}_${idx}`,
        ...baseDocData,
        date: Timestamp.fromDate(date)
      }))

      this.transactions.unshift(...optimisticTransactions)

      try {
        // Use batch write for multiple transactions
        const batch = writeBatch(db)
        const docRefs = []

        for (const txData of optimisticTransactions.map(tx => {
          const { id, ...data } = tx
          return data
        })) {
          const docRef = doc(collection(db, 'transactions'))
          batch.set(docRef, txData)
          docRefs.push(docRef)
        }

        // Implement 2-second timeout for batch write
        const batchPromise = batch.commit()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Save operation timed out after 2 seconds')), 2000)
        )

        await Promise.race([batchPromise, timeoutPromise])

        // Fetch the saved transactions to get their IDs
        // For now, we'll just keep the optimistic data
        return { success: true, count: recurrenceDates.length }
      } catch (e) {
        // Rollback optimistic updates on error
        this.transactions = this.transactions.filter(
          t => !optimisticTransactions.find(ot => ot.id === t.id)
        )
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
