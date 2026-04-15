<template>
  <section class="uploader">
    <div class="hero-card">
      <p class="eyebrow">Smart Receipt Scan</p>
      <h2>Upload, Review, Confirm</h2>
      <p class="hero-text">
        Scan a receipt, review extracted details, choose an expense category,
        then confirm before saving.
      </p>

      <div class="upload-row">
        <label class="file-select" for="receipt-file">
          {{ selectedFile ? 'Change Receipt Image' : 'Choose Receipt Image' }}
        </label>
        <input
          id="receipt-file"
          type="file"
          accept="image/*"
          class="hidden-input"
          @change="handleFileSelection"
        />

        <button class="scan-btn" :disabled="!selectedFile || isProcessing" @click="submitImage">
          {{ isProcessing ? 'Scanning...' : 'Scan Receipt' }}
        </button>
      </div>

      <p v-if="selectedFile" class="file-meta">
        {{ selectedFile.name }}
      </p>
    </div>

    <div v-if="errorMsg" class="banner error">
      {{ errorMsg }}
    </div>

    <div v-if="successMsg" class="banner success">
      <span>{{ successMsg }}</span>
      <button class="link-button" @click="goToTransactions">View Transactions</button>
    </div>

    <div v-if="backendResult" class="draft-grid">
      <article class="panel ocr-preview">
        <h3>OCR Preview</h3>
        <div class="kv-list">
          <div class="kv-item">
            <span class="kv-label">Merchant</span>
            <span class="kv-value">{{ backendResult.merchant_name || '-' }}</span>
          </div>
          <div class="kv-item">
            <span class="kv-label">Date</span>
            <span class="kv-value">{{ backendResult.transaction_date || '-' }}</span>
          </div>
          <div class="kv-item">
            <span class="kv-label">Time</span>
            <span class="kv-value">{{ backendResult.transaction_time || '-' }}</span>
          </div>
          <div class="kv-item total-row">
            <span class="kv-label">Total</span>
            <span class="kv-value">{{ backendResult.total_amount ?? '-' }}</span>
          </div>
        </div>

        <details class="raw-json">
          <summary>View raw OCR JSON</summary>
          <pre>{{ formattedBackendResult }}</pre>
        </details>
      </article>

      <article class="panel confirm-panel">
        <h3>Confirm Expense</h3>
        <p class="panel-text">
          Edit any field below, then confirm to create a new expense transaction.
        </p>

        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" v-model="draft.category" :class="{ invalid: formErrors.category }">
            <option value="">Select category</option>
            <option v-for="category in expenseCategoryOptions" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <small v-if="formErrors.category" class="field-error">{{ formErrors.category }}</small>
        </div>

        <div class="form-group">
          <label for="amount">Amount</label>
          <input
            id="amount"
            v-model="draft.amount"
            type="number"
            min="0.01"
            step="0.01"
            :class="{ invalid: formErrors.amount }"
          />
          <small v-if="formErrors.amount" class="field-error">{{ formErrors.amount }}</small>
        </div>

        <div class="form-group">
          <label for="merchant">Merchant</label>
          <input id="merchant" v-model="draft.merchant" type="text" />
        </div>

        <div class="form-group">
          <label for="date">Date</label>
          <input id="date" v-model="draft.date" type="date" :class="{ invalid: formErrors.date }" />
          <small v-if="formErrors.date" class="field-error">{{ formErrors.date }}</small>
        </div>

        <div class="form-group">
          <label for="note">Note</label>
          <textarea id="note" v-model="draft.note" rows="4"></textarea>
        </div>

        <div class="action-row">
          <button class="confirm-btn" :disabled="!canConfirm || isSaving" @click="confirmExpense">
            {{ isSaving ? 'Saving...' : 'Confirm and Save Expense' }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ImageService } from '../api/imageService';
import { useAuthStore } from '@/stores/AuthStore';
import { useTransactionsStore } from '@/stores/transactions';
import { useCategoriesStore } from '@/stores/categories';
import { EXPENSE_CATEGORIES } from '@/constants/categories';

const selectedFile = ref(null);
const isProcessing = ref(false);
const isSaving = ref(false);
const backendResult = ref(null);
const errorMsg = ref('');
const successMsg = ref('');
const formErrors = ref({
  category: '',
  amount: '',
  date: '',
});
const draft = ref({
  category: '',
  amount: '',
  merchant: '',
  date: '',
  note: '',
});

const router = useRouter();
const authStore = useAuthStore();
const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();

