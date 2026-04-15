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

        <BottomNav currentTab="transactions" />
    </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue"
import TransactionItem from "@/components/TransactionItem.vue"
import EmptyState from "@/components/EmptyState.vue"
import { useTransactionsStore } from "@/stores/transactions"
import { useAuthStore } from "@/stores/AuthStore"

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
            sortDirection: 'desc'
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
        }
    },
    methods: {
        toggleMonthFilter() {
            this.monthFilterEnabled = !this.monthFilterEnabled
        },
        toggleSortDirection() {
            this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc'
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
</style>