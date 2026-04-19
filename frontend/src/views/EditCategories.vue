<template>
  <div class="web-page">
    <header class="edit-header">
      <button class="icon-btn" type="button" aria-label="Go back" @click="$router.back()">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h1>Edit Category</h1>
      <button class="save-btn" @click="saveCategory" :disabled="saving">
        {{ saving ? "Saving..." : "Save" }}
      </button>
    </header>

    <main v-if="loading" class="page-content">
      <div class="placeholder">Loading category...</div>
    </main>

    <main v-else class="page-content">
      <div class="form-group">
        <p class="form-label type-line">
          Type:
          <span class="type-value" :class="form.type">
            {{ form.type === "income" ? "Income" : "Expense" }}
          </span>
        </p>
      </div>

      <div class="form-group">
        <label class="form-label">
          Category Name <span class="required">*</span></label
        >
        <div class="input-with-prefix" :class="{ 'input-error': errors.name }">
          <input
            v-model="form.name"
            type="text"
            maxlength="50"
            placeholder="Groceries, Salary, etc."
            class="form-input"
            :class="{ 'input-error': errors.name }"
          />
        </div>
        <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
      </div>

      <div class="info-box">
        <div class="info-icon-wrap">
          <svg class="info-icon" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path
              d="M12 10.5V15"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <circle cx="12" cy="7.8" r="1" fill="currentColor" />
          </svg>
        </div>

        <div class="info-copy">
          <p class="info-title">Usage Information</p>
          <p class="info-text">
            This category is currently used in
            {{ categoryTransactionCount }} transaction<span
              v-if="categoryTransactionCount !== 1"
              >s</span
            >. Changes will be reflected in the Transactions List, Categories
            List, Dashboard, and Insights.
          </p>
        </div>
      </div>

      <!-- Delete button -->
      <button
        class="delete-btn"
        @click="deleteCategory"
        :disabled="deleting"
        type="button"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          width="16"
          height="16"
        >
          <polyline points="3 6 5 6 21 6" />
          <path
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          />
        </svg>
        {{ deleting ? "Deleting..." : "Delete Category" }}
      </button>

      <p v-if="deleteError" class="error-msg">{{ deleteError }}</p>
    </main>
  </div>
</template>

<script>
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase";
import { ED } from "@/services/editDelete";
import { useAuthStore } from "@/stores/AuthStore";
import { useCategoriesStore } from "@/stores/categories";
import { useTransactionsStore } from "@/stores/transactions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/categories";

