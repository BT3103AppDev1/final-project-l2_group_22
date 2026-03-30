<template>
  <div class="web-page">
    <header class="page-header">
      <div class="header-left">
        <button @click="$router.back()" class="back-btn">←</button>
        <h1>Goals</h1>
      </div>
      <div class="header-icons">
        <button class="icon-button" @click="goalStore.fetchGoals()">🔄</button>
      </div>
    </header>

    <main class="page-content">
      <div v-if="goalStore.loading" class="loading-message">Loading goals...</div>
      
      <div v-else class="goal-list">
        <div 
          v-for="goal in goalStore.formattedGoals" 
          :key="goal.id" 
          class="goal-card"
          @click="openDetails(goal)"
        >
          <div class="goal-info">
            <p class="goal-label">{{ goal.displayName }}</p>
            <h3 class="target-amount">${{ goal.targetAmount.toLocaleString() }}</h3>
          </div>
          <svg class="menu-arrow" viewBox="0 0 24 24" fill="none">
            <path d="M10 7L15 12L10 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>

        <button class="fab" @click="showAddModal = true">+</button>
      </div>

      <div v-if="showAddModal || isEditing" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <h2>{{ isEditing ? 'Edit Goal' : 'Add New Goal' }}</h2>
          
          <div class="form-group">
            <label>Goal Type</label>
            <select v-model="goalForm.type" :disabled="isEditing" class="custom-select">
              <option value="Monthly Total Spending Cap">Monthly Total Spending Cap</option>
              <option value="Monthly Category Spending Cap">Monthly Category Spending Cap</option>
              <option value="Monthly Savings Target">Monthly Savings Target</option>
            </select>
          </div>

          <div v-if="goalForm.type === 'Monthly Category Spending Cap'" class="form-group">
            <label>Category</label>
            <select v-model="goalForm.category" class="custom-select">
              <option value="" disabled>Select a category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <p v-if="errors.category" class="error-text">{{ errors.category }}</p>
          </div>

          <div class="form-group">
            <label>Target Amount ($)</label>
            <input v-model.number="goalForm.targetAmount" type="number" placeholder="0.00" class="custom-input" />
            <p v-if="errors.targetAmount" class="error-text">{{ errors.targetAmount }}</p>
          </div>

          <div class="modal-actions">
            <button @click="closeModal" class="btn-secondary">Cancel</button>
            <button @click="handleSave" class="btn-primary" :disabled="isProcessing">
              {{ isProcessing ? 'Saving...' : 'Save Goal' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="modal-overlay">
        <div class="modal-content confirm-modal">
          <p>Are you sure you want to delete this goal?</p>
          <div class="modal-actions">
            <button @click="showDeleteConfirm = false" class="btn-secondary">Cancel</button>
            <button @click="handleDelete" class="btn-danger" :disabled="isProcessing">Confirm Delete</button>
          </div>
        </div>
      </div>
    </main>

    <BottomNav currentTab="settings" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useGoalStore } from '../stores/GoalStore';
import BottomNav from "@/components/BottomNav.vue";

const goalStore = useGoalStore();

// UI State
const showAddModal = ref(false);
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const isProcessing = ref(false);
const selectedGoal = ref(null);
const errors = reactive({ targetAmount: '', category: '' });

const goalForm = reactive({
  type: 'Monthly Total Spending Cap',
  targetAmount: null,
  category: ''
});

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities'];

onMounted(() => {
  goalStore.init('user123'); // Ensure this matches your auth logic
});

const openDetails = (goal) => {
  selectedGoal.value = goal;
  Object.assign(goalForm, goal);
  isEditing.value = true;
};

const validate = () => {
  let isValid = true;
  errors.targetAmount = '';
  errors.category = '';

  if (!goalForm.targetAmount || goalForm.targetAmount <= 0) {
    errors.targetAmount = 'Enter a valid amount';
    isValid = false;
  }
  if (goalForm.type === 'Monthly Category Spending Cap' && !goalForm.category) {
    errors.category = 'Category is required';
    isValid = false;
  }
  return isValid;
};

const handleSave = async () => {
  if (!validate()) return;
  isProcessing.value = true;
  try {
    const data = { ...goalForm, userId: 'user123' };
    if (isEditing.value) {
      await goalStore.updateGoal(selectedGoal.value.id, data);
    } else {
      await goalStore.addGoal(data);
    }
    closeModal();
  } finally {
    isProcessing.value = false;
  }
};

const handleDelete = async () => {
  isProcessing.value = true;
  try {
    await goalStore.deleteGoal(selectedGoal.value.id);
    closeModal();
  } finally {
    isProcessing.value = false;
  }
};

const closeModal = () => {
  showAddModal.value = false;
  isEditing.value = false;
  showDeleteConfirm.value = false;
  selectedGoal.value = null;
  goalForm.type = 'Monthly Total Spending Cap';
  goalForm.targetAmount = null;
  goalForm.category = '';
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

/* UI Variables consistent with Transactions page */
.web-page {
  --bg: #f4f6f5;
  --card: #ffffff;
  --text-900: #24302c;
  --text-700: #5e6c66;
  --brand: #5e9486;
  --border: #dfe6e3;
  --fab-bg: #3d5248;
  
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
  font-family: 'Poppins', sans-serif;
  color: var(--text-900);
}

/* Requirement 3: Bigger Back Button and Header Styling */
.page-header {
  padding: 20px;
  border-bottom: 2px solid #dfe6e3;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 28px; /* Increased size */
  cursor: pointer;
  color: var(--text-900);
  padding: 0;
  display: flex;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.page-content {
  padding: 20px;
  flex: 1;
  background: var(--bg);
}

/* Goal Card Styling */
.goal-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  background: var(--card);
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  cursor: pointer;
  transition: transform 0.2s;
}

.goal-card:active {
  transform: scale(0.98);
}

.goal-label {
  font-size: 13px;
  color: var(--text-700);
  margin: 0 0 4px 0;
  font-weight: 500;
}

.target-amount {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--brand);
}

/* Requirement 2: Smaller Arrow */
.menu-arrow {
  width: 16px;
  height: 16px;
  color: #bdc3c7;
}

/* Requirement 1: FAB with big font */
.fab {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--fab-bg);
  color: white;
  border: none;
  font-size: 32px; /* Bigger Font/Icon */
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-end; /* Mobile-first slide up feel */
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-700);
}

.custom-input, .custom-select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  background: var(--brand);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background: #f0f0f0;
  color: var(--text-700);
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
}

.btn-danger {
  background: #ff4757;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
}

.loading-message {
  text-align: center;
  padding: 40px;
  color: var(--text-700);
}
</style>
