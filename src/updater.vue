// src/stores/transactionStore.js
import { defineStore } from 'pinia';
import { ED } from '../services/EditDelete.vue';

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    loading: false
  }),
  getters: {
    totalIncome: (state) => state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: (state) => state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    netCashflow() {
      return this.totalIncome - this.totalExpenses;
    }
  },
  actions: {
    init(userId) {
      this.loading = true;
      
      this.stopReading = TransactionService.readingTransactions(userId, (data) => {
        this.transactions = data;
        this.loading = false;
      });
    }
  }
});
