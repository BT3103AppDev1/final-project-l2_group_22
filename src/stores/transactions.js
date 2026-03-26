import { defineStore } from 'pinia'
import { db, firebaseConfigError } from '@/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchTransactions() {
      if (firebaseConfigError) {
        this.error = firebaseConfigError
        return
      }
      this.loading = true
      this.error = null
      try {
        const q = query(collection(db, 'transactions'), orderBy('date', 'desc'))
        const snapshot = await getDocs(q)
        this.transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    }
  }
})
