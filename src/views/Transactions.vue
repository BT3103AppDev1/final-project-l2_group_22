<template>
    <div class="web-page">
        <header class="page-header">
            <h1>Transactions</h1>
            <div class="header-icons">
                <button class="icon-button">🔽</button>
                <button class="icon-button">↕️</button>
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
            activeTab: 'expense'
        }
    },
    computed: {
        filteredTransactions() {
            return this.store.transactions.filter(t => t.type === this.activeTab)
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
}

.page-header h1 {
    margin: 0;
    font-size: 24px;
    color: var(--text-900);
}

.header-icons {
    display: flex;
    gap: 12px;
}

.icon-button {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
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