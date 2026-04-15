<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="net-cashflow-title">
      <div class="sheet-header">
        <h2 id="net-cashflow-title">Net Cash Flow &amp; Savings Rate</h2>
        <button class="close-btn" type="button" @click="$emit('close')">Close</button>
      </div>

      <p class="section-label">How to find it ({{ periodLabel }})</p>
      <p class="paragraph">
        Compare total income versus total expense for the selected month.
      </p>

      <div class="formula-card">
        <p class="formula-line">Net Cash Flow = Income - Expense</p>
        <p class="formula-line">Savings Rate = (Net Cash Flow / Income) * 100%</p>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <span>Income</span>
          <strong>{{ formatCurrency(income) }}</strong>
        </div>
        <div class="summary-item">
          <span>Expense</span>
          <strong>{{ formatCurrency(expenses) }}</strong>
        </div>
        <div class="summary-item">
          <span>Net Cash Flow</span>
          <strong :class="netClass">{{ formatSignedCurrency(netCashflow) }}</strong>
        </div>
        <div class="summary-item">
          <span>Savings Rate</span>
          <strong>{{ savingsRateText }}</strong>
        </div>
      </div>

      <p class="section-label">The Insight</p>
      <p class="paragraph" v-if="savingsRate === null">
        Savings rate cannot be calculated when there is no income in this period. Add or verify income transactions first.
      </p>
      <p class="paragraph" v-else-if="netCashflow >= 0">
        You are living within your means this month. A positive net cash flow means money is left over after expenses, and that leftover percentage is your actual savings rate.
      </p>
      <p class="paragraph" v-else>
        You are spending more than you earn this month. A negative savings rate indicates a monthly deficit and signals that spending or income needs adjustment.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "NetCashFlowExplanation",
  emits: ["close"],
  props: {
    periodLabel: {
      type: String,
      required: true
    },
    income: {
      type: Number,
      required: true
    },
    expenses: {
      type: Number,
      required: true
    },
    netCashflow: {
      type: Number,
      required: true
    },
    savingsRate: {
      type: Number,
      default: null
    }
  },
  computed: {
    savingsRateText() {
      if (this.savingsRate === null) return "N/A"
      return `${this.savingsRate.toFixed(1)}%`
    },
    netClass() {
      return this.netCashflow >= 0 ? "positive" : "negative"
    }
  },
  methods: {
    formatCurrency(amount) {
      return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    formatSignedCurrency(amount) {
      if (amount < 0) {
        return `-$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      }
      return `+$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
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
</style>
