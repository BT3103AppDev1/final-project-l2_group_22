<template>
  <div class="web-page">
    <header class="page-header">
      <h1>Dashboard</h1>

      <div class="header-controls">
        <div class="period-selector">
          <div class="timeframe-group">
            <button
              class="period-btn"
              :class="{ active: selectedTimeframe === 'custom', 'wide-btn': selectedTimeframe === 'custom' }"
              @click="setTimeframe('custom')"
            >Custom Range</button>
            <button
              class="period-btn"
              :class="{ active: selectedTimeframe === 'month' }"
              @click="setTimeframe('month')"
            >Month</button>
            <button
              class="period-btn"
              :class="{ active: selectedTimeframe === 'year' }"
              @click="setTimeframe('year')"
            >Year</button>
          </div>

          <div class="range-controls">

            <template v-if="selectedTimeframe === 'custom'">
              <label class="sr-only" for="dashboard-custom-start">Custom range start</label>
              <input id="dashboard-custom-start" v-model="customStartDate" class="period-input" type="date" />

              <label class="sr-only" for="dashboard-custom-end">Custom range end</label>
              <input id="dashboard-custom-end" v-model="customEndDate" class="period-input" type="date" />
            </template>

            <template v-else-if="selectedTimeframe === 'month'">
              <label class="sr-only" for="dashboard-month">Select month</label>
              <select id="dashboard-month" v-model.number="selectedMonth" class="period-select">
                <option v-for="option in monthOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>

              <label class="sr-only" for="dashboard-month-year">Select year</label>
              <select id="dashboard-month-year" v-model.number="selectedYear" class="period-select">
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </template>

            <template v-else>
              <label class="sr-only" for="dashboard-year">Select year</label>
              <select id="dashboard-year" v-model.number="selectedYear" class="period-select">
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </template>
          </div>
        </div>
      </div>
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
            <div class="metric-value" :class="{ negative: periodNetCashflow < 0 }">
              {{ formatCurrency(periodNetCashflow) }}
            </div>
            <div class="metric-subtext">Income − Expenses</div>
          </div>

          <!-- Total Income Card -->
          <div class="metric-card income-card clickable" @click="$router.push('/transactions?tab=income')">
            <div class="metric-label">Total Income</div>
            <div class="metric-value income">
              {{ formatSignedAmount(periodIncome, 'income') }}
            </div>
            <div class="metric-subtext">{{ periodIncomeCount }} transaction(s)</div>
          </div>

          <!-- Total Expenses Card -->
          <div class="metric-card expense-card clickable" @click="$router.push('/transactions?tab=expense')">
            <div class="metric-label">Total Expenses</div>
            <div class="metric-value expense">
              {{ formatSignedAmount(periodExpenses, 'expense') }}
            </div>
            <div class="metric-subtext">{{ periodExpenseCount }} transaction(s)</div>
          </div>
        </div>

        <!-- Goals Section -->
        <div class="goals-section">
          <div class="section-header">
            <h2>Goals</h2>
            <button class="manage-goals-btn" @click="$router.push('/goals')">Manage Goals</button>
          </div>

          <div v-if="goalStore.loading" class="loading-message">Loading goals…</div>

          <div v-else-if="goalStore.goals.length === 0" class="goals-empty">
            No goals set yet.
            <button class="manage-goals-btn" @click="$router.push('/goals')">Add a Goal</button>
          </div>

          <div v-else class="goal-progress-list">
            <div
              v-for="(gp, index) in goalProgress"
              :key="gp.goal.id || `${gp.goal.type}-${gp.goal.category || 'all'}-${index}`"
              class="goal-progress-card"
            >
              <div class="goal-progress-header">
                <span class="goal-name">{{ gp.goal.displayName }}</span>
                <span class="goal-status-badge" :class="gp.statusClass">{{ gp.status }}</span>
              </div>

              <div class="goal-progress-bar-wrap">
                <div
                  class="goal-progress-bar"
                  :class="gp.statusClass"
                  :style="{ width: gp.progressWidth, minWidth: parseFloat(gp.progressWidth) > 0 ? '4px' : '0' }"
                ></div>
              </div>

              <div class="goal-progress-amounts">
                <span class="goal-actual">Actual: {{ formatAmount(gp.actual) }}</span>
                <span class="goal-target">Target: {{ formatAmount(gp.goal.targetAmount) }}</span>
              </div>
            </div>
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
                {{ formatSignedAmount(transaction.amount, transaction.type) }}
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
import { useGoalStore } from "@/stores/GoalStore"
import { useCurrencyStore } from "@/stores/currency"

const MONTH_OPTIONS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' }
]

