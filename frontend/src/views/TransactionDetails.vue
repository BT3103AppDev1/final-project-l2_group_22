<template>
  <div class="web-page">
    <!-- Header with back arrow and edit icon -->
    <header class="detail-header">
      <button class="icon-btn" @click="$router.push('/transactions')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h1>Transaction Details</h1>
      <button class="icon-btn" @click="goToEdit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </button>
    </header>

    <!-- Loading state -->
    <main v-if="loading" class="page-content">
      <div class="placeholder">Loading transaction...</div>
    </main>

    <!-- Error state -->
    <main v-else-if="error" class="page-content">
      <div class="placeholder">{{ error }}</div>
    </main>

    <!-- Transaction details -->
    <main v-else class="page-content">
      <!-- Amount hero -->
      <div class="amount-hero">
        <div class="type-icon" :class="transaction.type">
          <span class="icon-arrow">{{ transaction.type === 'expense' ? '▼' : '▲' }}</span>
        </div>
        <p class="amount" :class="transaction.type">
          {{ transaction.type === 'expense' ? '−' : '+' }}${{ Number(transaction.amount).toFixed(2) }}
        </p>
        <p class="type-label">{{ (transaction.type || '').toUpperCase() }}</p>
      </div>

      <!-- Detail card -->
      <div class="detail-card">
        <div class="detail-row" v-if="transaction.merchant">
          <span class="detail-label">MERCHANT</span>
          <span class="detail-value">{{ transaction.merchant }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">CATEGORY</span>
          <span class="detail-value">{{ transaction.category }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">DATE</span>
          <span class="detail-value">{{ formattedDate }}</span>
        </div>
        <div class="detail-row" v-if="transaction.note">
          <span class="detail-label">NOTES</span>
          <span class="detail-value">{{ transaction.note }}</span>
        </div>
      </div>

      <!-- Delete button -->
      <button class="delete-btn" @click="showDeleteModal = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Delete Transaction
      </button>
    </main>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal">
        <div class="modal-icon">⚠️</div>
        <h2>Delete this transaction?</h2>
        <p class="modal-desc">
          This action cannot be undone. The transaction will be permanently
          removed from your records and will no longer contribute to your
          Dashboard and Insights calculations.
        </p>

        <div class="modal-details">
          <div class="modal-detail-row" v-if="transaction.merchant">
            <span>Merchant</span><span>{{ transaction.merchant }}</span>
          </div>
          <div class="modal-detail-row">
            <span>Category</span><span>{{ transaction.category }}</span>
          </div>
          <div class="modal-detail-row">
            <span>Date</span><span>{{ formattedDateShort }}</span>
          </div>
          <div class="modal-detail-row">
            <span>Amount</span>
            <span class="modal-amount" :class="transaction.type">
              {{ transaction.type === 'expense' ? '−' : '+' }}${{ Number(transaction.amount).toFixed(2) }}
            </span>
          </div>
        </div>

        <button class="confirm-delete-btn" @click="deleteTransaction" :disabled="deleting">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          {{ deleting ? 'Deleting...' : 'Delete Transaction' }}
        </button>
        <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useTransactionsStore } from '@/stores/transactions'

export default {
  name: 'TransactionDetails',
  data() {
    return {
      transaction: {},
      loading: true,
      error: null,
      showDeleteModal: false,
      deleting: false
    }
  },
  computed: {
    formattedDate() {
      if (!this.transaction.date) return ''
      const date = this.transaction.date.toDate
        ? this.transaction.date.toDate()
        : new Date(this.transaction.date)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    formattedDateShort() {
      if (!this.transaction.date) return ''
      const date = this.transaction.date.toDate
        ? this.transaction.date.toDate()
        : new Date(this.transaction.date)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  },
  async created() {
    await this.fetchTransaction()
  },
  methods: {
    async fetchTransaction() {
      const txnId = this.$route.params.id
      try {
        const txnRef = doc(db, 'transactions', txnId)
        const txnSnap = await getDoc(txnRef)

        if (txnSnap.exists()) {
          this.transaction = { id: txnSnap.id, ...txnSnap.data() }
        } else {
          this.error = 'Transaction not found.'
        }
      } catch (err) {
        console.error('Error fetching transaction:', err)
        this.error = 'Failed to load transaction. Please try again.'
      } finally {
        this.loading = false
      }
    },

    goToEdit() {
      this.$router.push(`/transactions/${this.$route.params.id}/edit`)
    },

    async deleteTransaction() {
      this.deleting = true
      try {
        await this.store.deleteTransaction(this.$route.params.id)
        this.$router.push('/transactions')
      } catch (err) {
        console.error('Error deleting transaction:', err)
        alert('Failed to delete transaction. Please try again.')
      } finally {
        this.deleting = false
      }
    }
  },
  setup() {
    const store = useTransactionsStore()
    return { store }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.web-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f6f5;
  font-family: 'Poppins', sans-serif;
}

/* Header */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #dfe6e3;
}

.detail-header h1 {
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

/* Amount hero section */
.page-content {
  flex: 1;
  padding: 20px;
}

.amount-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 0;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.type-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 18px;
}

.type-icon.expense {
  background: #fde8e8;
  color: #d9534f;
}

.type-icon.income {
  background: #e6f4ed;
  color: #2d8a4f;
}

.amount {
  font-size: 32px;
  font-weight: 700;
  margin: 4px 0;
}

.amount.expense {
  color: #d9534f;
}

.amount.income {
  color: #2d8a4f;
}

.type-label {
  font-size: 12px;
  color: #5e6c66;
  letter-spacing: 1.5px;
  margin: 0;
  font-weight: 500;
}

/* Detail card */
.detail-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.detail-row {
  margin-bottom: 18px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  display: block;
  font-size: 11px;
  color: #5e6c66;
  letter-spacing: 0.8px;
  margin-bottom: 3px;
  font-weight: 500;
}

.detail-value {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #24302c;
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
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}

.delete-btn:hover {
  background: #fef2f2;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 28px 24px;
  width: 100%;
  max-width: 480px;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

.modal-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.modal h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #24302c;
}

.modal-desc {
  font-size: 13px;
  color: #5e6c66;
  line-height: 1.6;
  margin: 0 0 20px;
}

.modal-details {
  background: #f4f6f5;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  text-align: left;
}

.modal-detail-row {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  font-size: 14px;
}

.modal-detail-row span:first-child {
  color: #5e6c66;
}

.modal-detail-row span:last-child {
  font-weight: 500;
  color: #24302c;
}

.modal-amount.expense {
  color: #d9534f;
}

.modal-amount.income {
  color: #2d8a4f;
}

.confirm-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: #d9534f;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  margin-bottom: 10px;
  transition: background 0.15s;
}

.confirm-delete-btn:hover {
  background: #c9302c;
}

.confirm-delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  font-size: 15px;
  font-family: 'Poppins', sans-serif;
  color: #5e6c66;
  cursor: pointer;
}

.cancel-btn:hover {
  color: #24302c;
}

/* Placeholder (loading/error states) */
.placeholder {
  padding: 24px;
  text-align: center;
  color: #5e6c66;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
</style>
