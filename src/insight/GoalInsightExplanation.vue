<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="goal-insight-title">
      <div class="sheet-header">
        <h2 id="goal-insight-title">{{ goal.displayName }} — Goal Insight</h2>
        <button class="close-btn" type="button" @click="$emit('close')">Close</button>
      </div>

      <p class="section-label">Period</p>
      <p class="paragraph">{{ periodLabel }}</p>

      <p class="section-label">Transactions inclusion rule</p>
      <p class="paragraph">{{ inclusionRule }}</p>

      <div class="summary-grid">
        <div class="summary-item">
          <span>Actual</span>
          <strong>{{ formatCurrency(actual) }}</strong>
        </div>
        <div class="summary-item">
          <span>Target</span>
          <strong>{{ formatCurrency(goal.targetAmount) }}</strong>
        </div>
        <div class="summary-item">
          <span>Status</span>
          <strong :class="statusClass">{{ status }}</strong>
        </div>
      </div>

      <p class="section-label">Status rule</p>
      <div class="formula-card">
        <p class="formula-line" v-if="isSpendingGoal">Exceeded if Actual &gt; Target</p>
        <p class="formula-line" v-if="isSpendingGoal">At risk if Actual &ge; 80% of Target</p>
        <p class="formula-line" v-if="isSpendingGoal">On track otherwise</p>
        <p class="formula-line" v-if="!isSpendingGoal">Exceeded if Actual &ge; Target (goal met!)</p>
        <p class="formula-line" v-if="!isSpendingGoal">At risk if Actual &ge; 80% of Target</p>
        <p class="formula-line" v-if="!isSpendingGoal">On track if below 80% of Target</p>
      </div>

      <p class="section-label">The insight</p>
      <p class="paragraph">{{ insightText }}</p>

      <button class="adjust-btn" @click="goToGoals">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        Adjust Goal
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoalInsightExplanation',
  emits: ['close'],
  props: {
    goal: {
      type: Object,
      required: true
    },
    actual: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    periodLabel: {
      type: String,
      required: true
    }
  },
  computed: {
    isSpendingGoal() {
      return this.goal.type !== 'Monthly Savings Target'
    },
    inclusionRule() {
      if (this.goal.type === 'Monthly Total Spending Cap') {
        return 'All expense transactions in the selected month.'
      }
      if (this.goal.type === 'Monthly Category Spending Cap') {
        return `Expense transactions in "${this.goal.category}" for the selected month.`
      }
      return 'Net savings = Total income minus total expenses for the selected month.'
    },
    statusClass() {
      if (this.status === 'Exceeded') return this.isSpendingGoal ? 'negative' : 'positive'
      if (this.status === 'At risk') return 'at-risk'
      return 'on-track'
    },
    insightText() {
      const pct = this.goal.targetAmount > 0
        ? ((this.actual / this.goal.targetAmount) * 100).toFixed(1)
        : 0

      if (this.isSpendingGoal) {
        if (this.status === 'Exceeded') {
          return `You have exceeded your ${this.goal.displayName} by ${this.formatCurrency(this.actual - this.goal.targetAmount)}. You are at ${pct}% of your target. Consider reviewing recent transactions in this area to identify where to cut back.`
        }
        if (this.status === 'At risk') {
          return `You are at ${pct}% of your ${this.goal.displayName} with ${this.formatCurrency(this.goal.targetAmount - this.actual)} remaining. You are approaching your limit — be mindful of spending in this area for the rest of the month.`
        }
        return `You are at ${pct}% of your ${this.goal.displayName} with ${this.formatCurrency(this.goal.targetAmount - this.actual)} remaining. You are well within your target — keep it up.`
      }

      // Savings goal
      if (this.status === 'Exceeded') {
        return `You have met your savings target of ${this.formatCurrency(this.goal.targetAmount)}, saving ${this.formatCurrency(this.actual)} so far. Well done — consider increasing your target next month.`
      }
      if (this.status === 'At risk') {
        return `You are at ${pct}% of your savings target with ${this.formatCurrency(this.goal.targetAmount - this.actual)} to go. You are close — reducing discretionary spending could help you reach it.`
      }
      return `You have saved ${this.formatCurrency(this.actual)} toward your ${this.formatCurrency(this.goal.targetAmount)} target (${pct}%). There is still time to close the gap this month.`
    }
  },
  methods: {
    formatCurrency(amount) {
      return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    goToGoals() {
      this.$emit('close')
      this.$router.push('/goals')
    }
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 100;
}

.sheet {
  width: min(640px, 100%);
  max-height: 88vh;
  overflow-y: auto;
  background: #ffffff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 18px;
  box-shadow: 0 -10px 28px rgba(15, 23, 42, 0.2);
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.sheet-header h2 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.close-btn {
  border: none;
  background: #f3f4f6;
  color: #374151;
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.section-label {
  margin: 16px 0 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
}

.paragraph {
  margin: 0;
  color: #374151;
  font-size: 14px;
  line-height: 1.5;
}

.formula-card {
  margin-top: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
  padding: 12px;
}

.formula-line {
  margin: 0;
  font-size: 14px;
  color: #1f2937;
}

.formula-line + .formula-line {
  margin-top: 4px;
}

.summary-grid {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.summary-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.summary-item span {
  color: #6b7280;
}

.summary-item strong {
  color: #111827;
}

.summary-item strong.positive {
  color: #047857;
}

.summary-item strong.negative {
  color: #b91c1c;
}

.summary-item strong.at-risk {
  color: #d97706;
}

.summary-item strong.on-track {
  color: #047857;
}

.adjust-btn {
  width: 100%;
  margin-top: 18px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;
}

.adjust-btn:hover {
  background: #f3f4f6;
}
</style>
