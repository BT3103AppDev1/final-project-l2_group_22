<template>
    <div class="web-page">
        <header class="page-header">
            <h1>Transactions</h1>
            <div class="header-controls">
                <button
                    class="header-action-btn"
                    :class="{ active: hasActiveFilters }"
                    :aria-pressed="hasActiveFilters"
                    title="Open transaction filters"
                    @click="openFilterModal"
                >
                    <span class="action-text">Filter</span>
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
                    <span class="action-text">Mass Delete</span>
                </button>
            </div>
        </header>

        <main class="page-content">
            <div v-if="store.loading" class="loading-message">Loading…</div>
            <div v-else-if="groupedTransactions.length > 0" class="transactions-list">
                <section v-for="group in groupedTransactions" :key="group.key" class="date-group">
                    <div class="date-separator">
                        <span>{{ group.label }}</span>
                    </div>

                    <ul class="date-group-list">
                        <li v-for="transaction in group.items" :key="transaction.id" class="transaction-list-item">
                            <TransactionItem :transaction="transaction" />
                        </li>
                    </ul>
                </section>
            </div>
            <EmptyState v-else :activeTab="emptyStateTab" />
            <button class="fab" @click="$router.push(`/transactions/add?type=${addTransactionType}`)">+</button>
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

        <div v-if="showFilterModal" class="modal-overlay" @click.self="closeFilterModal">
            <div class="filter-drawer" role="dialog" aria-modal="true">
                <div class="filter-header">
                    <h3>Filters</h3>
                    <button class="close-icon-btn" @click="closeFilterModal">✕</button>
                </div>

                <div class="filter-body">
                    <section class="filter-section">
                        <h4>Timeframe</h4>
                        <div class="segmented-control">
                            <button :class="{ active: filterDateMode === 'all' }" @click="filterDateMode = 'all'">All Time</button>
                            <button :class="{ active: filterDateMode === 'custom' }" @click="filterDateMode = 'custom'">Custom Range</button>
                        </div>

                        <div v-if="filterDateMode === 'custom'" class="input-grid mt-2">
                            <div class="input-field">
                                <label>From</label>
                                <input v-model="filterStartDate" type="date" />
                            </div>
                            <div class="input-field">
                                <label>To</label>
                                <input v-model="filterEndDate" type="date" />
                            </div>
                        </div>
                    </section>

                    <section class="filter-section">
                        <h4>Transaction Type</h4>
                        <div class="chip-group">
                            <label class="chip">
                                <input type="checkbox" value="expense" v-model="selectedTypes" />
                                <span>Expense</span>
                            </label>
                            <label class="chip">
                                <input type="checkbox" value="income" v-model="selectedTypes" />
                                <span>Income</span>
                            </label>
                        </div>
                    </section>

                    <section class="filter-section">
                        <div class="section-header">
                            <h4>Categories</h4>
                            <button type="button" class="btn-link" @click="selectedCategories = []">Clear</button>
                        </div>

                        <div class="category-grid">
                            <label v-for="category in availableCategories" :key="category" class="category-card">
                                <input type="checkbox" :value="category" v-model="selectedCategories" />
                                <div class="card-content">
                                    <span class="category-name">{{ category }}</span>
                                    <div class="check-badge">✓</div>
                                </div>
                            </label>
                        </div>
                    </section>

                    <section class="filter-section">
                        <h4>Amount Range</h4>
                        <div class="input-grid">
                            <div class="input-group-prefix">
                                <span>$</span>
                                <input v-model="amountMin" type="number" placeholder="Min" />
                            </div>
                            <div class="input-group-prefix">
                                <span>$</span>
                                <input v-model="amountMax" type="number" placeholder="Max" />
                            </div>
                        </div>
                    </section>

                    <section class="filter-section grid-2">
                        <div class="input-field">
                            <h4>Merchant</h4>
                            <input v-model.trim="merchantFilter" type="text" placeholder="e.g. Amazon" />
                        </div>
                        <div class="input-field">
                            <h4>Recurrence</h4>
                            <select v-model="recurrenceFilter">
                                <option value="all">All</option>
                                <option value="none">One-time</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </section>
                </div>

                <div class="filter-footer">
                    <button class="btn-text" @click="resetFilters">Clear All</button>
                    <button class="btn-primary" @click="closeFilterModal">Show Results</button>
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

                <div class="wipe-form-group">
                    <label for="wipe-category">Category (optional)</label>
                    <select id="wipe-category" v-model="wipeCategory">
                        <option value="">All categories</option>
                        <option v-for="cat in wipeUniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
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
            showFilterModal: false,
            filterDateMode: 'all',
            filterStartDate: '',
            filterEndDate: '',
            selectedTypes: ['expense', 'income'],
            selectedCategories: [],
            amountMin: '',
            amountMax: '',
            recurrenceFilter: 'all',
            merchantFilter: '',
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
            wipeCategory: '',
            isWiping: false,
            wipeError: ''
        }
    },
    computed: {
        hasActiveFilters() {
            const hasCustomDate = this.filterDateMode === 'custom' && (this.filterStartDate || this.filterEndDate)
            const hasTypeFilter = this.selectedTypes.length > 0 && this.selectedTypes.length < 2
            const hasCategories = this.selectedCategories.length > 0
            const hasAmount = this.amountMin !== '' || this.amountMax !== ''
            const hasRecurrence = this.recurrenceFilter !== 'all'
            const hasMerchant = this.merchantFilter.length > 0

            return hasCustomDate || hasTypeFilter || hasCategories || hasAmount || hasRecurrence || hasMerchant
        },
        availableCategories() {
            const categories = new Set()
            this.store.transactions.forEach((transaction) => {
                if (transaction?.category) {
                    categories.add(transaction.category)
                }
            })
            return Array.from(categories).sort()
        },
        emptyStateTab() {
            return this.selectedTypes.length === 1 && this.selectedTypes[0] === 'income' ? 'income' : 'expense'
        },
        addTransactionType() {
            return this.selectedTypes.length === 1 && this.selectedTypes[0] === 'income' ? 'income' : 'expense'
        },
        filteredTransactions() {
            const startDate = this.filterStartDate ? new Date(this.filterStartDate) : null
            const endDate = this.filterEndDate ? new Date(this.filterEndDate) : null
            const minAmount = this.amountMin === '' ? null : Number(this.amountMin)
            const maxAmount = this.amountMax === '' ? null : Number(this.amountMax)
            const merchantQuery = this.merchantFilter.toLowerCase()

            return this.store.transactions
                .filter(t => {
                    if (!this.selectedTypes.length) return false
                    return this.selectedTypes.includes(t.type)
                })
                .filter(t => {
                    const date = this.getTransactionDate(t)

                    if (this.filterDateMode === 'custom') {
                        if (startDate && date < new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0)) {
                            return false
                        }

                        if (endDate && date > new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999)) {
                            return false
                        }
                    }

                    return true
                })
                .filter(t => {
                    if (!this.selectedCategories.length) return true
                    return this.selectedCategories.includes(t.category)
                })
                .filter(t => {
                    const amount = Number(t.amount || 0)
                    if (minAmount !== null && Number.isFinite(minAmount) && amount < minAmount) return false
                    if (maxAmount !== null && Number.isFinite(maxAmount) && amount > maxAmount) return false
                    return true
                })
                .filter(t => {
                    if (this.recurrenceFilter === 'all') return true
                    const recurrence = String(t?.recurrence || 'none').toLowerCase()
                    return recurrence === this.recurrenceFilter
                })
                .filter(t => {
                    if (!merchantQuery) return true
                    const merchant = String(t?.merchant || '').toLowerCase()
                    return merchant.includes(merchantQuery)
                })
                .sort((a, b) => {
                    const aTime = this.getTransactionDate(a).getTime()
                    const bTime = this.getTransactionDate(b).getTime()
                    return this.sortDirection === 'desc' ? bTime - aTime : aTime - bTime
                })
        },
        groupedTransactions() {
            const groups = new Map()

            this.filteredTransactions.forEach((transaction) => {
                const date = this.getTransactionDate(transaction)
                const key = this.getDateKey(date)

                if (!groups.has(key)) {
                    groups.set(key, {
                        key,
                        label: this.formatDateHeader(date),
                        items: []
                    })
                }

                groups.get(key).items.push(transaction)
            })

            return Array.from(groups.values())
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
                if (this.wipeCategory && transaction.category !== this.wipeCategory) return false
                if (allTime) return true
                if (!startDate || !endDate) return false

                const date = this.getTransactionDate(transaction)
                return date >= startDate && date <= endDate
            }).length
        },
        wipeUniqueCategories() {
            const cats = new Set()
            this.store.transactions
                .filter(t => t.type === this.wipeType)
                .forEach(t => { if (t.category) cats.add(t.category) })
            return [...cats].sort()
        },
        wipeSummaryLabel() {
            const typeLabel = this.wipeType === 'expense' ? 'Expenses' : 'Income'
            const catLabel = this.wipeCategory ? ` — ${this.wipeCategory}` : ''
            return `${this.currentWipeRange.label} selected (${typeLabel}${catLabel})`
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
        openFilterModal() {
            this.showFilterModal = true
        },
        closeFilterModal() {
            this.showFilterModal = false
        },
        resetFilters() {
            this.filterDateMode = 'all'
            this.filterStartDate = ''
            this.filterEndDate = ''
            this.selectedTypes = ['expense', 'income']
            this.selectedCategories = []
            this.amountMin = ''
            this.amountMax = ''
            this.recurrenceFilter = 'all'
            this.merchantFilter = ''
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
            if (this.selectedTypes.length === 1 && (this.selectedTypes[0] === 'expense' || this.selectedTypes[0] === 'income')) {
                this.wipeType = this.selectedTypes[0]
            }
            this.wipeError = ''
        },
        closeWipeModal(force = false) {
            if (this.isWiping && !force) {
                return
            }

            this.showWipeModal = false
            this.wipeError = ''
            this.wipeCategory = ''
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
                    transactionType: this.wipeType,
                    category: this.wipeCategory || null
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
        },
        getDateKey(date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        },
        formatDateHeader(date) {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
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
            this.selectedTypes = ['income']
        }
        if (this.$route.query.tab === 'expense') {
            this.selectedTypes = ['expense']
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
    height: 76px;
    box-sizing: border-box;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    background: #ffffff;
}

.page-header h1 {
    margin: 0;
    font-size: 24px;
    color: var(--text-900);
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
}

.header-controls {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
    justify-content: flex-end;
    max-width: 100%;
    overflow-x: auto;
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
    padding: 0;
    margin: 0;
    height: calc(100vh - 320px);
    min-height: 400px;
    overflow-y: auto;
}

.date-group {
    margin: 0 0 14px;
}

.date-separator {
    margin: 14px 0 8px;
}

.date-separator span {
    display: inline-block;
    padding: 0;
    font-size: 14px;
    font-weight: 600;
    color: #34423d;
}

.date-group-list {
    list-style: none;
    padding: 0;
    margin: 0;
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

.filter-drawer {
    width: min(100%, 620px);
    max-height: min(88vh, 760px);
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8e5;
    box-shadow: 0 12px 28px rgba(23, 34, 29, 0.22);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    border-bottom: 1px solid #e7efeb;
}

.filter-header h3 {
    margin: 0;
    color: var(--text-900);
    font-size: 20px;
}

.close-icon-btn {
    border: 1px solid #d7e1dd;
    background: #ffffff;
    color: #4e5f58;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
}

.filter-body {
    padding: 14px 18px;
    overflow-y: auto;
    display: grid;
    gap: 12px;
}

.filter-section {
    border: 1px solid #e6efeb;
    border-radius: 12px;
    background: #f8fbfa;
    padding: 12px;
}

.filter-section h4 {
    margin: 0 0 8px;
    font-size: 13px;
    color: #32403b;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.btn-link {
    border: 0;
    background: transparent;
    color: #007bff;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
}

.segmented-control {
    display: inline-flex;
    gap: 6px;
    background: #e8f1ee;
    border: 1px solid #d7e6df;
    border-radius: 999px;
    padding: 4px;
}

.segmented-control button {
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #49635a;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
}

.segmented-control button.active {
    background: #5e9486;
    color: #ffffff;
}

.mt-2 {
    margin-top: 10px;
}

.chip-group {
    display: inline-flex;
    gap: 8px;
    flex-wrap: wrap;
}

.chip {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.chip input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.chip span {
    border: 1px solid #d2ddd8;
    border-radius: 999px;
    background: #ffffff;
    color: #355148;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
}

.chip input:checked + span {
    border-color: #5e9486;
    background: #eaf5f1;
    color: #27463c;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-top: 10px;
}

.category-card {
    cursor: pointer;
    position: relative;
}

.category-card input {
    display: none;
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 10px;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    transition: all 0.2s ease;
    text-align: center;
    min-height: 100px;
}

.category-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: #495057;
}

.check-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #007bff;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.5);
    transition: 0.2s ease;
}

.category-card input:checked + .card-content {
    background: #eef6ff;
    border-color: #007bff;
}

.category-card input:checked + .card-content .category-name {
    color: #007bff;
}

.category-card input:checked + .card-content .check-badge {
    opacity: 1;
    transform: scale(1);
}

@media (hover: hover) {
    .category-card:hover .card-content {
        border-color: #dee2e6;
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
}

.input-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.input-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.input-field label {
    font-size: 12px;
    font-weight: 600;
    color: #32403b;
}

.input-field input,
.input-field select {
    border: 1px solid #d3ddd9;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    background: #ffffff;
}

.input-group-prefix {
    display: flex;
    align-items: center;
    border: 1px solid #d3ddd9;
    border-radius: 10px;
    background: #ffffff;
    padding: 0 10px;
}

.input-group-prefix > span {
    font-size: 13px;
    color: #5b6a64;
    margin-right: 6px;
}

.input-group-prefix > input {
    border: 0;
    outline: none;
    width: 100%;
    padding: 10px 0;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    background: transparent;
}

.grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.filter-footer {
    border-top: 1px solid #e7efeb;
    padding: 12px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-text {
    border: 0;
    background: transparent;
    color: #4f635c;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
}

.btn-primary {
    border: 0;
    border-radius: 10px;
    background: #3d5248;
    color: #ffffff;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
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

.checkbox-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.categories-grid {
    max-height: 160px;
    overflow-y: auto;
    border: 1px solid #d3ddd9;
    border-radius: 10px;
    padding: 8px;
}

.checkbox-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
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

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

@media (max-width: 680px) {
    .custom-range-grid {
        grid-template-columns: 1fr;
    }

    .input-grid,
    .grid-2 {
        grid-template-columns: 1fr;
    }
}
</style>