const expenseCategoryOptions = computed(() => {
  const userCategories = categoriesStore.categories
    .filter((category) => category.type === 'expense')
    .map((category) => category.name);

  const merged = [...userCategories, ...EXPENSE_CATEGORIES];
  return [...new Set(merged)];
});

const formattedBackendResult = computed(() => {
  if (!backendResult.value) return '';
  return JSON.stringify(backendResult.value, null, 2);
});

const canConfirm = computed(() => {
  const amount = Number(draft.value.amount);
  return Boolean(draft.value.category) && Number.isFinite(amount) && amount > 0 && Boolean(draft.value.date);
});

const parseAmount = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return NaN;
};

const parseDateFromOcr = (dateText) => {
  if (!dateText || typeof dateText !== 'string') {
    return new Date();
  }

  const isoParsed = new Date(dateText);
  if (!Number.isNaN(isoParsed.getTime())) {
    return isoParsed;
  }

  const match = dateText.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (!match) {
    return new Date();
  }

  const first = Number(match[1]);
  const second = Number(match[2]);
  const rawYear = Number(match[3]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;

  const monthFirst = new Date(year, first - 1, second);
  if (
    first >= 1 &&
    first <= 12 &&
    second >= 1 &&
    second <= 31 &&
    !Number.isNaN(monthFirst.getTime())
  ) {
    return monthFirst;
  }

  const dayFirst = new Date(year, second - 1, first);
  if (!Number.isNaN(dayFirst.getTime())) {
    return dayFirst;
  }

  return new Date();
};

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildNote = (ocrData) => {
  const fragments = [];

  if (ocrData?.merchant_address) {
    fragments.push(`Address: ${ocrData.merchant_address}`);
  }

  if (ocrData?.transaction_time) {
    fragments.push(`Time: ${ocrData.transaction_time}`);
  }

  if (Array.isArray(ocrData?.line_items) && ocrData.line_items.length > 0) {
    const itemPreview = ocrData.line_items
      .slice(0, 6)
      .map((item) => {
        const name = item?.item_name || 'Item';
        const qty = item?.item_quantity ?? 1;
        const price = item?.item_price ?? '';
        return `${qty}x ${name}${price !== '' ? ` ($${price})` : ''}`;
      })
      .join(', ');
    fragments.push(`Items: ${itemPreview}`);
  }

  return fragments.join(' | ');
};

const defaultCategory = () => {
  if (expenseCategoryOptions.value.includes('Other Expense')) {
    return 'Other Expense';
  }
  return expenseCategoryOptions.value[0] || '';
};

const hydrateDraftFromOcr = (ocrData) => {
  const amount = parseAmount(ocrData?.total_amount);
  draft.value = {
    category: defaultCategory(),
    amount: Number.isFinite(amount) && amount > 0 ? String(amount) : '',
    merchant: String(ocrData?.merchant_name || '').trim(),
    date: toDateInputValue(parseDateFromOcr(ocrData?.transaction_date)),
    note: buildNote(ocrData),
  };
  formErrors.value = {
    category: '',
    amount: '',
    date: '',
  };
};

const ensureCategoriesLoaded = async () => {
  const userId = authStore.currentUserId;
  if (!userId) {
    return;
  }
  if (!categoriesStore.categories.length) {
    await categoriesStore.fetchCategories(userId);
  }
};

const handleFileSelection = (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  selectedFile.value = file;
  backendResult.value = null;
  errorMsg.value = '';
  successMsg.value = '';
};

const submitImage = async () => {
  if (!selectedFile.value) {
    return;
  }

  isProcessing.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    await ensureCategoriesLoaded();
    const result = await ImageService.processImage(selectedFile.value);
    backendResult.value = result;
    hydrateDraftFromOcr(result);
    successMsg.value = 'Receipt scanned. Review and confirm the expense details.';
  } catch (error) {
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      payload: error?.payload,
      raw: error,
    });
    errorMsg.value = error?.message || 'Failed to process image. Please try again.';
  } finally {
    isProcessing.value = false;
  }
};

const validateDraft = () => {
  const nextErrors = {
    category: '',
    amount: '',
    date: '',
  };
  let valid = true;

  if (!draft.value.category) {
    nextErrors.category = 'Please select an expense category.';
    valid = false;
  }

  const amount = Number(draft.value.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    nextErrors.amount = 'Please enter a valid amount greater than 0.';
    valid = false;
  }

  if (!draft.value.date || Number.isNaN(new Date(draft.value.date).getTime())) {
    nextErrors.date = 'Please select a valid date.';
    valid = false;
  }

  formErrors.value = nextErrors;
  return valid;
};

