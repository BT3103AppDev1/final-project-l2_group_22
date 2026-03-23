<template>
  <div class="empty-state">
    <div class="empty-icon">📋</div>
    <div class="empty-message">No transactions yet</div>
    <router-link to="/add-transaction" class="add-button">+ Add Transaction</router-link>
  </div>
</template>

<script>
export default {
  name: 'EmptyState'
}
</script>

<style scoped>
:root {
  --brand: #5e9486;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
  text-align: center;
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.6;
}

.empty-message {
  font-size: 16px;
  color: #5e6c66;
}

.add-button {
  display: inline-block;
  margin-top: 8px;
  padding: 12px 28px;
  background-color: #5e9486;
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 700;
  transition: background-color 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(94, 148, 134, 0.4);
}

.add-button:hover {
  background-color: #4d7d70;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 148, 134, 0.5);
  color: #ffffff !important;
}

.add-button:active {
  transform: translateY(0);
  color: #ffffff !important;
}
</style>
