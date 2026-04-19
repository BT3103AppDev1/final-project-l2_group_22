<template>
  <section class="uploader">
    <div class="notice-card">
      <span class="notice-pill">Notice</span>
      <p>
        If you leave this upload tab before confirming, the scanned result will
        be automatically saved in Transactions.
      </p>
    </div>

    <div class="upload-container">
      <div class="upload-header">
        <h2>Upload Receipt</h2>
        <p>Snap a photo or upload a scan</p>
      </div>

      <div
        class="drop-zone"
        :class="{ dragover: isDragOver, disabled: isProcessing }"
        @click="triggerFileDialog"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleFileDrop"
      >
        <span class="icon" aria-hidden="true">🧾</span>
        <p>
          Drag and drop receipt here or
          <span class="browse-btn">browse files</span>
        </p>
        <p v-if="selectedFile" class="file-meta">{{ selectedFile.name }}</p>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden-input"
          @change="handleFileSelection"
        />
      </div>

      <div v-if="isProcessing" class="progress-wrapper">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>
        <p class="status-text">Uploading and reading data...</p>
      </div>

      <div v-if="backendResult && !isProcessing" class="results-card">
        <h3>Extracted Details</h3>
        <div class="data-row">
          <strong>Merchant:</strong>
          <span>{{ backendResult.merchant_name || '-' }}</span>
        </div>
        <div class="data-row">
          <strong>Date:</strong>
          <span>{{ backendResult.transaction_date || '-' }}</span>
        </div>
        <div class="data-row">
          <strong>Total:</strong>
          <span>{{ backendResult.total_amount ?? '-' }}</span>
        </div>

        <button class="confirm-btn" :disabled="!canConfirm || isSaving" @click="confirmExpense">
          {{ isSaving ? 'Saving...' : 'Confirm & Save' }}
        </button>
      </div>
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
          Adjust any values below, then confirm to create your final expense transaction.
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
import { onBeforeRouteLeave, useRouter } from 'vue-router';
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
const saveState = ref('idle');
const isDragOver = ref(false);
const progressPercent = ref(0);
const fileInputRef = ref(null);
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

