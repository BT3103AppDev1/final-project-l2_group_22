<template>
  <div class="transaction-item">
    <div class="item-main">
      <div class="item-date">{{ formattedDate }}</div>
      <div class="item-details">
        <div class="item-label">{{ primaryLabel }}</div>
        <div v-if="showCategory" class="item-category">{{ transaction.category }}</div>
      </div>
    </div>
    <div class="item-amount" :class="amountClass">{{ amountDisplay }}</div>
  </div>
</template>

<script>
export default {
  name: 'TransactionItem',
  props: {
    transaction: {
      type: Object,
      required: true
    }
  },
  computed: {
    formattedDate() {
      return this.transaction.date.toDate().toLocaleDateString()
    },
    primaryLabel() {
      return this.transaction.merchant || this.transaction.category
    },
    showCategory() {
      return this.transaction.merchant ? true : false
    },
    amountDisplay() {
      const sign = this.transaction.type === 'expense' ? '−' : '+'
      const formatted = this.transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })
      return `${sign} ${formatted}`
    },
    amountClass() {
      return this.transaction.type === 'expense' ? 'expense' : 'income'
    }
  }
}
</script>

<style scoped>
:root {
  --text-900: #24302c;
  --text-700: #5e6c66;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #dfe6e3;
}

.item-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.item-date {
  font-size: 13px;
  color: var(--text-700);
  min-width: 70px;
  padding-top: 2px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  font-size: 14px;
  color: var(--text-900);
  font-weight: 500;
}

.item-category {
  font-size: 12px;
  color: var(--text-700);
}

.item-amount {
  font-size: 14px;
  font-weight: 600;
  min-width: 80px;
  text-align: right;
}

.item-amount.expense {
  color: #d9534f;
}

.item-amount.income {
  color: #2d8a4f;
}
</style>
