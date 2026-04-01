<template>
  <div class="web-page">
    <header class="page-header">
      <h1>Dashboard</h1>
    </header>

    <main class="page-content">
      <!-- Loading State -->
      <div v-if="store.loading" class="loading-message">Loading…</div>

      <!-- Dashboard Content -->
      <div v-else class="dashboard-content">
        <!-- Summary Cards -->
        <div class="metrics-grid">
          <!-- Net Cashflow Card -->
          <div class="metric-card cashflow-card">
            <div class="metric-label">Net Cashflow</div>
            <div class="metric-value" :class="{ negative: store.netCashflow < 0 }">
              {{ formatCurrency(store.netCashflow) }}
            </div>
            <div class="metric-subtext">Income − Expenses</div>
          </div>

          <!-- Total Income Card -->
          <div class="metric-card income-card">
            <div class="metric-label">Total Income</div>
            <div class="metric-value income">
              +${{ formatNumber(store.totalIncome) }}
            </div>
            <div class="metric-subtext">{{ store.incomeCount }} transaction(s)</div>
          </div>

          <!-- Total Expenses Card -->
          <div class="metric-card expense-card">
            <div class="metric-label">Total Expenses</div>
            <div class="metric-value expense">
              −${{ formatNumber(store.totalExpenses) }}
            </div>
            <div class="metric-subtext">{{ store.expenseCount }} transaction(s)</div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="store.transactions.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <div class="empty-title">No Transactions Yet</div>
          <div class="empty-message">Start tracking your finances by adding your first transaction.</div>
          <router-link to="/transactions/add?type=expense" class="action-button">
            Add Transaction
          </router-link>
        </div>

        <!-- Recent Transactions -->
        <div v-else class="recent-section">
          <div class="section-header">
            <h2>Recent Transactions</h2>
            <router-link to="/transactions" class="view-all-link">View All →</router-link>
          </div>

          <div class="recent-transactions">
            <div v-for="transaction in recentTransactions" :key="transaction.id" class="recent-item">
              <div class="recent-left">
                <div class="icon-circle" :class="transaction.type">
                  <span class="icon">{{ transaction.type === 'expense' ? '▼' : '▲' }}</span>
                </div>
                <div class="recent-details">
                  <div class="recent-label">{{ transaction.merchant || transaction.category }}</div>
                  <div class="recent-date">{{ formatDate(transaction.date) }}</div>
                </div>
              </div>
              <div class="recent-amount" :class="transaction.type">
                {{ transaction.type === 'expense' ? '−' : '+' }}${{ formatNumber(transaction.amount) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <BottomNav currentTab="dashboard" />
  </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue"
import { useTransactionsStore } from "@/stores/transactions"
import { useAuthStore } from "@/stores/AuthStore"

export default {
  name: "Dashboard",
  components: {
    BottomNav
  },

  setup() {
    const store = useTransactionsStore()
    const authStore = useAuthStore()
    return { store, authStore }
  },

  computed: {
    recentTransactions() {
      return this.store.transactions.slice(0, 5)
    }
  },

  mounted() {
    this.store.fetchTransactions(this.authStore.currentUserId)
  },

  methods: {
    formatCurrency(amount) {
      if (amount < 0) {
        return `−$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      }
      return `+$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },

    formatNumber(amount) {
      return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })
    },

    formatDate(date) {
      if (!date) return ''
      if (date.toDate) {
        date = date.toDate()
      }
      if (typeof date === 'string') {
        date = new Date(date)
      }
      if (!(date instanceof Date)) return ''
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

:root {
  --bg: #f4f6f5;
  --text-900: #24302c;
  --text-700: #5e6c66;
  --brand: #5e9486;
  --border: #dfe6e3;
  --income: #2d8a4f;
  --expense: #d9534f;
}

.web-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  font-family: 'Poppins', sans-serif;
}

.page-header {
  padding: 20px;
  border-bottom: 2px solid darkgray;
  background: white;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--text-900);
  font-weight: 600;
}

.page-content {
  padding: 20px;
  flex: 1;
}

.loading-message {
  text-align: center;
  color: var(--text-700);
  padding: 32px 0;
  font-size: 14px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border-left: 4px solid var(--border);
}

.metric-card.cashflow-card {
  border-left-color: var(--brand);
  background: linear-gradient(135deg, rgba(94, 148, 134, 0.05), rgba(94, 148, 134, 0.02));
}

.metric-card.income-card {
  border-left-color: var(--income);
  background: linear-gradient(135deg, rgba(45, 138, 79, 0.05), rgba(45, 138, 79, 0.02));
}

.metric-card.expense-card {
  border-left-color: var(--expense);
  background: linear-gradient(135deg, rgba(217, 83, 79, 0.05), rgba(217, 83, 79, 0.02));
}

.metric-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-700);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--brand);
  margin-bottom: 8px;
  line-height: 1;
}

.metric-value.income {
  color: var(--income);
}

.metric-value.expense {
  color: var(--expense);
}

.metric-value.negative {
  color: var(--expense);
}

.metric-subtext {
  font-size: 12px;
  color: var(--text-700);
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-900);
  margin-bottom: 8px;
}

.empty-message {
  font-size: 14px;
  color: var(--text-700);
  margin-bottom: 24px;
}

.action-button {
  display: inline-block;
  padding: 12px 32px;
  background: var(--brand);
  color: white;
  text-decoration: none;
  border-radius: 24px;
  font-weight: 600;
  transition: all 0.2s;
}

.action-button:hover {
  background: #4d7d70;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 148, 134, 0.3);
}

/* Recent Transactions */
.recent-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-900);
}

.view-all-link {
  font-size: 13px;
  color: var(--brand);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.view-all-link:hover {
  color: #4d7d70;
  text-decoration: underline;
}

.recent-transactions {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-item:hover {
  background: rgba(94, 148, 134, 0.02);
}

.recent-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.icon-circle.expense {
  background: #fde8e8;
  color: var(--expense);
}

.icon-circle.income {
  background: #e6f4ed;
  color: var(--income);
}

.recent-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-900);
}

.recent-date {
  font-size: 12px;
  color: var(--text-700);
}

.recent-amount {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.recent-amount.expense {
  color: var(--expense);
}

.recent-amount.income {
  color: var(--income);
}
</style>