export default {
  name: "EditCategories",
  data() {
    return {
      loading: true,
      saving: false,
      deleteError: "",
      deleting: false,
      form: {
        type: "expense",
        name: "",
      },
      originalCategory: {
        type: "",
        name: "",
      },
      errors: {},
    };
  },
  computed: {
    categories() {
      return this.categoriesStore.categories
        .filter(
          (category) =>
            category.type === this.form.type &&
            category.id !== this.$route.params.id,
        )
        .map((category) => category.name);
    },
    transactionCounts() {
      return this.transactionsStore.transactions.reduce(
        (accumulator, transaction) => {
          const key = `${transaction.type}:${transaction.category}`;
          accumulator[key] = (accumulator[key] || 0) + 1;
          return accumulator;
        },
        {},
      );
    },
    categoryTransactionCount() {
      const key = `${this.originalCategory.type}:${this.originalCategory.name}`;
      return this.transactionCounts[key] || 0;
    },
  },
  async created() {
    await this.fetchCategory();
    if (this.authStore.currentUserId) {
      await this.categoriesStore.fetchCategories(this.authStore.currentUserId);
      await this.transactionsStore.fetchTransactions(
        this.authStore.currentUserId,
      );
    }
  },
  methods: {
    normalizeCategoryName(name) {
      return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    },
    async fetchCategory() {
      const categoryId = this.$route.params.id;
      try {
        const categoryRef = doc(db, "categories", categoryId);
        const categorySnap = await getDoc(categoryRef);

        if (categorySnap.exists()) {
          const data = categorySnap.data();
          this.form.type = data.type || "expense";
          this.form.name = data.name || "";
          this.originalCategory.type = data.type || "expense";
          this.originalCategory.name = data.name || "";
          console.log("Fetched category data:", data);
        } else {
          this.errors.name = "Category not found";
          console.error("Category not found with ID:", categoryId);
        }
      } catch (err) {
        console.error("Error fetching category:", err);
      } finally {
        this.loading = false;
      }
    },
    async validate(mode = "save") {
      // Edit Category validation logic -> Checks if edited category name exists, if yes, reject edit
      // Delete Category validation logic -> Checks if category is used in any transactions, if yes, reject deletion
      this.errors = {};
      this.deleteError = "";

      const normalizedName = this.normalizeCategoryName(this.form.name);
      const existingNames = this.categories.map((category) =>
        this.normalizeCategoryName(category),
      );

      console.log("Existing category names:", existingNames);

      if (mode === "save") {
        if (!this.form.name.trim()) {
          this.errors.name =
            "Category name is required, please enter a new category name";
        } else if (existingNames.includes(normalizedName)) {
          this.errors.name = "A category with this name already exists.";
        }
      }

      if (mode === "delete") {
        try {
          const originalCategoryName = this.originalCategory.name.trim();
          const originalCategoryType = this.originalCategory.type;

          const q = query(
            collection(db, "transactions"),
            where("userId", "==", this.authStore.currentUserId),
            where("type", "==", originalCategoryType),
            where("category", "==", originalCategoryName),
          );

          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            this.deleteError = `The ${originalCategoryName} category is currently used in transactions and cannot be deleted. Reassign affected transactions before completing deletion.`;
          }
        } catch (error) {
          console.error("Error validating category deletion:", error);
          this.deleteError = error.message;
        }
      }

      return Object.keys(this.errors).length === 0 && !this.deleteError;
    },
    // Writes new category name to Firestore, and updates all transactions that used the previous category name with the new category name
    async saveCategory() {
      const isValid = await this.validate("save");
      if (!isValid) return;

      this.saving = true;
      try {
        const categoryId = this.$route.params.id;
        const categoryRef = doc(db, "categories", categoryId);

        const currentType = this.originalCategory.type;

        const newName = this.form.name.trim();
        const oldName = this.originalCategory.name.trim();

        const updatedData = {
          type: currentType,
          name: newName,
        };

        await updateDoc(categoryRef, updatedData);

        const transactionsQuery = query(
          collection(db, "transactions"),
          where("userId", "==", this.authStore.currentUserId),
          where("type", "==", currentType),
          where("category", "==", oldName),
        );

        const transactionsSnapshot = await getDocs(transactionsQuery);

        if (!transactionsSnapshot.empty) {
          const batch = writeBatch(db);

          transactionsSnapshot.forEach((doc) => {
            batch.update(doc.ref, {
              type: currentType,
              category: newName,
            });
          });

          await batch.commit();
        }

        await this.categoriesStore.fetchCategories(
          this.authStore.currentUserId,
        );
        await this.transactionsStore.fetchTransactions(
          this.authStore.currentUserId,
        );

        this.$router.push(`/settings/categories`);
      } catch (err) {
        console.error("Error updating category:", err);
        alert("Failed to save changes. Please try again.");
      } finally {
        this.saving = false;
      }
    },
    async deleteCategory() {
      console.log("deleteCategory called");
      this.deleting = true;
      this.deleteError = "";

      try {
        const isValid = await this.validate("delete");

        if (!isValid) {
          console.log("Category deletion validation failed:", this.deleteError);
          return;
        }

        const categoryId = this.$route.params.id;
        const categoryRef = doc(db, "categories", categoryId);

        await deleteDoc(categoryRef);
        await this.categoriesStore.fetchCategories(
          this.authStore.currentUserId,
        );

        this.$router.push(`/settings/categories`);
      } catch (error) {
        console.error("Error deleting category:", error);
        this.deleteError = "Failed to delete category. Please try again.";
      } finally {
        this.deleting = false;
      }
    },
  },
  setup() {
    const authStore = useAuthStore();
    const categoriesStore = useCategoriesStore();
    const transactionsStore = useTransactionsStore();
    return {
      authStore,
      categoriesStore,
      transactionsStore,
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap");

.web-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f6f5;
  font-family: "Poppins", sans-serif;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #dfe6e3;
}

.edit-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #24302c;
}

.icon-btn {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  color: #344054;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(36, 48, 44, 0.06);
}

.icon-btn:active {
  background: rgba(36, 48, 44, 0.12);
}

.icon-btn svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.save-btn {
  background: #4a6e5e;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}

.save-btn:hover {
  background: #3d5a4f;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-content {
  flex: 1;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #24302c;
  margin-bottom: 6px;
}

.required {
  color: #d9534f;
}

.type-line {
  margin: 0;
}

.type-value {
  margin-left: 6px;
  font-size: inherit;
  font-weight: inherit;
}

.type-value.expense {
  color: #d9534f;
}

.type-value.income {
  color: #2d8a4f;
}

.toggle-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: "Poppins", sans-serif;
  background: transparent;
  color: #5e6c66;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active.expense {
  background: #d9534f;
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.toggle-btn.active.income {
  background: #2d8a4f;
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dfe6e3;
  border-radius: 12px;
  font-size: 15px;
  color: #24302c;
  background: #fff;
  outline: none;
  font-family: "Poppins", sans-serif;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #5e9486;
}

.form-input.input-error {
  border-color: #d9534f;
}

.error-msg {
  display: block;
  font-size: 12px;
  color: #d9534f;
  margin-top: 4px;
}

.placeholder {
  padding: 24px;
  text-align: center;
  color: #5e6c66;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #eef5ff;
  border: 1px solid #cfe0ff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 20px;
}

.info-icon-wrap {
  color: #5b8def;
  flex-shrink: 0;
  margin-top: 1px;
}

.info-icon {
  width: 18px;
  height: 18px;
}

.info-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #4c6ea9;
}

.info-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #4c6ea9;
}

/* Delete button */
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: #fff;
  color: #d9534f;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  font-family: "Poppins", sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}

.delete-btn:hover {
  background: #fef2f2;
}
</style>
