<template>
  <InsightExplanationSheet
    title="Spending Trends Over Time"
    title-id="spending-trends-title"
    @close="$emit('close')"
  >
    <p class="section-label">How to find it</p>
    <p class="paragraph">
      Group expense transactions by month and compare totals over time.
    </p>

    <div v-if="trendSeries.length" class="summary-grid">
      <div class="summary-item">
        <span>Oldest month</span>
        <strong>{{ trendSeries[0].longLabel }} · {{ formatCurrency(trendSeries[0].amount) }}</strong>
      </div>
      <div class="summary-item">
        <span>Latest month</span>
        <strong>{{ trendSeries[trendSeries.length - 1].longLabel }} · {{ formatCurrency(trendSeries[trendSeries.length - 1].amount) }}</strong>
      </div>
      <div class="summary-item" v-if="peakMonth">
        <span>Peak spend month</span>
        <strong>{{ peakMonth.longLabel }} · {{ formatCurrency(peakMonth.amount) }}</strong>
      </div>
    </div>

    <p class="section-label">The Insight</p>
    <p class="paragraph">{{ insightText }}</p>
  </InsightExplanationSheet>
</template>

<script>
import InsightExplanationSheet from "@/insight/InsightExplanationSheet.vue"

export default {
  name: "SpendingTrendsExplanation",
  components: { InsightExplanationSheet },
  emits: ["close"],
  props: {
    trendSeries: {
      type: Array,
      default: () => []
    },
    insightText: {
      type: String,
      default: ""
    }
  },
  computed: {
    peakMonth() {
      if (!this.trendSeries.length) return null
      return this.trendSeries.reduce((lead, item) => {
        if (!lead || item.amount > lead.amount) return item
        return lead
      }, null)
    }
  },
  methods: {
    formatCurrency(amount) {
      return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
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
