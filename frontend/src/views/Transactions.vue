<template>
    <div class="web-page">
        <header class="page-header">
            <h1>Transactions</h1>
            <div class="header-controls">
                <button
                    class="header-action-btn"
                    :class="{ active: monthFilterEnabled }"
                    :aria-pressed="monthFilterEnabled"
                    title="Toggle current month filter"
                    @click="toggleMonthFilter"
                >
                    <span class="action-icon">📅</span>
                    <span class="action-text">{{ monthFilterEnabled ? 'This Month' : 'All Time' }}</span>
                </button>
                <button
                    class="header-action-btn"
                    :class="{ active: sortDirection === 'asc' }"
                    :aria-pressed="sortDirection === 'asc'"
                    title="Switch between newest and oldest transactions"
                    @click="toggleSortDirection"
                >
                    <span class="action-icon">↕</span>
                    <span class="action-text">{{ sortDirection === 'desc' ? 'Newest First' : 'Oldest First' }}</span>
                </button>
                <button
                    class="header-action-btn export-trigger"
                    title="Export transactions to CSV or Excel"
                    @click="openExportModal"
                >
                    <span class="action-icon">⤓</span>
                    <span class="action-text">Export</span>
                </button>
                <button
                    class="header-action-btn danger-trigger"
                    title="Delete transactions by time period"
                    @click="openWipeModal"
                >
                    <span class="action-icon">🗑</span>
                    <span class="action-text">Wipe by Time</span>
                </button>
            </div>
        </header>

        <div class="tab-bar">
            <div class="tab-container">
                <button
                    class="tab-button"
                    :class="{ active: activeTab === 'expense' }"
                    @click="activeTab = 'expense'"
                >
                    Expenses
                </button>
                <button
                    class="tab-button"
                    :class="{ active: activeTab === 'income' }"
                    @click="activeTab = 'income'"
                >
                    Income
                </button>
            </div>
        </div>

        <main class="page-content">
            <div v-if="store.loading" class="loading-message">Loading…</div>
            <ul v-else-if="filteredTransactions.length > 0" class="transactions-list">
                <li v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-list-item">
                    <TransactionItem :transaction="transaction" />
                </li>
            </ul>
            <EmptyState v-else :activeTab="activeTab" />
            <button class="fab" @click="$router.push(`/transactions/add?type=${activeTab}`)">+</button>
        </main>

        <div v-if="showExportModal" class="modal-overlay" @click.self="closeExportModal">
            <div class="wipe-modal" role="dialog" aria-modal="true" aria-label="Export transactions">
                <h3>Export Transactions</h3>
                <p class="wipe-note">
                    Choose a file format and period. You can export either all time data or a custom start/end date range.
                </p>

                <div class="wipe-form-group">
                    <label for="export-format">File format</label>
                    <select id="export-format" v-model="exportFormat">
                        <option value="csv">CSV</option>
                        <option value="excel">Excel (.xlsx)</option>
                    </select>
                </div>

                <div class="wipe-form-group">
                    <label for="export-range">Time period</label>
                    <select id="export-range" v-model="exportScope">
                        <option value="all_time">All time</option>
                        <option value="custom">Custom range</option>
                    </select>
                </div>

                <div v-if="exportScope === 'custom'" class="custom-range-grid">
                    <div class="wipe-form-group">
                        <label for="export-start">Start date</label>
                        <input id="export-start" v-model="exportStartDate" type="date" />
                    </div>
                    <div class="wipe-form-group">
                        <label for="export-end">End date</label>
                        <input id="export-end" v-model="exportEndDate" type="date" />
                    </div>
                </div>

                <div class="wipe-preview" :class="{ warning: exportScope === 'all_time' }">
                    <strong>{{ exportSummaryLabel }}</strong>
                    <span>{{ exportPreviewCount }} transaction(s) ready to export.</span>
                </div>

                <p v-if="exportError" class="wipe-error">{{ exportError }}</p>

                <div class="wipe-actions">
                    <button class="modal-btn secondary" :disabled="isExporting" @click="closeExportModal">Cancel</button>
                    <button
                        class="modal-btn"
                        :class="exportFormat === 'excel' ? 'export-accent' : 'primary'"
                        :disabled="isExporting || !canExport"
                        @click="confirmExportTransactions"
                    >
                        {{ isExporting ? 'Exporting...' : 'Export' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showWipeModal" class="modal-overlay" @click.self="closeWipeModal">
            <div class="wipe-modal" role="dialog" aria-modal="true" aria-label="Wipe transactions by period">
                <h3>Wipe Transactions</h3>
                <p class="wipe-note">
                    Select a time period to delete transactions. This action cannot be undone.
                </p>

                <div class="wipe-form-group">
                    <label for="wipe-range">Time period</label>
                    <select id="wipe-range" v-model="wipeScope">
                        <option value="this_month">This month</option>
                        <option value="this_year">This year</option>
                        <option value="last_30_days">Last 30 days</option>
                        <option value="custom">Custom range</option>
                        <option value="all_time">All time</option>
                    </select>
                </div>

                <div class="wipe-form-group">
                    <label for="wipe-type">Transaction type</label>
                    <select id="wipe-type" v-model="wipeType">
                        <option value="expense">Expenses only</option>
                        <option value="income">Income only</option>
                    </select>
                </div>

                <div v-if="wipeScope === 'custom'" class="custom-range-grid">
                    <div class="wipe-form-group">
                        <label for="wipe-start">Start date</label>
                        <input id="wipe-start" v-model="customStartDate" type="date" />
                    </div>
                    <div class="wipe-form-group">
                        <label for="wipe-end">End date</label>
                        <input id="wipe-end" v-model="customEndDate" type="date" />
                    </div>
                </div>

                <div class="wipe-preview" :class="{ warning: wipeScope === 'all_time' }">
                    <strong>{{ wipeSummaryLabel }}</strong>
                    <span>{{ wipePreviewCount }} transaction(s) will be deleted.</span>
                </div>

                <p v-if="wipeError" class="wipe-error">{{ wipeError }}</p>

                <div class="wipe-actions">
                    <button class="modal-btn secondary" :disabled="isWiping" @click="closeWipeModal">Cancel</button>
                    <button
                        class="modal-btn danger"
                        :disabled="isWiping || !canWipe"
                        @click="confirmWipeTransactions"
                    >
                        {{ isWiping ? 'Deleting...' : 'Yes, I am sure' }}
                    </button>
                </div>
            </div>
        </div>

        <BottomNav currentTab="transactions" />
    </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue"
import TransactionItem from "@/components/TransactionItem.vue"
import EmptyState from "@/components/EmptyState.vue"
import { useTransactionsStore } from "@/stores/transactions"
import { useAuthStore } from "@/stores/AuthStore"
import { exportTransactionsCsv, exportTransactionsExcel } from "@/utils/transactionExport"

export default {
    name: "Transactions",
    components: {
        BottomNav,
        TransactionItem,
        EmptyState
    },
    data() {
        return {
            activeTab: 'expense',
            monthFilterEnabled: false,
            sortDirection: 'desc',
            showExportModal: false,
            exportScope: 'all_time',
            exportStartDate: '',
            exportEndDate: '',
            exportFormat: 'csv',
            isExporting: false,
            exportError: '',
            showWipeModal: false,
            wipeScope: 'this_month',
            customStartDate: '',
            customEndDate: '',
            wipeType: 'expense',
            isWiping: false,
            wipeError: ''
        }
    },
    computed: {
        filteredTransactions() {
            const now = new Date()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

            return this.store.transactions
                .filter(t => t.type === this.activeTab)
                .filter(t => {
                    if (!this.monthFilterEnabled) {
                        return true
                    }

                    const date = this.getTransactionDate(t)
                    return date >= monthStart && date <= monthEnd
                })
                .sort((a, b) => {
                    const aTime = this.getTransactionDate(a).getTime()
                    const bTime = this.getTransactionDate(b).getTime()
                    return this.sortDirection === 'desc' ? bTime - aTime : aTime - bTime
                })
        },
        currentWipeRange() {
            const now = new Date()
            const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
            const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)

            if (this.wipeScope === 'all_time') {
                return {
                    allTime: true,
                    startDate: null,
                    endDate: null,
                    label: 'All time'
                }
            }

            if (this.wipeScope === 'this_year') {
                return {
                    allTime: false,
                    startDate: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
                    endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
                    label: 'This year'
                }
            }

            if (this.wipeScope === 'last_30_days') {
                const start = new Date(now)
                start.setDate(start.getDate() - 29)
                return {
                    allTime: false,
                    startDate: startOfDay(start),
                    endDate: endOfDay(now),
                    label: 'Last 30 days'
                }
            }

            if (this.wipeScope === 'custom') {
                if (!this.customStartDate || !this.customEndDate) {
                    return {
                        allTime: false,
                        startDate: null,
                        endDate: null,
                        label: 'Custom range'
                    }
                }

                const start = new Date(this.customStartDate)
                const end = new Date(this.customEndDate)
                return {
                    allTime: false,
                    startDate: startOfDay(start),
                    endDate: endOfDay(end),
                    label: 'Custom range'
                }
            }

            return {
                allTime: false,
                startDate: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
                endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
                label: 'This month'
            }
        },
        currentExportRange() {
            const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
            const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)

            if (this.exportScope === 'all_time') {
                return {
                    allTime: true,
                    startDate: null,
                    endDate: null,
                    label: 'All time'
                }
            }

            if (!this.exportStartDate || !this.exportEndDate) {
                return {
                    allTime: false,
                    startDate: null,
                    endDate: null,
                    label: 'Custom range'
                }
            }

            const start = new Date(this.exportStartDate)
            const end = new Date(this.exportEndDate)
            return {
                allTime: false,
                startDate: startOfDay(start),
                endDate: endOfDay(end),
                label: 'Custom range'
            }
        },
        transactionsForExport() {
            const userId = this.authStore.currentUserId
            if (!userId) return []

            const { allTime, startDate, endDate } = this.currentExportRange
            return this.store.transactions.filter(transaction => {
                if (transaction.userId !== userId) return false
                if (allTime) return true
                if (!startDate || !endDate) return false

                const date = this.getTransactionDate(transaction)
                return date >= startDate && date <= endDate
            })
        },
        exportPreviewCount() {
            return this.transactionsForExport.length
        },
        exportSummaryLabel() {
            return `${this.currentExportRange.label} selected`
        },
        canExport() {
            if (!this.authStore.currentUserId) {
                return false
            }

            if (this.exportScope === 'custom') {
                if (!this.exportStartDate || !this.exportEndDate) {
                    return false
                }

                if (new Date(this.exportStartDate) > new Date(this.exportEndDate)) {
                    return false
                }
            }

            return this.exportPreviewCount > 0
        },
        wipePreviewCount() {
            const userId = this.authStore.currentUserId
            if (!userId) return 0

            const { allTime, startDate, endDate } = this.currentWipeRange
            return this.store.transactions.filter(transaction => {
                if (transaction.userId !== userId) return false
                if (transaction.type !== this.wipeType) return false
                if (allTime) return true
                if (!startDate || !endDate) return false

                const date = this.getTransactionDate(transaction)
                return date >= startDate && date <= endDate
            }).length
        },
        wipeSummaryLabel() {
            const typeLabel = this.wipeType === 'expense' ? 'Expenses' : 'Income'
            return `${this.currentWipeRange.label} selected (${typeLabel})`
        },
        canWipe() {
            if (!this.authStore.currentUserId) {
                return false
            }

            if (this.wipeScope === 'custom') {
                if (!this.customStartDate || !this.customEndDate) {
                    return false
                }

                if (new Date(this.customStartDate) > new Date(this.customEndDate)) {
                    return false
                }
            }

            return this.wipePreviewCount > 0
        }
    },
    methods: {
        toggleMonthFilter() {
            this.monthFilterEnabled = !this.monthFilterEnabled
        },
        toggleSortDirection() {
            this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc'
        },
        openExportModal() {
            this.showExportModal = true
            this.exportError = ''
        },
        closeExportModal(force = false) {
            if (this.isExporting && !force) {
                return
            }

            this.showExportModal = false
            this.exportError = ''
        },
        buildExportFileName() {
            const now = new Date()
            const pad = (value) => String(value).padStart(2, '0')
            const nowLabel = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`

            if (this.exportScope === 'custom' && this.exportStartDate && this.exportEndDate) {
                const start = this.exportStartDate.replaceAll('-', '')
                const end = this.exportEndDate.replaceAll('-', '')
                return `transactions_${start}_${end}_${nowLabel}`
            }

            return `transactions_all_time_${nowLabel}`
        },
        async confirmExportTransactions() {
            this.exportError = ''

            if (!this.canExport) {
                this.exportError = 'Please choose a valid date range with at least one transaction.'
                return
            }

            this.isExporting = true

            try {
                const transactions = this.transactionsForExport
                const baseFileName = this.buildExportFileName()

                if (this.exportFormat === 'excel') {
                    await exportTransactionsExcel(transactions, `${baseFileName}.xlsx`)
                } else {
                    exportTransactionsCsv(transactions, `${baseFileName}.csv`)
                }

                this.closeExportModal(true)
            } catch (error) {
                this.exportError = error?.message || 'Failed to export transactions. Please try again.'
            } finally {
                this.isExporting = false
            }
        },
        openWipeModal() {
            this.showWipeModal = true
            this.wipeType = this.activeTab
            this.wipeError = ''
        },
        closeWipeModal(force = false) {
            if (this.isWiping && !force) {
                return
            }

            this.showWipeModal = false
            this.wipeError = ''
        },
        async confirmWipeTransactions() {
            this.wipeError = ''

            if (!this.canWipe) {
                this.wipeError = 'Please choose a valid date range with at least one transaction.'
                return
            }

            this.isWiping = true
            try {
                const { allTime, startDate, endDate } = this.currentWipeRange
                await this.store.deleteTransactionsByPeriod({
                    userId: this.authStore.currentUserId,
                    allTime,
                    startDate,
                    endDate,
                    transactionType: this.wipeType
                })
                this.closeWipeModal(true)
            } catch (error) {
                this.wipeError = error?.message || 'Failed to wipe transactions. Please try again.'
            } finally {
                this.isWiping = false
            }
        },
        getTransactionDate(transaction) {
            const value = transaction?.date
            if (value && typeof value.toDate === 'function') {
                return value.toDate()
            }

            if (value instanceof Date) {
                return value
            }

            const parsed = value ? new Date(value) : null
            if (parsed && !Number.isNaN(parsed.getTime())) {
                return parsed
            }

            return new Date(0)
        }
    },
    watch: {
        'authStore.currentUserId': {
            immediate: true,
            handler(userId) {
                this.store.fetchTransactions(userId)
            }
        }
    },
    mounted() {
        this.store.fetchTransactions(this.authStore.currentUserId)
        if (this.$route.query.tab === 'income') {
            this.activeTab = 'income'
        }
        // Scroll to top when returning from add transaction
        window.scrollTo(0, 0)
    },
    setup() {
        const store = useTransactionsStore()
        const authStore = useAuthStore()
        return { store, authStore }
    }
}
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
}

html {
    scroll-behavior: smooth;
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
    border-bottom: 2px solid darkgray;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.page-header h1 {
    margin: 0;
    font-size: 24px;
    color: var(--text-900);
}

.header-controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.header-action-btn {
    border: 1px solid var(--border);
    background: white;
    color: var(--text-700);
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
}

.header-action-btn:hover {
    border-color: #c9d4d0;
    background: #fafcfa;
}

.header-action-btn.active {
    border-color: var(--brand);
    background: #edf6f2;
    color: var(--text-900);
}

.header-action-btn.export-trigger {
    border-color: #c8ddd6;
    color: #2f6657;
}

.header-action-btn.export-trigger:hover {
    border-color: #99c1b4;
    background: #eef8f4;
}

.header-action-btn.danger-trigger {
    border-color: #e7c6c6;
    color: #8d2f2d;
}

.header-action-btn.danger-trigger:hover {
    border-color: #d39d9d;
    background: #fff3f3;
}

.action-icon {
    font-size: 14px;
    line-height: 1;
}

.action-text {
    white-space: nowrap;
}

.tab-bar {
    display: flex;
    justify-content: center;
    padding: 16px 20px;
    background: white;
    border-bottom: 1px solid var(--border);
}

.tab-container {
    display: inline-flex;
    gap: 8px;
    background: #f0f0f0;
    padding: 6px;
    border-radius: 24px;
}

.tab-button {
    border: none;
    background: transparent;
    padding: 10px 24px;
    color: var(--text-700);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 20px;
    transition: all 0.2s;
}

.tab-button.active {
    color: var(--text-900);
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.page-content {
    padding: 20px;
    flex: 1;
    background: var(--bg);
}

.loading-message {
    text-align: center;
    color: var(--text-700);
    padding: 32px 0;
    font-size: 14px;
}

.transactions-list {
    list-style: none;
    padding: 0;
    margin: 0;
    height: calc(100vh - 320px);
    min-height: 400px;
}

.transaction-list-item {
    margin: 0;
    padding: 0;
}

.fab {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #3d5248;
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.2s;
}

.fab:hover {
    background: #2f4038;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
}

.fab:active {
    transform: scale(0.95);
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(19, 28, 24, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 40;
}

.wipe-modal {
    width: min(100%, 460px);
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8e5;
    box-shadow: 0 12px 28px rgba(23, 34, 29, 0.22);
    padding: 18px;
}

.wipe-modal h3 {
    margin: 0;
    color: var(--text-900);
    font-size: 20px;
}

.wipe-note {
    margin: 8px 0 0;
    color: var(--text-700);
    font-size: 13px;
}

.wipe-form-group {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.wipe-form-group label {
    font-size: 12px;
    font-weight: 600;
    color: #32403b;
}

.wipe-form-group select,
.wipe-form-group input {
    border: 1px solid #d3ddd9;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
}

.custom-range-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.wipe-preview {
    margin-top: 14px;
    border: 1px solid #d9e6e1;
    background: #f4faf7;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: #2f3f39;
    font-size: 13px;
}

.wipe-preview.warning {
    border-color: #eac8c8;
    background: #fff2f2;
}

.wipe-error {
    margin: 10px 0 0;
    color: #b33a36;
    font-size: 12px;
}

.wipe-actions {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.modal-btn {
    border: 0;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
}

.modal-btn.secondary {
    background: #edf1ef;
    color: #32403b;
}

.modal-btn.danger {
    background: #b33a36;
    color: #ffffff;
}

.modal-btn.primary {
    background: #3d5248;
    color: #ffffff;
}

.modal-btn.export-accent {
    background: #2f6657;
    color: #ffffff;
}

.modal-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

@media (max-width: 680px) {
    .custom-range-grid {
        grid-template-columns: 1fr;
    }
}
</style>