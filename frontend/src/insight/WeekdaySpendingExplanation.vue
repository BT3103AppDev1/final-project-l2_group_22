<template>
  <InsightExplanationSheet
    title="Day-of-the-Week Spending Habits"
    title-id="weekday-spending-title"
    @close="$emit('close')"
  >
    <p class="section-label">How to find it</p>
    <p class="paragraph">
      Extract weekday from each expense date and compare average and share of spend per day.
    </p>

    <div v-if="hasData" class="summary-grid">
      <div v-for="day in weekdaySpending" :key="day.label" class="summary-item">
        <span>{{ day.label }}</span>
        <strong>{{ formatCurrency(day.average) }} avg · {{ formatPercent(day.sharePct) }}</strong>
      </div>
    </div>
    <p v-else class="paragraph muted">No weekday spending pattern is available yet.</p>

    <p class="section-label">The Insight</p>
    <p class="paragraph">{{ insightText }}</p>
  </InsightExplanationSheet>
</template>

<script>
import InsightExplanationSheet from "@/insight/InsightExplanationSheet.vue"

export default {
  name: "WeekdaySpendingExplanation",
  components: { InsightExplanationSheet },
  emits: ["close"],
  props: {
    weekdaySpending: {
      type: Array,
      default: () => []
    },
    hasData: {
      type: Boolean,
      default: false
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
    formatPercent(value) {
      return `${Number(value || 0).toFixed(1)}%`
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