const clearDraftInputs = () => {
  draft.value = {
    category: '',
    amount: '',
    merchant: '',
    date: '',
    note: '',
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

let progressTimer = null;

const clearProgressTimer = () => {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
};

const beginProgressAnimation = () => {
  clearProgressTimer();
  progressPercent.value = 12;
  progressTimer = setInterval(() => {
    if (progressPercent.value < 90) {
      progressPercent.value += 4;
    }
  }, 150);
};

const completeProgressAnimation = () => {
  clearProgressTimer();
  progressPercent.value = 100;
};

const clearUploadSession = () => {
  clearProgressTimer();
  progressPercent.value = 0;
  selectedFile.value = null;
  backendResult.value = null;
  isDragOver.value = false;
  clearDraftInputs();

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const triggerFileDialog = () => {
  if (isProcessing.value) {
    return;
  }
  fileInputRef.value?.click();
};

const processSelectedFile = (file) => {
  if (!file) {
    return;
  }

  selectedFile.value = file;
  backendResult.value = null;
  errorMsg.value = '';
  successMsg.value = '';
  saveState.value = 'idle';
  submitImage();
};

const handleDragOver = () => {
  if (isProcessing.value) {
    return;
  }
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleFileDrop = (event) => {
  isDragOver.value = false;
  if (isProcessing.value) {
    return;
  }

  const file = event.dataTransfer?.files?.[0] || null;
  processSelectedFile(file);
};

const canAutoSaveDraft = () => {
  if (saveState.value !== 'idle' || !backendResult.value || !authStore.currentUserId) {
    return false;
  }

  if (isSaving.value || isProcessing.value) {
    return false;
  }

  const amount = Number(draft.value.amount);
  return Number.isFinite(amount) && amount > 0;
};

const autoSaveUnconfirmedDraft = async () => {
  if (!canAutoSaveDraft()) {
    return false;
  }

  const hasValidDate = draft.value.date && !Number.isNaN(new Date(draft.value.date).getTime());
  const transactionDate = hasValidDate ? new Date(`${draft.value.date}T00:00:00`) : new Date();
  const category = draft.value.category || defaultCategory() || 'Other Expense';
  const existingNote = draft.value.note.trim();
  const note = existingNote
    ? `${existingNote} | Auto-saved from Receipt Upload before confirmation.`
    : 'Auto-saved from Receipt Upload before confirmation.';

  try {
    await transactionsStore.addTransaction({
      type: 'expense',
      amount: Number(draft.value.amount),
      category,
      date: transactionDate,
      userId: authStore.currentUserId,
      merchant: draft.value.merchant.trim(),
      note,
    });

    saveState.value = 'autosaved';
    return true;
  } catch (error) {
    console.error('Auto-save error:', error);
    return false;
  }
};

const handleFileSelection = (event) => {
  const file = event.target.files?.[0] || null;
  processSelectedFile(file);
  event.target.value = '';
};

const submitImage = async () => {
  if (!selectedFile.value) {
    return;
  }

  isProcessing.value = true;
  beginProgressAnimation();
  errorMsg.value = '';
  successMsg.value = '';

  try {
    await ensureCategoriesLoaded();
    const result = await ImageService.processImage(selectedFile.value);
    backendResult.value = result;
    hydrateDraftFromOcr(result);
    saveState.value = 'idle';
    completeProgressAnimation();
    successMsg.value = 'Receipt scanned. Review and confirm the expense details.';
  } catch (error) {
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      payload: error?.payload,
      raw: error,
    });
    errorMsg.value = error?.message || 'Failed to process image. Please try again.';
    clearProgressTimer();
    progressPercent.value = 0;
  } finally {
    isProcessing.value = false;
    isDragOver.value = false;
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

    const savedCategory = saved?.category || draft.value.category || defaultCategory() || 'Other Expense';
    const savedAmount = Number.isFinite(Number(saved?.amount))
      ? Number(saved.amount)
      : Number(draft.value.amount);

    saveState.value = 'confirmed';
    successMsg.value = `Expense saved: ${savedCategory} ($${savedAmount.toFixed(2)}).`;
    clearUploadSession();
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

const hasSelectedPhoto = computed(() => {
  return Boolean(selectedFile.value || backendResult.value);
});

onBeforeRouteLeave(async () => {
  await autoSaveUnconfirmedDraft();
});

onMounted(() => {
  ensureCategoriesLoaded();
});

watch(
  () => authStore.currentUserId,
  () => {
    ensureCategoriesLoaded();
  },
);

defineExpose({
  isProcessing,
  hasSelectedPhoto,
});
</script>

<style scoped>
.uploader {
  --surface: #f8f8f5;
  --surface-elevated: #ffffff;
  --ink-strong: #1f2d28;
  --ink-soft: #5a6863;
  --accent: #1f5f52;
  --accent-soft: #dbece7;

  display: flex;
  flex-direction: column;
  gap: 18px;
}

.notice-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(115deg, #f3f5ec 0%, #ecf3ef 100%);
  border: 1px solid #d6e0da;
  border-radius: 14px;
  padding: 12px 14px;
  color: #34423d;
  animation: card-rise 320ms ease-out;
}

.notice-pill {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: #d4e8e0;
  color: #20483d;
}

.notice-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
}

.upload-container {
  background: var(--surface-elevated);
  border: 1px solid #d8e2de;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(20, 42, 35, 0.08);
  padding: 20px;
  animation: card-rise 420ms ease-out;
}

.upload-header {
  text-align: center;
  margin-bottom: 16px;
}

.upload-header h2 {
  margin: 0 0 8px;
  color: var(--ink-strong);
  font-size: 1.45rem;
}

.upload-header p {
  margin: 0;
  color: #6b7873;
  font-size: 0.92rem;
}

.drop-zone {
  border: 2px dashed #c9d8d3;
  border-radius: 12px;
  padding: 32px 18px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background: #f7faf8;
}

.drop-zone:hover,
.drop-zone.dragover {
  border-color: #2f7c67;
  background-color: #ecf6f2;
}

.drop-zone.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.icon {
  display: block;
  font-size: 2.4rem;
  margin-bottom: 8px;
}

.drop-zone p {
  margin: 0;
  color: #4b5d57;
  font-size: 0.94rem;
}

.browse-btn {
  color: #2b725f;
  font-weight: 600;
  text-decoration: underline;
}

.confirm-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.file-meta {
  margin: 10px auto 0;
  color: #445650;
  font-size: 13px;
  max-width: 100%;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 8px;
  background: #eef4f1;
  border: 1px solid #d9e4df;
  overflow-wrap: anywhere;
}

.hidden-input {
  display: none;
}

.progress-wrapper {
  margin-top: 18px;
  text-align: center;
}

.progress-bar {
  height: 8px;
  background: #e2e8e4;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  width: 0;
  background: linear-gradient(120deg, #2f7c67 0%, #45a186 100%);
  transition: width 0.2s ease;
}

.status-text {
  margin: 0;
  font-size: 0.86rem;
  color: #4d5d58;
}

.results-card {
  margin-top: 18px;
  padding: 16px;
  background: #f7faf9;
  border: 1px solid #dce7e2;
  border-radius: 12px;
  animation: card-rise 0.35s ease;
}

.results-card h3 {
  margin: 0 0 12px;
  font-size: 1.06rem;
  color: #24302c;
}

.data-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 10px;
  font-size: 0.9rem;
  color: #4b5d57;
  border-bottom: 1px solid #e4ece9;
  padding-bottom: 7px;
}

.data-row strong {
  color: #1f2d28;
}

.confirm-btn,
.link-button {
  border: 0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.banner {
  border-radius: 12px;
  padding: 12px 14px;
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
  color: #0e4f41;
  background: #d3ece4;
  border: 1px solid #b9dfd3;
}

.link-button {
  background: #185f50;
  color: white;
}

.draft-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.panel {
  background: var(--surface-elevated);
  border: 1px solid #dce5e1;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 16px rgba(24, 32, 29, 0.05);
}

.panel h3 {
  margin: 0 0 10px;
  color: var(--ink-strong);
  font-size: 19px;
}

.panel-text {
  margin: 0 0 16px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.45;
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
  font-size: 20px;
  font-weight: 700;
  color: #1f5f52;
}

.kv-label {
  color: #5e6c66;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.kv-value {
  color: var(--ink-strong);
  font-weight: 600;
}

.raw-json {
  margin-top: 12px;
}

.raw-json summary {
  cursor: pointer;
  color: #3f6f61;
  font-weight: 600;
}

.raw-json pre {
  margin: 8px 0 0;
  max-height: 220px;
  overflow: auto;
  background: #f4f7f5;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid #e1e8e4;
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
  border: 1px solid #c9d6d1;
  border-radius: 11px;
  padding: 11px;
  font-size: 14px;
  font-family: inherit;
  background: var(--surface);
  color: var(--ink-strong);
}

.form-group textarea {
  resize: vertical;
  min-height: 90px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3f7869;
  box-shadow: 0 0 0 3px rgba(63, 120, 105, 0.18);
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
  background: linear-gradient(120deg, #1f6d5b 0%, #1c564a 100%);
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(31, 109, 91, 0.25);
}

@keyframes card-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 900px) {
  .draft-grid {
    grid-template-columns: minmax(280px, 0.9fr) minmax(340px, 1.1fr);
    align-items: start;
  }
}
</style>