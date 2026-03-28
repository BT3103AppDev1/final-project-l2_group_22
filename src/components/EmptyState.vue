<template>
  <div class="empty-state">
    <div class="empty-icon-circle">
      <span class="dollar-icon">$</span>
    </div>
    <div class="empty-message">{{ message }}</div>
    <div class="empty-subtitle">{{ subtitle }}</div>
    <router-link :to="addTransactionPath" class="add-button">{{ buttonLabel }}</router-link>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    activeTab: {
      type: String,
      default: 'expense'
    }
  },
  computed: {
    tabLabel() {
      return this.activeTab === 'expense' ? 'Expense' : 'Income'
    },
    message() {
      return `No ${this.tabLabel}s Yet`
    },
    subtitle() {
      if (this.activeTab === 'expense') {
        return 'Start tracking your spending by adding your first expense transaction.'
      } else {
        return 'Start tracking your income by adding your first income transaction.'
      }
    },
    buttonLabel() {
      return `+ Add ${this.tabLabel}`
    },
    addTransactionPath() {
      return '/add-transaction'
    }
  }
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px 24px;
  text-align: center;
}

.empty-icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e8ecea;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dollar-icon {
  font-size: 32px;
  color: #aab8b3;
  font-weight: 600;
}

.empty-message {
  font-size: 18px;
  font-weight: 600;
  color: #24302c;
  margin-top: 8px;
}

.empty-subtitle {
  font-size: 14px;
  color: #5e6c66;
  max-width: 300px;
  line-height: 1.5;
}

.add-button {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 32px;
  background-color: #4a6e5e;
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  transition: background-color 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(74, 110, 94, 0.3);
}

.add-button:hover {
  background-color: #3d5a4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 110, 94, 0.4);
  color: #ffffff !important;
}

.add-button:active {
  transform: translateY(0);
  color: #ffffff !important;
}
</style>
