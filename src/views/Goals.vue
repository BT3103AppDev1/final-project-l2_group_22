<template>
  <div class="web-page">
    <header class="page-header">
      <button @click="$router.back()" class="back-btn">←</button>
      <h1>Goals</h1>
    </header>

    <main class="page-content">
      <div v-if="goalStore.loading" class="loading">Loading goals...</div>
      
      <div v-else class="goal-list">
        <div 
          v-for="goal in goalStore.formattedGoals" 
          :key="goal.id" 
          class="goal-card"
          @click="openDetails(goal)"
        >
          <div class="goal-info">
            <h3>{{ goal.displayName }}</h3>
            <p class="target-amount">${{ goal.targetAmount }}</p>
          </div>
          <svg class="menu-arrow" viewBox="0 0 24 24" fill="none"><path d="M10 7L15 12L10 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </div>

        <button class="add-goal-btn" @click="showAddModal = true">+ Add Goal</button>
      </div>

      <div v-if="showAddModal || isEditing" class="modal-overlay">
        <div class="modal-content">
          <h2>{{ isEditing ? 'Edit Goal' : 'Add Goal' }}</h2>
          
          <label>Goal Type</label>
          <select v-model="goalForm.type" :disabled="isEditing">
            <option value="Monthly Total Spending Cap">Monthly Total Spending Cap</option>
            <option value="Monthly Category Spending Cap">Monthly Category Spending Cap</option>
            <option value="Monthly Savings Target">Monthly Savings Target</option>
          </select>

          <div v-if="goalForm.type === 'Monthly Category Spending Cap'">
            <label>Category</label>
            <select v-model="goalForm.category">
              <option value="" disabled>Select a category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <p v-if="errors.category" class="error-text">{{ errors.category }}</p>
          </div>

          <label>Target Amount</label>
          <input v-model.number="goalForm.targetAmount" type="number" placeholder="0.00" />
          <p v-if="errors.targetAmount" class="error-text">{{ errors.targetAmount }}</p>

          <div class="modal-actions">
            <button @click="closeModal">Cancel</button>
            <button @click="handleSave" class="save-btn" :disabled="isProcessing">Save</button>
          </div>
        </div>
      </div>

      <div v-if="selectedGoal && !isEditing" class="modal-overlay">
        <div class="modal-content">
          <h2>Goal Details</h2>
          <p><strong>Name:</strong> {{ selectedGoal.displayName }}</p>
          <p><strong>Target:</strong> ${{ selectedGoal.targetAmount }}</p>

          <div class="modal-actions">
            <button @click="isEditing = true">Edit</button>
            <button @click="showDeleteConfirm = true" class="delete-btn">Delete</button>
            <button @click="selectedGoal = null">Close</button>
          </div>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="modal-overlay">
        <div class="modal-content confirm-modal">
          <p>Are you sure you want to delete this record?</p>
          <div class="modal-actions">
            <button @click="showDeleteConfirm = false">Cancel</button>
            <button @click="handleDelete" class="delete-btn" :disabled="isProcessing">Confirm Delete</button>
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

// UI State
const showAddModal = ref(false);
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const isProcessing = ref(false);
const selectedGoal = ref(null);
const errors = reactive({ targetAmount: '', category: '' });

// Form Data
const goalForm = reactive({
  type: 'Monthly Total Spending Cap',
  targetAmount: null,
  category: ''
});

// Mock categories (replace with your actual category list)
const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities'];

onMounted(() => {
  // Replace 'user123' with your actual dynamic auth ID
  goalStore.init('user123');
});

const openDetails = (goal) => {
  selectedGoal.value = goal;
  Object.assign(goalForm, goal);
};

const validate = () => {
  let isValid = true;
  errors.targetAmount = '';
  errors.category = '';

  if (!goalForm.targetAmount || goalForm.targetAmount <= 0) {
    errors.targetAmount = 'Target Amount must be a positive number.';
    isValid = false;
  }

  if (goalForm.type === 'Monthly Category Spending Cap' && !goalForm.category) {
    errors.category = 'Category is required for this goal type.';
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
  // Reset form
  goalForm.type = 'Monthly Total Spending Cap';
  goalForm.targetAmount = null;
  goalForm.category = '';
};
</script>

<style scoped>
/* Add your styling here to match your Settings theme */
.goal-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
}
.error-text { color: red; font-size: 0.8rem; margin-top: 4px; }
.add-goal-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
}
.delete-btn { color: red; }
</style>
