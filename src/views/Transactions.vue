<template>
  <div class="web-page">
    <header class="page-header">
      <div class="header-left">
        <button @click="$router.back()" class="icon-button">←</button>
        <h1>Goals</h1>
      </div>
    </header>

    <main class="page-content">
      <p class="desc">Active Targets</p>

      <div v-if="goalStore.loading" class="loading-message">
        Fetching your goals...
      </div>

      <div v-else class="goals-container">
        <div 
          v-for="goal in goalStore.formattedGoals" 
          :key="goal.id" 
          class="goal-card"
          @click="openDetails(goal)"
        >
          <div class="goal-card-content">
            <div class="goal-info">
              <p class="goal-title">{{ goal.displayName }}</p>
              <p class="goal-amount">${{ goal.targetAmount }}</p>
            </div>
            <svg class="menu-arrow" viewBox="0 0 24 24" fill="none">
              <path d="M10 7L15 12L10 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </div>
        </div>
      </div>

      <button class="fab" @click="showAddModal = true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <div v-if="showAddModal || isEditing" class="modal-overlay">
        <div class="modal-card">
          <h3>{{ isEditing ? 'Edit Goal' : 'New Goal' }}</h3>
          
          <div class="form-group">
            <label>Goal Type</label>
            <select v-model="goalForm.type" :disabled="isEditing" class="custom-input">
              <option value="Monthly Total Spending Cap">Total Spending Cap</option>
              <option value="Monthly Category Spending Cap">Category Spending Cap</option>
              <option value="Monthly Savings Target">Savings Target</option>
            </select>
          </div>

          <div v-if="goalForm.type === 'Monthly Category Spending Cap'" class="form-group">
            <label>Category</label>
            <select v-model="goalForm.category" class="custom-input">
              <option value="" disabled>Select Category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <p v-if="errors.category" class="error-msg">{{ errors.category }}</p>
          </div>

          <div class="form-group">
            <label>Target Amount</label>
            <input v-model.number="goalForm.targetAmount" type="number" placeholder="0.00" class="custom-input" />
            <p v-if="errors.targetAmount" class="error-msg">{{ errors.targetAmount }}</p>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn-secondary">Cancel</button>
            <button @click="handleSave" class="btn-brand" :disabled="isProcessing">
              {{ isProcessing ? 'Saving...' : 'Save Goal' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="modal-overlay">
        <div class="modal-card confirm-box">
          <p>Delete this goal?</p>
          <div class="modal-footer">
            <button @click="showDeleteConfirm = false" class="btn-secondary">Cancel</button>
            <button @click="handleDelete" class="btn-danger" :disabled="isProcessing">Delete</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useGoalStore } from '../stores/goalStore';

const goalStore = useGoalStore();

// UI States
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

// Mock Categories
const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities'];

onMounted(() => {
  goalStore.init('user123'); // Replace with auth logic
});

const openDetails = (goal) => {
  selectedGoal.value = goal;
  Object.assign(goalForm, goal);
  isEditing.value = true;
};

const validate = () => {
  errors.targetAmount = '';
  errors.category = '';
  let valid = true;

  if (!goalForm.targetAmount || goalForm.targetAmount <= 0) {
    errors.targetAmount = 'Enter a valid amount';
    valid = false;
  }
  if (goalForm.type === 'Monthly Category Spending Cap' && !goalForm.category) {
    errors.category = 'Category required';
    valid = false;
  }
  return valid;
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

:root {
    --bg: #f4f6f5;
    --card: #ffffff;
    --text-900: #24302c;
    --text-700: #5e6c66;
    --brand: #5e9486;
    --border: #dfe6e3;
    --danger: #e74c3c;
}

.web-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
    font-family: 'Poppins', sans-serif;
}

.page-header {
    padding: 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.page-header h1 {
    margin: 0;
    font-size: 20px;
    color: var(--text-900);
}

.icon-button {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--text-900);
}

.page-content {
    padding: 20px;
    flex: 1;
    background: var(--bg);
}

.desc {
    font-size: 13px;
    color: var(--text-700);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
    font-weight: 600;
}

/* Goal Cards Style */
.goal-card {
    background: var(--card);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    cursor: pointer;
    transition: transform 0.2s;
}

.goal-card:active {
    transform: scale(0.98);
}

.goal-card-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.goal-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-900);
    margin: 0;
}

.goal-amount {
    font-size: 14px;
    color: var(--brand);
    margin: 4px 0 0 0;
    font-weight: 600;
}

.menu-arrow {
    width: 20px;
    color: var(--border);
}

/* FAB matching your Transactions style */
.fab {
    position: fixed;
    bottom: 30px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #3d5248; /* Matching your CSS value */
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

/* Modal Styling */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(36, 48, 44, 0.4);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
}

.modal-card {
    background: white;
    width: 100%;
    max-width: 400px;
    border-radius: 24px;
    padding: 24px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    font-size: 12px;
    color: var(--text-700);
    margin-bottom: 6px;
    font-weight: 500;
}

.custom-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    outline: none;
}

.custom-input:focus {
    border-color: var(--brand);
}

.modal-footer {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.btn-brand, .btn-secondary, .btn-danger {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Poppins';
}

.btn-brand { background: var(--brand); color: white; }
.btn-secondary { background: var(--bg); color: var(--text-700); }
.btn-danger { background: #fdeaea; color: var(--danger); }

.error-msg {
    color: var(--danger);
    font-size: 11px;
    margin-top: 4px;
}
</style>
