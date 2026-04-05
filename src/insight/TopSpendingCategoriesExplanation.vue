<template>
  <InsightExplanationSheet
    title="Top Spending Categories"
    title-id="top-spending-categories-title"
    @close="$emit('close')"
  >
    <p class="section-label">How to find it ({{ periodLabel }})</p>
    <p class="paragraph">
      Sum all expense amounts and group them by category for the selected period.
    </p>

    <div v-if="topCategories.length" class="summary-grid">
      <div v-for="item in topCategories" :key="item.category" class="summary-item">
        <span>{{ item.category }}</span>
        <strong>{{ formatCurrency(item.total) }} ({{ item.shareText }})</strong>
      </div>
    </div>
    <p v-else class="paragraph muted">No expense data is available for this period.</p>

    <p class="section-label">The Insight</p>
    <p class="paragraph">{{ insightText }}</p>
  </InsightExplanationSheet>
</template>

<script>
import InsightExplanationSheet from "@/insight/InsightExplanationSheet.vue"

export default {
  name: "TopSpendingCategoriesExplanation",
  components: { InsightExplanationSheet },
  emits: ["close"],
  props: {
    periodLabel: {
      type: String,
      required: true
    },
    topCategories: {
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
