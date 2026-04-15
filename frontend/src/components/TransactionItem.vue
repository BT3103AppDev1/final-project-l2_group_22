<template>
  <div class="transaction-card" @click="$router.push(`/transactions/${transaction.id}`)">
    <div class="card-left">
      <div class="icon-circle" :class="amountClass">
        <span class="icon-arrow">{{ amountClass === 'expense' ? '▼' : '▲' }}</span>
      </div>
    </div>
    <div class="card-center">
      <div class="item-label">{{ primaryLabel }}</div>
      <div class="item-category">{{ transaction.category }}</div>
      <div class="item-date">{{ formattedDate }}</div>
      <div v-if="transaction.note" class="item-note">{{ transaction.note }}</div>
    </div>
    <div class="card-right">
      <div class="item-amount" :class="amountClass">{{ amountDisplay }}</div>
    </div>
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
      return this.transaction.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    primaryLabel() {
      return this.transaction.merchant || this.transaction.category
    },
    amountDisplay() {
      const sign = this.transaction.type === 'expense' ? '−' : '+'
      const formatted = this.transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })
      return `${sign}$${formatted}`
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

.transaction-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}

.transaction-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.transaction-card:active {
  transform: translateY(0);
}

.card-left {
  display: flex;
  align-items: center;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.icon-circle.expense {
  background: #fde8e8;
  color: #d9534f;
}

.icon-circle.income {
  background: #e6f4ed;
  color: #2d8a4f;
}

.icon-arrow {
  font-size: 16px;
}

.card-center {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.item-label {
  font-size: 15px;
  color: var(--text-900);
  font-weight: 600;
}

.item-category {
  font-size: 13px;
  color: var(--text-700);
}

.item-date {
  font-size: 12px;
  color: var(--text-700);
}

.item-note {
  font-size: 12px;
  color: var(--text-700);
}

.card-right {
  display: flex;
  align-items: center;
}

.item-amount {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.item-amount.expense {
  color: #d9534f;
}

.item-amount.income {
  color: #2d8a4f;
}
</style>
