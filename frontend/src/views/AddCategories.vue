<template>
  <div class="web-page">
    <header class="page-header">
      <button class="back-button" @click="goBack">
        <span class="back-arrow">&#8592;</span>
      </button>
      <h1>Add Category</h1>
      <div class="header-spacer"></div>
    </header>

    <main class="page-content">
      <form class="category-form" @submit.prevent="handleSave">
        <!-- Type Selector -->
        <div class="form-group">
          <label class="field-label">Type</label>
          <div class="type-toggle">
            <button
              type="button"
              class="type-btn"
              :class="{ active: type === 'expense' }"
              @click="handleTypeChange('expense')"
            >
              Expense
            </button>
            <button
              type="button"
              class="type-btn"
              :class="{ active: type === 'income' }"
              @click="handleTypeChange('income')"
            >
              Income
            </button>
          </div>
        </div>

        <!-- Category -->
        <div class="form-group">
          <label for="category" class="field-label">
            Category Name <span class="required">*</span></label
          >
          <input
            id="category"
            type="text"
            :value="category"
            class="field-input"
            :class="{ 'input-error': errors.category }"
            @change="handleCategoryChange($event.target.value)"
          />
          <span v-if="errors.category" class="error-text">{{
            errors.category
          }}</span>
        </div>

        <!-- Category Description Message -->
        <div class="form-group">
          <p for="description" class="field-label">About Categories</p>
          <div class="categorydescription-box">{{ categoryDescription }}</div>
        </div>

        <!-- Error message -->
        <div v-if="saveError" class="save-error">{{ saveError }}</div>

        <!-- Action buttons -->
        <div class="form-actions">
          <button type="submit" class="save-button" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span class="button-text">{{
              isLoading ? "Saving..." : "Save Category"
            }}</span>
          </button>
          <button
            type="button"
            class="cancel-button"
            @click="goBack"
            :disabled="isLoading"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>

    <BottomNav currentTab="settings" />
  </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue";
import { useCategoriesStore } from "@/stores/categories";
import { useAuthStore } from "@/stores/AuthStore";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/categories";

