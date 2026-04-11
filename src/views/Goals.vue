<template>
  <div class="web-page">
    <header class="page-header">
      <div class="header-left">
        <button @click="$router.back()" class="back-btn">←</button>
        <h1>Goals</h1>
      </div>
      <div class="header-icons">
        <button
          class="icon-button"
          @click="goalStore.init(authStore.currentUserId)"
        >
          🔄
        </button>
      </div>
    </header>

    <main class="page-content">
      <div v-if="goalStore.loading" class="loading-message">
        Loading goals...
      </div>

      <div v-else class="goal-list">
        <div
          v-for="goal in goalStore.formattedGoals"
          :key="goal.id"
          class="goal-card"
          @click="openDetails(goal)"
        >
          <div class="goal-info">
            <p class="goal-label">{{ goal.displayName }}</p>
            <h3 class="target-amount">
              ${{ goal.targetAmount.toLocaleString() }}
            </h3>
          </div>

          <div class="goal-actions-inline">
            <button class="delete-icon-btn" @click.stop="confirmDelete(goal)">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                ></path>
              </svg>
            </button>
            <svg class="menu-arrow" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 7L15 12L10 17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </div>
        </div>

        <button class="fab" @click="showAddModal = true">+</button>
      </div>

      <div
        v-if="showAddModal || isEditing"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="modal-content">
          <h2>{{ isEditing ? "Edit Goal" : "Add New Goal" }}</h2>

          <div class="form-group">
            <label>Goal Type</label>
            <select
              v-model="goalForm.type"
              :disabled="isEditing"
              class="custom-select"
            >
              <option value="Monthly Total Spending Cap">
                Monthly Total Spending Cap
              </option>
              <option value="Monthly Category Spending Cap">
                Monthly Category Spending Cap
              </option>
              <option value="Monthly Savings Target">
                Monthly Savings Target
              </option>
            </select>
          </div>

          <div
            v-if="goalForm.type === 'Monthly Category Spending Cap'"
            class="form-group"
          >
            <label>Category</label>
            <select v-model="goalForm.category" class="custom-select">
              <option value="" disabled>Select a category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
            <p v-if="errors.category" class="error-text">
              {{ errors.category }}
            </p>
          </div>

          <div class="form-group">
            <label>Target Amount ($)</label>
            <input
              v-model.number="goalForm.targetAmount"
              type="number"
              placeholder="0.00"
              class="custom-input"
            />
            <p v-if="errors.targetAmount" class="error-text">
              {{ errors.targetAmount }}
            </p>
          </div>

          <div class="modal-actions">
            <button
              v-if="isEditing"
              @click="showDeleteConfirm = true"
              class="btn-danger-outline"
            >
              Delete
            </button>
            <button @click="closeModal" class="btn-secondary">Cancel</button>
            <button
              @click="handleSave"
              class="btn-primary"
              :disabled="isProcessing"
            >
              {{ isProcessing ? "Saving..." : "Save" }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="modal-overlay">
        <div class="modal-content confirm-modal">
          <h3>Delete Goal?</h3>
          <p>Are you sure? This cannot be undone.</p>
          <div class="modal-actions">
            <button @click="showDeleteConfirm = false" class="btn-secondary">
              Cancel
            </button>
            <button
              @click="handleDelete"
              class="btn-danger"
              :disabled="isProcessing"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="showOverrideConfirm" class="modal-overlay">
        <div class="modal-content confirm-modal">
          <h3>Duplicate Goal Found</h3>
          <p>
            A goal for
            <strong>{{
              goalForm.type === "Monthly Category Spending Cap"
                ? goalForm.category
                : "this type"
            }}</strong>
            already exists. Override it?
          </p>
          <div class="modal-actions">
            <button @click="showOverrideConfirm = false" class="btn-secondary">
              Cancel
            </button>
            <button
              @click="executeSave(duplicateGoalId)"
              class="btn-primary"
              :disabled="isProcessing"
            >
              Override
            </button>
          </div>
        </div>
      </div>
    </main>

    <BottomNav currentTab="settings" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import BottomNav from "@/components/BottomNav.vue";
import { useGoalStore } from "../stores/GoalStore";
import { useAuthStore } from "../stores/AuthStore";
import { useCategoriesStore } from "../stores/categories";
import { EXPENSE_CATEGORIES } from "../constants/categories";

const goalStore = useGoalStore();
const authStore = useAuthStore();
const categoriesStore = useCategoriesStore();
const showOverrideConfirm = ref(false);
const duplicateGoalId = ref(null);

const showAddModal = ref(false);
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const isProcessing = ref(false);
const selectedGoal = ref(null);
const errors = reactive({ targetAmount: "", category: "" });

const goalForm = reactive({
  type: "Monthly Total Spending Cap",
  targetAmount: null,
  category: "",
});

const categories = computed(() =>
  categoriesStore.categories
    .filter((c) => c.type === "expense")
    .map((c) => c.name),
);

onMounted(async () => {
  if (authStore.currentUserId) {
    await Promise.all([
      goalStore.init(authStore.currentUserId),
      categoriesStore.fetchCategories(authStore.currentUserId),
    ]);
  }
});

watch(
  () => authStore.currentUserId,
  async (newUserId) => {
    if (newUserId) {
      await Promise.all([
        goalStore.init(newUserId),
        categoriesStore.fetchCategories(newUserId),
      ]);
    } else {
      goalStore.cleanup();
      // If no categories are fetched from Firebase, use the default expense categories
      categoriesStore.categories = EXPENSE_CATEGORIES;
      console.log(
        "No expense categories stored in Firebase for " +
          newUserId +
          ". Please login and logout to add default transaction categories into Firebase.",
      );
    }
  },
);

const openDetails = (goal) => {
  selectedGoal.value = goal;
  Object.assign(goalForm, goal);
  isEditing.value = true;
};

const confirmDelete = (goal) => {
  selectedGoal.value = goal;
  showDeleteConfirm.value = true;
};

const validate = () => {
  let isValid = true;
  errors.targetAmount = "";
  errors.category = "";

  if (!goalForm.targetAmount || goalForm.targetAmount <= 0) {
    errors.targetAmount = "Enter a valid amount";
    isValid = false;
  }
  if (goalForm.type === "Monthly Category Spending Cap" && !goalForm.category) {
    errors.category = "Category is required";
    isValid = false;
  }
  return isValid;
};

const handleSave = async () => {
  if (!validate()) return;

  // ALWAYS check for duplicates, but pass the current ID to ignore itself
  const currentId = isEditing.value ? selectedGoal.value.id : null;
  const duplicate = goalStore.findDuplicate(goalForm, currentId);

  if (duplicate) {
    duplicateGoalId.value = duplicate.id;
    showOverrideConfirm.value = true;
    return;
  }

  await executeSave();
};

const executeSave = async (id = null) => {
  isProcessing.value = true;
  try {
    // Determine which ID to update:
    // - 'id' from override modal
    // - 'selectedGoal.value.id' from edit modal
    const targetId = id || (isEditing.value ? selectedGoal.value.id : null);

    // Clean data for Firestore (remove any local IDs from the form object)
    const { id: _, ...cleanData } = goalForm;
    const data = { ...cleanData, userId: authStore.currentUserId };

    console.log(
      "[Goals] Saving goal with userId:",
      authStore.currentUserId,
      "data:",
      data,
    );
    if (targetId) {
      await goalStore.updateGoal(targetId, data);
    } else {
      await goalStore.addGoal(data);
      console.log(
        "[Goals] Goal added. Reinitializing listener for userId:",
        authStore.currentUserId,
      );
      await goalStore.init(authStore.currentUserId);
    }
    closeModal();
  } finally {
    isProcessing.value = false;
    showOverrideConfirm.value = false;
    duplicateGoalId.value = null;
  }
};

const handleDelete = async () => {
  isProcessing.value = true;
  try {
    if (selectedGoal.value) {
      await goalStore.deleteGoal(selectedGoal.value.id);
    }
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
  goalForm.type = "Monthly Total Spending Cap";
  goalForm.targetAmount = null;
  goalForm.category = "";
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap");

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
  font-family: "Poppins", sans-serif;
  color: var(--text-900);
}

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
  font-size: 28px;
  cursor: pointer;
  color: var(--text-900);
  padding: 0;
}

.page-content {
  padding: 20px;
  flex: 1;
  background: var(--bg);
}

.goal-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  background: var(--card);
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.goal-actions-inline {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delete-icon-btn {
  background: none;
  border: none;
  color: #ff4757;
  padding: 8px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.delete-icon-btn:hover {
  opacity: 1;
}

.goal-label {
  font-size: 13px;
  color: var(--text-700);
  margin: 0 0 4px 0;
}

.target-amount {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--brand);
}

.menu-arrow {
  width: 16px;
  height: 16px;
  color: #bdc3c7;
}

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
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  flex: 1;
}

.btn-primary {
  background: var(--brand);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
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
.btn-danger-outline {
  background: transparent;
  color: #ff4757;
  border: 2px solid #ff4757;
  border-radius: 12px;
  font-weight: 600;
}

.error-text {
  color: #ff4757;
  font-size: 12px;
  margin-top: 4px;
}
</style>
