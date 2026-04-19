<template>
  <InsightExplanationSheet
    title="Net Cash Flow & Savings Rate"
    title-id="net-cashflow-title"
    @close="$emit('close')"
  >
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
  </InsightExplanationSheet>
</template>

<script>
import InsightExplanationSheet from "@/insight/InsightExplanationSheet.vue"

export default {
  name: "NetCashFlowExplanation",
  components: { InsightExplanationSheet },
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
  text-align: right;
}

.summary-item strong.positive {
  color: #047857;
}

.summary-item strong.negative {
  color: #b91c1c;
}
</style>