export default {
  name: "AddCategories",
  components: { BottomNav },

  data() {
    return {
      type: "expense",
      category: "",
      errors: {
        category: "",
      },
      isLoading: false,
      saveError: "",
      categoryDescription:
        "Categories help you organize your transactions and provides meaniningful insights on your spending habits. Choose a name that clearly represents the type of expenses or income you want to categorize. For example, 'Groceries' for food shopping, 'Utilities' for bills, or 'Salary' for income. You can always edit or delete categories later if your needs change.",
    };
  },
  async mounted() {
    try {
      if (this.authStore.currentUserId) {
        console.log("Before fetchCategories");
        await this.categoriesStore.fetchCategories(
          this.authStore.currentUserId,
        );
        console.log("currentUserId:", this.authStore.currentUserId);
        console.log("Categories in store:", this.categoriesStore.categories);
      }
    } catch (error) {
      console.error("Mounted load error:", error);
    }
  },

  created() {
    const queryType = this.$route.query.type;
    if (queryType === "income" || queryType === "expense") {
      this.type = queryType;
    }
  },

  methods: {
    handleTypeChange(newType) {
      this.type = newType;
    },
    handleCategoryChange(selectedCategory) {
      this.category = selectedCategory;
      this.errors.category = "";
    },
    goBack() {
      this.$router.push(`/settings/categories`);
    },
    normalizeCategoryName(name) {
      return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    },
    validateForm() {
      const errors = {};
      let isValid = true;
      const categoryName = this.normalizeCategoryName(this.category);
      const existingCategories = this.categoriesStore.categories
        .filter((category) => category.type === this.type)
        .map((category) => this.normalizeCategoryName(category.name));

      console.log("Existing categories:", existingCategories);

      // Validate categories, check if the category already exists
      if (!categoryName) {
        errors.category = "Please enter a category name";
        isValid = false;
      } else if (existingCategories.includes(categoryName)) {
        errors.category =
          "This category already exists, please add a different category";
        isValid = false;
      }

      return { isValid, errors };
    },

    async handleSave() {
      this.saveError = "";
      const validation = this.validateForm();

      if (!validation.isValid) {
        this.errors = validation.errors;
        console.log("Validation errors:", this.errors);
        alert("Validation error: " + this.errors.category);
        return;
      }

      this.isLoading = true;

      try {
        await this.categoriesStore.addCategory({
          type: this.type,
          name: this.category,
          userId: this.authStore.currentUserId,
        });

        alert("New category saved successfully!");
        this.goBack(); // Redirect back to categories page after sucessfully saving
      } catch (error) {
        this.saveError = "Failed to save category name. Please try again.";
        console.error("Save error:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },

  setup() {
    const categoriesStore = useCategoriesStore();
    const authStore = useAuthStore();
    return { categoriesStore, authStore };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap");

:root {
  --bg: #f4f6f5;
  --text-900: #24302c;
  --text-700: #5e6c66;
  --brand: #5e9486;
  --border: #dfe6e3;
}

.web-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  font-family: "Poppins", sans-serif;
}

.page-header {
  padding: 16px 20px;
  border-bottom: 2px solid darkgray;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-button:hover {
  background: rgba(36, 48, 44, 0.05);
}

.back-button:active {
  background: rgba(36, 48, 44, 0.1);
}

.back-arrow {
  font-size: 24px;
  color: var(--text-900);
  line-height: 1;
  font-weight: 600;
}

.page-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-900);
}

.header-spacer {
  width: 36px;
}

.page-content {
  padding: 20px;
  flex: 1;
}

.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-900);
  letter-spacing: 0.3px;
}

.required {
  color: #d9534f;
}

.optional {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-700);
}

/* Type toggle */
.type-toggle {
  display: flex;
  width: 100%;
  gap: 12px;
}

.type-btn {
  flex: 1;
  border: 1.5px solid #e2e8e0;
  background: white;
  padding: 14px 20px;
  color: var(--text-900);
  font-size: 15px;
  font-weight: 500;
  font-family: "Poppins", sans-serif;
  cursor: pointer;
  text-align: center;
  border-radius: 10px;
  transition: all 0.2s;
}

.type-btn:hover:not(.active) {
  border-color: #d1dcd8;
  background: #fafbfa;
}

.type-btn.active {
  background: #5e9486;
  color: white;
  border-color: #5e9486;
  font-weight: 600;
}

/* Form inputs */
.field-input {
  border: 1.5px solid #e2e8e0;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  font-family: "Poppins", sans-serif;
  color: var(--text-900);
  background: white;
  outline: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  appearance: none;
  -webkit-appearance: none;
  line-height: 1.5;
}

.field-input:hover:not(:disabled):not(.input-error) {
  border-color: #d1dcd8;
  background: #fafbfa;
}

.field-input:focus {
  border-color: var(--brand);
  background: white;
  box-shadow:
    0 0 0 4px rgba(94, 148, 134, 0.1),
    0 0 0 1px rgba(94, 148, 134, 0.2);
}

.field-input.input-error {
  border-color: #f5a5a0;
  background: #fff9f9;
}

.field-input.input-error:focus {
  border-color: #d9534f;
  box-shadow:
    0 0 0 4px rgba(217, 83, 79, 0.1),
    0 0 0 1px rgba(217, 83, 79, 0.2);
}

/* Amount with currency prefix */
.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.currency-symbol {
  position: absolute;
  left: 16px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-700);
  pointer-events: none;
  z-index: 2;
  line-height: 1;
}

.amount-input {
  padding-left: 40px;
  width: 100%;
}

.amount-input::placeholder {
  color: #bcc4c0;
}

/* Select arrow */
select.field-input {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235e6c66' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  cursor: pointer;
}

