import { defineStore } from 'pinia';
import { ED } from '../services/editDelete.js';

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    loading: false,
    stopReading: null 
  }),
  getters: {
    totalIncome: (state) => state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: (state) => state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    netCashflow() {
      // 'this' works here to combine other getters
      return this.totalIncome - this.totalExpenses;
    }
  },
  actions: {
    init(userId) {
      // If there's an existing listener, stop it first to avoid duplicates
      if (this.stopReading) this.stopReading();

      this.loading = true;
      
      // We use 'ED' because that is what you imported from your service
      this.stopReading = ED.readingTransactions(userId, (data) => {
        this.transactions = data;
        this.loading = false;
      });
    },
    // Useful for when a user logs out
    cleanup() {
      if (this.stopReading) {
        this.stopReading();
        this.stopReading = null;
      }
    }
  }
});
