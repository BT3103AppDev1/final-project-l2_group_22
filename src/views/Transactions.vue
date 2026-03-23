<template>
    <div class="web-page">
        <header class="page-header">
            <h1>Transactions</h1>
        </header>

        <div class="tab-bar">
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

        <main class="page-content">
            <div v-if="store.loading" class="loading-message">Loading…</div>
            <ul v-else-if="filteredTransactions.length > 0" class="transactions-list">
                <li v-for="transaction in filteredTransactions" :key="transaction.id">
                    <TransactionItem :transaction="transaction" />
                </li>
            </ul>
            <EmptyState v-else />
        </main>

        <BottomNav currentTab="transactions" />
    </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue"
import TransactionItem from "@/components/TransactionItem.vue"
import EmptyState from "@/components/EmptyState.vue"
import { useTransactionsStore } from "@/stores/transactions"

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
        this.store.fetchTransactions()
    },
    setup() {
        const store = useTransactionsStore()
        return { store }
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
}

.page-header h1 {
    margin: 0;
    font-size: 24px;
    color: var(--text-900);
}

.tab-bar {
    display: flex;
    gap: 24px;
    padding: 16px 20px;
    background: white;
    border-bottom: 1px solid var(--border);
}

.tab-button {
    border: none;
    background: transparent;
    padding: 8px 0;
    color: var(--text-700);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.tab-button.active {
    color: var(--brand);
    border-bottom-color: var(--brand);
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
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.transactions-list li {
    margin: 0;
}
</style>