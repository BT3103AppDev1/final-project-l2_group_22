<template>
  <div class="categories-page">
    <header class="page-header">
      <button
        class="icon-button"
        type="button"
        aria-label="Go back"
        @click="$router.back()"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <h1>Categories</h1>
      <button
        class="icon-button"
        type="button"
        aria-label="Add category"
        @click="goToAddCategory"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </button>
    </header>

    <main class="page-content">
      <p v-if="store.loading" class="status-message">Loading categories...</p>
      <p v-else-if="store.error" class="status-message status-message--error">
        {{ store.error }}
      </p>

      <section
        v-for="section in categorySections"
        :key="section.type"
        class="category-section"
      >
        <div class="section-label">
          <span class="section-icon" :class="`section-icon--${section.type}`">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="7" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </span>
          <span>{{ section.label }}</span>
          <span class="section-count">({{ section.items.length }})</span>
        </div>

        <div class="category-card">
          <button
            v-for="item in section.items"
            :key="`${section.type}-${item.id || item.name}`"
            type="button"
            class="category-row"
            @click="goToEditCategory(item.id)"
          >
            <div class="row-copy">
              <span class="category-name">{{ item.name }}</span>
              <span class="transaction-count">{{
                formatTransactionLabel(item.count)
              }}</span>
            </div>

            <svg class="row-arrow" viewBox="0 0 24 24" fill="none">
              <path d="M10 7l5 5-5 5" />
            </svg>
          </button>
        </div>
      </section>
    </main>
    <BottomNav currentTab="settings" />

    <!-- Green add button on the bottom right corner, redirects to AddCategories.vue -->
    <button
      class="fab"
      type="button"
      aria-label="Add category"
      @click="goToAddCategory"
    >
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </button>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/AuthStore";
import { useCategoriesStore } from "@/stores/categories";
import { useTransactionsStore } from "@/stores/transactions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/categories";
import BottomNav from "@/components/BottomNav.vue";

export default {
  name: "Categories",
  components: {
    BottomNav,
  },
  setup() {
    const store = useTransactionsStore();
    const authStore = useAuthStore();
    const categoriesStore = useCategoriesStore();
    return { store, authStore, categoriesStore };
  },
  computed: {
    transactionCounts() {
      return this.store.transactions.reduce((accumulator, transaction) => {
        const key = `${transaction.type}:${transaction.category}`;
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {});
    },
    categorySections() {
      const defaultExpense = EXPENSE_CATEGORIES.map((name) => ({
        name,
        count: this.transactionCounts[`expense:${name}`] || 0,
      }));

      const defaultIncome = INCOME_CATEGORIES.map((name) => ({
        name,
        count: this.transactionCounts[`income:${name}`] || 0,
      }));

      const customExpense = this.categoriesStore.categories
        .filter((category) => category.type === "expense")
        .map((category) => ({
          id: category.id,
          name: category.name,
          count: this.transactionCounts[`expense:${category.name}`] || 0,
        }));

      const customIncome = this.categoriesStore.categories
        .filter((category) => category.type === "income")
        .map((category) => ({
          id: category.id,
          name: category.name,
          count: this.transactionCounts[`income:${category.name}`] || 0,
        }));

      return [
        {
          type: "expense",
          label: "EXPENSE CATEGORIES",
          items: [].concat(defaultExpense, customExpense),
        },
        {
          type: "income",
          label: "INCOME CATEGORIES",
          items: [].concat(defaultIncome, customIncome),
        },
      ];
    },
  },
  async mounted() {
    try {
      if (this.authStore.currentUserId) {
        console.log("Before fetchTransactions");
        await this.store.fetchTransactions(this.authStore.currentUserId);
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
  methods: {
    formatTransactionLabel(count) {
      return `${count} transaction${count === 1 ? "" : "s"}`;
    },
    goToTransactions(type) {
      this.$router.push(`/transactions?tab=${type}`);
    },
    goToAddTransaction() {
      this.$router.push("/add-transaction");
    },
    goToAddCategory() {
      this.$router.push("/add-category");
    },
    goToEditCategory(categoryId) {
      if (!categoryId) {
        console.error("No category ID provided for this category");
        return;
      }
      this.$router.push(`/settings/categories/${categoryId}`);
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");

.categories-page {
  min-height: 100vh;
  background: #f7f7f5;
  font-family: "Poppins", sans-serif;
  color: #1f2937;
  padding-bottom: 110px;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  gap: 12px;
  padding: 16px 18px 14px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid rgba(31, 41, 55, 0.06);
  backdrop-filter: blur(10px);
}

.page-header h1 {
  margin: 0;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.icon-button {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #344054;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.icon-button svg,
.fab svg,
.row-arrow,
.section-icon svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.page-content {
  width: min(100%, 460px);
  margin: 0 auto;
  padding: 18px 16px 32px;
}

.status-message {
  margin: 8px 0 18px;
  font-size: 14px;
  color: #667085;
}

.status-message--error {
  color: #b42318;
}

.category-section + .category-section {
  margin-top: 18px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: #8b95a7;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-count {
  color: #b5bcc8;
}

.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.section-icon--expense {
  color: #ef6b6b;
}

.section-icon--income {
  color: #45b26b;
}

.category-card {
  background: #fff;
  border: 1px solid rgba(16, 24, 40, 0.04);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
}

.category-row {
  width: 100%;
  border: none;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  cursor: pointer;
}

.category-row + .category-row {
  border-top: 1px solid #f0f2f5;
}

.row-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.category-name {
  font-size: 15px;
  font-weight: 600;
  color: #24302c;
}

.transaction-count {
  font-size: 12px;
  font-weight: 500;
  color: #98a2b3;
}

.row-arrow {
  flex-shrink: 0;
  color: #c0c7d2;
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 24px;
  width: 58px;
  height: 58px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #6da08f, #4a6e5e);
  color: #fff;
  box-shadow: 0 14px 28px rgba(74, 110, 94, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

@media (min-width: 768px) {
  .categories-page {
    padding-bottom: 40px;
  }

  .fab {
    right: calc(50% - 260px);
  }
}
</style>