export default {
  name: "Dashboard",
  components: {
    BottomNav
  },

  setup() {
    const store = useTransactionsStore()
    const authStore = useAuthStore()
    const goalStore = useGoalStore()
    const currencyStore = useCurrencyStore()
    return { store, authStore, goalStore, currencyStore }
  },

  data() {
    const now = new Date()
    const previousWeek = new Date(now)
    previousWeek.setDate(previousWeek.getDate() - 6)
    return {
      selectedTimeframe: 'month',
      selectedMonth: now.getMonth(),
      selectedYear: now.getFullYear(),
      customStartDate: this.formatDateForInput(previousWeek),
      customEndDate: this.formatDateForInput(now)
    }
  },

  computed: {
    monthOptions() {
      return MONTH_OPTIONS
    },

    availableYears() {
      const currentYear = new Date().getFullYear()
      const years = new Set([currentYear])

      this.store.transactions.forEach((transaction) => {
        const date = this.getTransactionDate(transaction)
        if (!date || Number.isNaN(date.getTime())) return
        years.add(date.getFullYear())
      })

      return Array.from(years).sort((a, b) => b - a)
    },

    recentTransactions() {
      return this.store.transactions.slice(0, 5)
    },

    periodRange() {
      const now = new Date()
      const selectedYear = Number.isFinite(this.selectedYear) ? this.selectedYear : now.getFullYear()
      const selectedMonth = Number.isFinite(this.selectedMonth) ? this.selectedMonth : now.getMonth()

      if (this.selectedTimeframe === 'custom') {
        if (!this.customStartDate || !this.customEndDate) {
          return { start: null, end: null }
        }

        const startDate = new Date(this.customStartDate)
        const endDate = new Date(this.customEndDate)
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
          return { start: null, end: null }
        }

        const start = startDate <= endDate ? startDate : endDate
        const end = startDate <= endDate ? endDate : startDate

        return {
          start: this.startOfDay(start),
          end: this.endOfDay(end)
        }
      }

      if (this.selectedTimeframe === 'year') {
        return {
          start: new Date(selectedYear, 0, 1, 0, 0, 0, 0),
          end: new Date(selectedYear, 11, 31, 23, 59, 59, 999)
        }
      }

      const start = new Date(selectedYear, selectedMonth, 1)
      const end = new Date(selectedYear, selectedMonth + 1, 0)

      return {
        start: this.startOfDay(start),
        end: this.endOfDay(end)
      }
    },

    periodTransactions() {
      const { start, end } = this.periodRange
      if (!start || !end) return []
      return this.store.transactions.filter(t => {
        const d = this.getTransactionDate(t)
        if (!d) return false
        return d >= start && d <= end
      })
    },

    periodIncome() {
      return this.periodTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    },

    periodExpenses() {
      return this.periodTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
    },

    periodNetCashflow() {
      return this.periodIncome - this.periodExpenses
    },

    periodIncomeCount() {
      return this.periodTransactions.filter(t => t.type === 'income').length
    },

    periodExpenseCount() {
      return this.periodTransactions.filter(t => t.type === 'expense').length
    },

    goalProgress() {
      return this.goalStore.formattedGoals.map((goal) => {
        const rawActual = this.goalStore.goalActual(goal, this.periodTransactions)
        const actual = this.toSafeNumber(rawActual)
        const target = this.toSafeNumber(goal.targetAmount)
        const isSavingsGoal = goal.type === 'Monthly Savings Target'
        const status = this.goalStatus(actual, target, isSavingsGoal)
        const statusClass = this.goalStatusClass(status, isSavingsGoal)
        const progressWidth = this.barWidth(actual, target)

        return { goal, actual, target, status, statusClass, progressWidth }
      })
    }
  },

  watch: {
    availableYears(years) {
      if (!years.includes(this.selectedYear)) {
        this.selectedYear = years[0]
      }
    },

    'authStore.currentUserId': {
      immediate: true,
      handler(userId) {
        this.store.fetchTransactions(userId)
        this.goalStore.init(userId)
        this.currencyStore.init(userId)
      }
    }
  },

  methods: {
    setTimeframe(timeframe) {
      this.selectedTimeframe = timeframe
    },

    formatDateForInput(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    formatCurrency(amount) {
      return this.currencyStore.formatSignedValue(amount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    formatAmount(amount) {
      return this.currencyStore.formatAmount(amount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    formatSignedAmount(amount, type) {
      return this.currencyStore.formatSignedAmount(amount, type, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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
    },

    getTransactionDate(t) {
      let d = t.date
      if (!d) return null
      if (d.toDate) return d.toDate()
      if (typeof d === 'string') return new Date(d)
      if (d instanceof Date) return d
      return null
    },

    startOfDay(date) {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d
    },

    endOfDay(date) {
      const d = new Date(date)
      d.setHours(23, 59, 59, 999)
      return d
    },

    startOfWeek(date) {
      const d = this.startOfDay(date)
      const day = d.getDay()
      const diff = day === 0 ? -6 : 1 - day
      d.setDate(d.getDate() + diff)
      return d
    },

    goalStatusClass(status, isSavingsGoal = false) {
      if (status === 'Met') return 'status-met'
      if (status === 'Exceeded') return isSavingsGoal ? 'status-met' : 'status-exceeded'
      if (status === 'At risk') return 'status-at-risk'
      return 'status-on-track'
    },

    goalStatus(actual, target, isSavingsGoal = false) {
      const safeActual = this.toSafeNumber(actual)
      const safeTarget = this.toSafeNumber(target)

      if (safeTarget <= 0) return 'On track'

      if (isSavingsGoal) {
        if (safeActual >= safeTarget) return 'Met'
      } else {
        if (safeActual > safeTarget) return 'Exceeded'
      }

      const thresholdAmount = safeTarget * 0.8
      if (safeActual >= thresholdAmount) return 'At risk'
      return 'On track'
    },

    toSafeNumber(value) {
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0
      }

      if (typeof value === 'string') {
        const normalized = value.replace(/[$,\s]/g, '')
        const parsed = Number(normalized)
        return Number.isFinite(parsed) ? parsed : 0
      }

      return 0
    },

    barWidth(actual, target) {
      const safeActual = Math.abs(this.toSafeNumber(actual))
      const safeTarget = Math.abs(this.toSafeNumber(target))

      if (safeTarget <= 0) return '0%'

      const ratio = (safeActual / safeTarget) * 100
      if (!Number.isFinite(ratio)) return '0%'

      const pct = Math.max(0, Math.min(ratio, 100))
      const widthPercent = Math.round(pct * 10) / 10
      return `${widthPercent}%`
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
  height: 76px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--border);
  background: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: nowrap;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--text-900);
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
}

.header-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  flex: 0 1 auto;
  max-width: 100%;
  overflow-x: auto;
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

.metric-card.clickable {
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}

.metric-card.clickable:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
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

/* Period Selector */
.period-selector {
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-bottom: 0;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: visible;
  min-width: 0;
  background: #edf6f2;
  border: 1px solid #d4e4de;
  border-radius: 999px;
  padding: 6px;
}

.timeframe-group {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.range-controls {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.period-btn {
  padding: 6px 12px;
  height: 34px;
  border-radius: 20px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-700);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  transition: all 0.2s;
  white-space: nowrap;
  box-sizing: border-box;
}

.period-btn.wide-btn {
  min-width: 138px;
}

.period-btn.active {
  background: #5e9486;
  color: white;
  border-color: #5e9486;
  box-shadow: 0 1px 3px rgba(37, 70, 61, 0.28);
}

.period-btn:hover:not(.active) {
  background: #ffffff;
  border-color: #bfd4cc;
  color: #2f5a4e;
}

.period-filter {
  align-items: center;
}

.period-input {
  padding: 0 8px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid #c6d8d1;
  background: white;
  color: #24302c;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  width: 130px;
  max-width: 130px;
  box-sizing: border-box;
}

.period-select {
  padding: 0 8px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid #c6d8d1;
  background: white;
  color: #24302c;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
  min-width: 90px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 900px) {
  .header-controls {
    align-items: center;
    width: auto;
  }

  .period-selector {
    justify-content: flex-start;
    flex-wrap: nowrap;
  }

  .timeframe-group,
  .range-controls {
    flex-wrap: nowrap;
  }
}

/* Goals Section */
.goals-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goals-empty {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  color: var(--text-700);
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.manage-goals-btn {
  padding: 8px 18px;
  background: var(--brand);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  transition: background 0.2s;
  white-space: nowrap;
}

.manage-goals-btn:hover {
  background: #4d7d70;
}

.goal-progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goal-progress-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.goal-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goal-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-900);
}

.goal-status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}

.goal-status-badge.status-on-track {
  background: #e6f4ed;
  color: var(--income);
}

.goal-status-badge.status-at-risk {
  background: #fff3e0;
  color: #e67e00;
}

.goal-status-badge.status-exceeded {
  background: #fde8e8;
  color: var(--expense);
}

.goal-status-badge.status-met {
  background: #e6f4ed;
  color: var(--income);
}

.goal-progress-bar-wrap {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.goal-progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
  display: block;
  min-height: 8px;
  background: #ccc;
}

.goal-progress-bar.status-on-track {
  background: #2d8a4f !important;
}

.goal-progress-bar.status-at-risk {
  background: #e67e00 !important;
}

.goal-progress-bar.status-exceeded {
  background: #d9534f !important;
}

.goal-progress-bar.status-met {
  background: #2d8a4f !important;
}

.goal-progress-amounts {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-700);
}
</style>
