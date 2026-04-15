<template>
  <InsightExplanationSheet
    title="Recurring Expenses & Hidden Subscriptions"
    title-id="recurring-expenses-title"
    @close="$emit('close')"
  >
    <p class="section-label">How to find it</p>
    <p class="paragraph">
      Detect same-amount expense transactions on the same day-of-month across multiple months.
    </p>

    <div v-if="recurringExpenses.length" class="summary-grid">
      <div v-for="item in recurringExpenses" :key="item.key" class="summary-item">
        <span>{{ item.category }} · Day {{ formatOrdinalDay(item.day) }}</span>
        <strong>{{ formatCurrency(item.amount) }} for {{ item.monthCount }} months</strong>
      </div>
    </div>
    <p v-else class="paragraph muted">No recurring expense pattern has been detected yet.</p>

    <p class="section-label">The Insight</p>
    <p class="paragraph">{{ insightText }}</p>
  </InsightExplanationSheet>
</template>

<script>
import InsightExplanationSheet from "@/insight/InsightExplanationSheet.vue"

export default {
  name: "RecurringExpensesExplanation",
  components: { InsightExplanationSheet },
  emits: ["close"],
  props: {
    recurringExpenses: {
      type: Array,
      default: () => []
    },
    insightText: {
      type: String,
      default: ""
    }
  },
  methods: {
    formatCurrency(amount) {
      return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    formatOrdinalDay(day) {
      const value = Number(day)
      const mod100 = value % 100
      if (mod100 >= 11 && mod100 <= 13) return `${value}th`
      switch (value % 10) {
        case 1:
          return `${value}st`
        case 2:
          return `${value}nd`
        case 3:
          return `${value}rd`
        default:
          return `${value}th`
      }
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

.paragraph.muted {
  margin-top: 10px;
  color: #64748b;
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
  gap: 12px;
  font-size: 14px;
  align-items: center;
}

.summary-item span {
  color: #6b7280;
}

.summary-item strong {
  color: #111827;
  text-align: right;
}
</style>