const confirmExpense = async () => {
  errorMsg.value = '';
  successMsg.value = '';

  if (!authStore.currentUserId) {
    errorMsg.value = 'You need to be logged in to create a transaction.';
    return;
  }

  if (!validateDraft()) {
    return;
  }

  isSaving.value = true;
  try {
    const transactionDate = new Date(`${draft.value.date}T00:00:00`);
    const saved = await transactionsStore.addTransaction({
      type: 'expense',
      amount: Number(draft.value.amount),
      category: draft.value.category,
      date: transactionDate,
      userId: authStore.currentUserId,
      merchant: draft.value.merchant.trim(),
      note: draft.value.note.trim(),
    });

    successMsg.value = `Expense saved: ${saved.category} ($${Number(saved.amount).toFixed(2)}).`;
  } catch (error) {
    console.error('Save error:', error);
    errorMsg.value = error?.message || 'Failed to save expense. Please try again.';
  } finally {
    isSaving.value = false;
  }
};

const goToTransactions = () => {
  router.push('/transactions?tab=expense');
};

onMounted(() => {
  ensureCategoriesLoaded();
});

watch(
  () => authStore.currentUserId,
  () => {
    ensureCategoriesLoaded();
  },
);
</script>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card {
  background: linear-gradient(145deg, #ffffff 0%, #eef5f2 100%);
  border: 1px solid #d7e4df;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(36, 48, 44, 0.06);
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #5e9486;
  font-size: 11px;
  font-weight: 700;
}

.hero-card h2 {
  margin: 6px 0 4px;
  color: #24302c;
  font-size: 24px;
}

.hero-text {
  margin: 0 0 14px;
  color: #5e6c66;
  font-size: 14px;
}

.upload-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hidden-input {
  display: none;
}

.file-select,
.scan-btn,
.confirm-btn,
.link-button {
  border: 0;
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.file-select {
  background: #dceae4;
  color: #22302b;
}

.scan-btn {
  background: #223e34;
  color: #ffffff;
}

.scan-btn:disabled,
.confirm-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.file-meta {
  margin: 10px 0 0;
  color: #5e6c66;
  font-size: 13px;
}

.banner {
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.banner.error {
  color: #7a1212;
  background: #fde6e6;
  border: 1px solid #f4b8b8;
}

.banner.success {
  color: #0f5132;
  background: #d1e7dd;
  border: 1px solid #badbcc;
}

.link-button {
  background: #0f5132;
  color: white;
}

.draft-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.panel {
  background: #ffffff;
  border: 1px solid #dfe6e3;
  border-radius: 14px;
  padding: 14px;
}

.panel h3 {
  margin: 0 0 10px;
  color: #24302c;
  font-size: 18px;
}

.panel-text {
  margin: 0 0 14px;
  color: #5e6c66;
  font-size: 13px;
}

.kv-list {
  display: grid;
  gap: 8px;
}

.kv-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #edf1ef;
}

.total-row .kv-value {
  font-size: 18px;
  font-weight: 700;
  color: #223e34;
}

.kv-label {
  color: #5e6c66;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.kv-value {
  color: #24302c;
  font-weight: 600;
}

.raw-json {
  margin-top: 12px;
}

.raw-json summary {
  cursor: pointer;
  color: #5e9486;
  font-weight: 600;
}

.raw-json pre {
  margin: 8px 0 0;
  max-height: 220px;
  overflow: auto;
  background: #f4f7f6;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-group label {
  font-weight: 600;
  color: #2a3732;
  font-size: 13px;
}

.form-group input,
.form-group select,
.form-group textarea {
  border: 1px solid #cfd9d5;
  border-radius: 10px;
  padding: 10px;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
  color: #24302c;
}

.form-group textarea {
  resize: vertical;
  min-height: 90px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5e9486;
  box-shadow: 0 0 0 3px rgba(94, 148, 134, 0.16);
}

.form-group .invalid {
  border-color: #d9534f;
  background: #fff7f7;
}

.field-error {
  color: #b3332f;
  font-size: 12px;
}

.action-row {
  margin-top: 8px;
}

.confirm-btn {
  width: 100%;
  background: #1f6d5b;
  color: #ffffff;
}

@media (min-width: 900px) {
  .draft-grid {
    grid-template-columns: minmax(280px, 0.9fr) minmax(340px, 1.1fr);
    align-items: start;
  }
}
</style>