/* Textarea */
.notes-input {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.error-text {
  font-size: 13px;
  color: #d9534f;
  font-weight: 500;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: slideDown 0.2s ease-out;
}

.error-text::before {
  content: "⚠";
  font-size: 14px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Save error message */
.save-error {
  background: #fff9f9;
  border: 1.5px solid #f5a5a0;
  color: #d9534f;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideDown 0.2s ease-out;
}

.save-error::before {
  content: "✕";
  font-size: 18px;
  font-weight: 700;
}

/* Form actions */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.save-button,
.cancel-button {
  flex: 1;
  min-width: 140px;
  border: none;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  border-radius: 26px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}

.save-button {
  background: #4a6e5e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

.save-button:hover:not(:disabled) {
  background: #3d5a4f;
  box-shadow: 0 2px 8px rgba(74, 110, 94, 0.3);
}

.save-button:active:not(:disabled) {
  transform: scale(0.98);
}

.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.button-text {
  font-weight: 600;
}

.cancel-button {
  background: #f0f0f0;
  color: var(--text-900);
  border: 1px solid var(--border);
}

.cancel-button:hover:not(:disabled) {
  background: #e8e8e8;
}

.cancel-button:active:not(:disabled) {
  transform: scale(0.98);
}

.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Date picker ── */
.date-field-wrapper {
  position: relative;
  width: 100%;
}

.date-input-group {
  position: relative;
  width: 100%;
}

.date-input {
  width: 100%;
  border: 1.5px solid #e2e8e0;
  border-radius: 12px;
  padding: 14px 48px 14px 16px;
  font-size: 15px;
  font-family: "Poppins", sans-serif;
  color: var(--text-900);
  background: white;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
}

.date-input:hover {
  border-color: #d1dcd8;
}

.date-input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 4px rgba(94, 148, 134, 0.1);
}

.date-input.input-error {
  border-color: #f5a5a0;
  background: #fff9f9;
}
.date-input.input-error:focus {
  border-color: #d9534f;
  box-shadow: 0 0 0 4px rgba(217, 83, 79, 0.1);
}

.calendar-icon-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  line-height: 1;
  transition: background 0.15s;
}

.calendar-icon-button:hover:not(:disabled) {
  background: rgba(94, 148, 134, 0.1);
}

.calendar-icon-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* ── Calendar popup ── */
.calendar-popup {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0; /* stretches to match .date-field-wrapper exactly */
  width: auto;
  background: white;
  border: 1.5px solid #e2e8e0;
  border-radius: 14px;
  padding: 14px 12px 10px;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.13);
  box-sizing: border-box;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.month-nav {
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  color: var(--text-900);
  flex-shrink: 0;
}

.month-nav:hover {
  background: #f0f0f0;
}

.month-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-900);
  text-align: center;
  flex: 1;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-700);
  padding: 4px 0;
  text-transform: uppercase;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 10px;
}

.calendar-day {
  height: 34px;
  border: none;
  border-radius: 50%;
  background: transparent;
  font-size: 13px;
  font-family: "Poppins", sans-serif;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  font-weight: 400;
  color: var(--text-900);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.calendar-day:hover:not(.is-other-month) {
  background: #f0f0f0;
}

.calendar-day.is-other-month {
  color: #bcc4c0;
  cursor: default;
}

.calendar-day.is-today {
  border: 1.5px solid var(--brand);
  color: var(--brand);
  font-weight: 600;
}

.calendar-day.is-selected {
  background: var(--brand);
  color: white;
  font-weight: 600;
}

.calendar-day.is-selected:hover {
  background: #4d7d70;
}

.calendar-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.footer-button {
  background: transparent;
  border: none;
  font-size: 13px;
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.footer-button.clear {
  color: #d9534f;
}
.footer-button.clear:hover {
  background: #fff0f0;
}

.footer-button.today {
  color: var(--brand);
}
.footer-button.today:hover {
  background: rgba(94, 148, 134, 0.08);
}
</style>
