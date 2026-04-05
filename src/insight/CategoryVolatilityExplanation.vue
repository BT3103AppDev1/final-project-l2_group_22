<template>
  <InsightExplanationSheet
    title="Category Volatility & Budget Leaks"
    title-id="category-volatility-title"
    @close="$emit('close')"
  >
    <p class="section-label">How to find it</p>
    <p class="paragraph">
      Calculate month-over-month variance for each expense category and compare volatility.
    </p>

    <div v-if="summary.hasData" class="summary-grid">
      <div v-for="item in summary.volatile" :key="item.category" class="summary-item">
        <span>{{ item.category }}</span>
        <strong>{{ formatPercent(item.coefficient * 100) }} CV</strong>
      </div>
    </div>
    <p v-else class="paragraph muted">Not enough category history is available yet.</p>

    <p v-if="stableCategoryLabel" class="paragraph muted">
      Stable categories: {{ stableCategoryLabel }}
    </p>

    <p class="section-label">The Insight</p>
    <p class="paragraph">{{ insightText }}</p>
  </InsightExplanationSheet>
</template>

<script>
import InsightExplanationSheet from "@/insight/InsightExplanationSheet.vue"

export default {
  name: "CategoryVolatilityExplanation",
  components: { InsightExplanationSheet },
  emits: ["close"],
  props: {
    summary: {
      type: Object,
      required: true
    },
    stableCategoryLabel: {
      type: String,
      default: ""
    },
    insightText: {
      type: String,
      default: ""
    }
  },
  methods: {
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
