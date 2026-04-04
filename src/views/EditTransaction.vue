<template>
  <div class="web-page">
    <header class="edit-header">
      <button class="icon-btn" @click="$router.back()">
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
      <h1>Edit Transaction</h1>
      <button class="save-btn" @click="saveTransaction" :disabled="saving">
        {{ saving ? "Saving..." : "Save" }}
      </button>
    </header>

    <main v-if="loading" class="page-content">
      <div class="placeholder">Loading transaction...</div>
    </main>

    <main v-else class="page-content">
      <div class="form-group">
        <label class="form-label">Type</label>
        <div class="type-toggle">
          <button
            class="toggle-btn"
            :class="{
              active: form.type === 'expense',
              expense: form.type === 'expense',
            }"
            @click="form.type = 'expense'"
          >
            Expense
          </button>
          <button
            class="toggle-btn"
            :class="{
              active: form.type === 'income',
              income: form.type === 'income',
            }"
            @click="form.type = 'income'"
          >
            Income
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Amount <span class="required">*</span></label>
        <div
          class="input-with-prefix"
          :class="{ 'input-error': errors.amount }"
        >
          <span class="prefix">$</span>
          <input
            v-model="form.amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            class="form-input amount-input"
          />
        </div>
        <span v-if="errors.amount" class="error-msg">{{ errors.amount }}</span>
      </div>

      <div class="form-group">
        <label class="form-label"
          >Category <span class="required">*</span></label
        >
        <select
          v-model="form.category"
          class="form-input"
          :class="{ 'input-error': errors.category }"
        >
          <option value="" disabled>Select a category</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
        <span v-if="errors.category" class="error-msg">{{
          errors.category
        }}</span>
      </div>

      <div class="form-group">
        <label class="form-label">Date <span class="required">*</span></label>
        <input
          v-model="form.dateStr"
          type="date"
          class="form-input"
          :class="{ 'input-error': errors.date }"
        />
        <span v-if="errors.date" class="error-msg">{{ errors.date }}</span>
      </div>

      <div class="form-group">
        <label class="form-label">Merchant (Optional)</label>
        <input
          v-model="form.merchant"
          type="text"
          placeholder="e.g. Whole Foods"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Notes (Optional)</label>
        <textarea
          v-model="form.note"
          placeholder="Add any additional details..."
          class="form-input textarea"
          rows="3"
        ></textarea>
      </div>
    </main>
  </div>
</template>

<script>
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { ED } from "@/services/editDelete";
import { useTransactionsStore } from "@/stores/transactions";
import { useAuthStore } from "@/stores/AuthStore";
import { useCategoriesStore } from "@/stores/categories";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/categories";

export default {
  name: "EditTransaction",
  data() {
    return {
      loading: true,
      saving: false,
      form: {
        type: "expense",
        amount: "",
        category: "",
        dateStr: "",
        merchant: "",
        note: "",
      },
      errors: {},
    };
  },
  computed: {
    categories() {
      return this.categoriesStore.categories
        .filter((c) => c.type === this.form.type)
        .map((c) => c.name);
    },
  },
  async created() {
    await this.fetchTransaction();
  },
  watch: {
    "form.type"(nextType) {
      if (!this.categories.includes(this.form.category)) {
        this.form.category = "";
      }
    },
  },
  methods: {
    async fetchTransaction() {
      const txnId = this.$route.params.id;
      try {
        const txnRef = doc(db, "transactions", txnId);
        const txnSnap = await getDoc(txnRef);

        if (txnSnap.exists()) {
          const data = txnSnap.data();
          this.form.type = data.type || "expense";
          this.form.amount = data.amount || "";
          this.form.category = data.category || "";
          this.form.merchant = data.merchant || "";
          this.form.note = data.note || "";

          if (data.date) {
            const date = data.date.toDate
              ? data.date.toDate()
              : new Date(data.date);
            this.form.dateStr = date.toISOString().split("T")[0];
          }
        }
      } catch (err) {
        console.error("Error fetching transaction:", err);
      } finally {
        this.loading = false;
      }
    },

    validate() {
      this.errors = {};

      if (!this.form.amount || Number(this.form.amount) <= 0) {
        this.errors.amount = "Amount must be greater than 0.";
      }
      if (!this.form.category) {
        this.errors.category = "Please select a category.";
      }
      if (!this.form.dateStr) {
        this.errors.date = "Please select a date.";
      }

      return Object.keys(this.errors).length === 0;
    },

    async saveTransaction() {
      if (!this.validate()) return;

      this.saving = true;
      try {
        const txnId = this.$route.params.id;
        const updatedData = {
          type: this.form.type,
          amount: Number(this.form.amount),
          category: this.form.category,
          date: Timestamp.fromDate(new Date(this.form.dateStr)),
          merchant: this.form.merchant || "",
          note: this.form.note || "",
        };

        await ED.updateTransaction(txnId, updatedData);
        this.$router.push(`/transactions/${txnId}`);
      } catch (err) {
        console.error("Error updating transaction:", err);
        alert("Failed to save changes. Please try again.");
      } finally {
        this.saving = false;
      }
    },
  },
  setup() {
    const store = useTransactionsStore();
    const authStore = useAuthStore();
    const categoriesStore = useCategoriesStore();
    return { store, authStore, categoriesStore };
  },
  async mounted() {
    if (this.authStore.currentUserId) {
      await this.categoriesStore.fetchCategories(this.authStore.currentUserId);
    }
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
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #24302c;
}

.icon-btn svg {
  width: 22px;
  height: 22px;
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

.type-toggle {
  display: flex;
  background: #e8ecea;
  border-radius: 24px;
  padding: 4px;
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

.input-with-prefix {
  display: flex;
  align-items: center;
  border: 1px solid #dfe6e3;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: border-color 0.15s;
}

.input-with-prefix:focus-within {
  border-color: #5e9486;
}

.input-with-prefix.input-error {
  border-color: #d9534f;
}

.prefix {
  padding: 12px 0 12px 14px;
  font-size: 15px;
  color: #5e6c66;
}

.amount-input {
  border: none;
  border-radius: 0;
  padding-left: 4px;
}

.amount-input:focus {
  border-color: transparent;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235e6c66' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
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
</style>
