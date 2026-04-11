<template>
  <InsightExplanationSheet
    title="Seasonal Spending Spikes"
    title-id="seasonal-spending-title"
    @close="$emit('close')"
  >
    <p class="section-label">How to find it</p>
    <p class="paragraph">
      Compare average monthly expense totals across years to identify recurring seasonal peaks.
    </p>

    <div v-if="summary.hasData" class="summary-grid">
      <div class="summary-item">
        <span>Peak month</span>
        <strong>{{ summary.peak.label }} · {{ formatCurrency(summary.peak.average) }}</strong>
      </div>
      <div class="summary-item">
        <span>Spike over baseline</span>
        <strong>{{ formatPercent(summary.spikePct) }}</strong>
      </div>
      <div class="summary-item" v-if="nextPeak">
        <span>Next strongest month</span>
        <strong>{{ nextPeak.label }} · {{ formatCurrency(nextPeak.average) }}</strong>
      </div>
    </div>
    <p v-else class="paragraph muted">No seasonal pattern can be detected yet.</p>

    <p class="section-label">The Insight</p>
    <p class="paragraph">{{ insightText }}</p>
  </InsightExplanationSheet>
</template>

<script>
import InsightExplanationSheet from "@/insight/InsightExplanationSheet.vue"

export default {
  name: "SeasonalSpendingExplanation",
  components: { InsightExplanationSheet },
  emits: ["close"],
  props: {
    seasonalSpending: {
      type: Array,
      default: () => []
    },
    summary: {
      type: Object,
      required: true
    },
    insightText: {
      type: String,
      default: ""
    }
  },
  computed: {
    nextPeak() {
      if (!this.seasonalSpending.length) return null

      const sorted = [...this.seasonalSpending]
        .filter(month => month.average > 0)
        .sort((a, b) => b.average - a.average)

      return sorted[1] || null
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
