<template>
  <div class="web-page">
    <header class="page-header">
      <h1>Insights</h1>

            <div class="header-controls">
                <div class="period-selector">
                    <label class="sr-only" for="insights-month">Select month</label>
                    <select id="insights-month" v-model.number="selectedMonth" class="period-select">
                        <option v-for="option in monthOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>

                    <label class="sr-only" for="insights-year">Select year</label>
                    <select id="insights-year" v-model.number="selectedYear" class="period-select">
                        <option v-for="year in availableYears" :key="year" :value="year">
                            {{ year }}
                        </option>
                    </select>
                </div>
            </div>
    </header>

        <main class="page-content">
            <p class="range-caption">Summary for {{ periodLabel }}</p>

            <div v-if="store.loading" class="loading-message">Loading insight...</div>

            <div v-else class="insights-stack">
                <section class="insight-bubble" :class="{ collapsed: !isExpanded('net-cashflow') }">
                    <div class="card-top" @click="toggleCard('net-cashflow')">
                        <div class="icon-circle">
                            <svg viewBox="0 0 24 24" class="card-icon" fill="none">
                                <path d="M5 16.5L9 12.5L12 15.5L19 8.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M15.5 8.5H19V12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>

                        <div>
                            <p class="card-label">NET CASH FLOW &amp; SAVING RATE</p>
                            <p class="card-subtext">Income vs expense for the selected month</p>
                        </div>
                    </div>
                    <button class="collapse-button" @click.stop="toggleCard('net-cashflow')" aria-label="Toggle net cash flow section">
                        {{ isExpanded('net-cashflow') ? '−' : '+' }}
                    </button>

                    <div class="metric-row">
                        <div class="metric-block income">
                            <p class="metric-label">Income</p>
                            <p class="metric-value">{{ formatCurrency(periodIncome) }}</p>
                        </div>
                        <div class="metric-block expense">
                            <p class="metric-label">Expense</p>
                            <p class="metric-value">{{ formatCurrency(periodExpenses) }}</p>
                        </div>
                        <div class="metric-block" :class="netCashflowClass">
                            <p class="metric-label">Net Cash Flow</p>
                            <p class="metric-value">{{ formatSignedCurrency(periodNetCashFlow) }}</p>
                        </div>
                    </div>

                    <div class="status-row">
                        <div>
                            <p class="status-title">{{ spendingStatusTitle }}</p>
                            <p class="status-subtext">{{ spendingStatusSubtext }}</p>
                        </div>
                        <p class="savings-rate-value">{{ savingsRateText }}</p>
                    </div>

                    <div class="progress-bar" role="presentation">
                        <div class="progress-fill" :style="{ width: savingsProgressWidth }"></div>
                    </div>

                    <button class="why-button" @click="openExplanation('net-cashflow')">
                        <svg class="why-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"></circle>
                            <path d="M9.8 9.5C9.8 8.3 10.8 7.5 12 7.5C13.2 7.5 14.2 8.3 14.2 9.5C14.2 10.4 13.7 11 12.8 11.5C12.2 11.9 12 12.2 12 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                            <circle cx="12" cy="16.5" r="1" fill="currentColor"></circle>
                        </svg>
                        Why this?
                    </button>
                </section>

                <section class="insight-bubble" :class="{ collapsed: !isExpanded('top-spending-categories') }">
                    <div class="card-top" @click="toggleCard('top-spending-categories')">
                        <div class="icon-circle amber">
                            <svg viewBox="0 0 24 24" class="card-icon" fill="none">
                                <path d="M3 6H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M6 6V18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M12 10V18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M18 14V18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                            </svg>
                        </div>

                        <div>
                            <p class="card-label">TOP SPENDING CATEGORIES</p>
                            <p class="card-subtext">Where most expense money is going</p>
                        </div>
                    </div>
                    <button class="collapse-button" @click.stop="toggleCard('top-spending-categories')" aria-label="Toggle top spending categories section">
                        {{ isExpanded('top-spending-categories') ? '−' : '+' }}
                    </button>

                    <div v-if="topExpenseCategories.length" class="category-list">
                        <div v-for="item in topExpenseCategories" :key="item.category" class="category-item">
                            <div class="split-line">
                                <p class="item-title">{{ item.category }}</p>
                                <p class="item-value">{{ formatCurrency(item.total) }}</p>
                            </div>
                            <div class="progress-bar slim">
                                <div class="progress-fill category-fill" :style="{ width: `${item.sharePct}%` }"></div>
                            </div>
                            <p class="support-text">{{ item.shareText }} of period expense</p>
                        </div>
                    </div>
                    <p v-else class="empty-note">No expense data in this period yet.</p>

                    <button class="why-button" @click="openExplanation('top-spending-categories')">
                        <svg class="why-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"></circle>
                            <path d="M9.8 9.5C9.8 8.3 10.8 7.5 12 7.5C13.2 7.5 14.2 8.3 14.2 9.5C14.2 10.4 13.7 11 12.8 11.5C12.2 11.9 12 12.2 12 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                            <circle cx="12" cy="16.5" r="1" fill="currentColor"></circle>
                        </svg>
                        Why this?
                    </button>
                </section>


                <section class="insight-bubble" :class="{ collapsed: !isExpanded('income-volatility') }">
                    <div class="card-top" @click="toggleCard('income-volatility')">
                        <div class="icon-circle green">
                            <svg viewBox="0 0 24 24" class="card-icon" fill="none">
                                <path d="M4 17H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M7 17V11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M12 17V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M17 17V13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                            </svg>
                        </div>

                        <div>
                            <p class="card-label">INCOME VOLATILITY</p>
                            <p class="card-subtext">Highest and lowest earning months</p>
                        </div>
                    </div>
                    <button class="collapse-button" @click.stop="toggleCard('income-volatility')" aria-label="Toggle income volatility section">
                        {{ isExpanded('income-volatility') ? '−' : '+' }}
                    </button>

                    <div v-if="incomeVolatilitySummary.hasData" class="stat-grid">
                        <div class="stat-card">
                            <p class="stat-title">Highest month</p>
                            <p class="stat-value">{{ incomeVolatilitySummary.highest.label }}</p>
                            <p class="stat-meta">{{ formatCurrency(incomeVolatilitySummary.highest.amount) }}</p>
                        </div>
                        <div class="stat-card">
                            <p class="stat-title">Lowest month</p>
                            <p class="stat-value">{{ incomeVolatilitySummary.lowest.label }}</p>
                            <p class="stat-meta">{{ formatCurrency(incomeVolatilitySummary.lowest.amount) }}</p>
                        </div>
                        <div class="stat-card">
                            <p class="stat-title">Volatility range</p>
                            <p class="stat-value">{{ formatCurrency(incomeVolatilitySummary.range) }}</p>
                            <p class="stat-meta">{{ formatPercent(incomeVolatilitySummary.coefficient * 100) }} CV</p>
                        </div>
                    </div>
                    <p v-else class="empty-note">No income history available yet.</p>

                    <button class="why-button" @click="openExplanation('income-volatility')">
                        <svg class="why-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"></circle>
                            <path d="M9.8 9.5C9.8 8.3 10.8 7.5 12 7.5C13.2 7.5 14.2 8.3 14.2 9.5C14.2 10.4 13.7 11 12.8 11.5C12.2 11.9 12 12.2 12 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                            <circle cx="12" cy="16.5" r="1" fill="currentColor"></circle>
                        </svg>
                        Why this?
                    </button>
                </section>

                <section class="insight-bubble" :class="{ collapsed: !isExpanded('category-volatility') }">
                    <div class="card-top" @click="toggleCard('category-volatility')">
                        <div class="icon-circle slate">
                            <svg viewBox="0 0 24 24" class="card-icon" fill="none">
                                <path d="M4 19L10 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M10 13L14 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M14 17L20 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <circle cx="10" cy="13" r="1.5" fill="currentColor" />
                                <circle cx="14" cy="17" r="1.5" fill="currentColor" />
                                <circle cx="20" cy="8" r="1.5" fill="currentColor" />
                            </svg>
                        </div>

                        <div>
                            <p class="card-label">CATEGORY VOLATILITY &amp; BUDGET LEAKS</p>
                            <p class="card-subtext">Month-over-month swings by category</p>
                        </div>
                    </div>
                    <button class="collapse-button" @click.stop="toggleCard('category-volatility')" aria-label="Toggle category volatility section">
                        {{ isExpanded('category-volatility') ? '−' : '+' }}
                    </button>

                    <div v-if="categoryVolatilitySummary.hasData" class="volatility-list">
                        <div v-for="item in categoryVolatilitySummary.volatile" :key="item.category" class="category-item">
                            <div class="split-line">
                                <p class="item-title">{{ item.category }}</p>
                                <p class="item-value">{{ formatPercent(item.coefficient * 100) }} CV</p>
                            </div>
                            <p class="support-text">Average {{ formatCurrency(item.mean) }} per month</p>
                        </div>
                    </div>
                    <p v-else class="empty-note">Not enough category history yet.</p>

                    <p v-if="stableCategoryLabel" class="support-text">
                        Stable categories: {{ stableCategoryLabel }}
                    </p>

                    <button class="why-button" @click="openExplanation('category-volatility')">
                        <svg class="why-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"></circle>
                            <path d="M9.8 9.5C9.8 8.3 10.8 7.5 12 7.5C13.2 7.5 14.2 8.3 14.2 9.5C14.2 10.4 13.7 11 12.8 11.5C12.2 11.9 12 12.2 12 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                            <circle cx="12" cy="16.5" r="1" fill="currentColor"></circle>
                        </svg>
                        Why this?
                    </button>
                </section>

                <section class="insight-bubble" :class="{ collapsed: !isExpanded('recurring-expenses') }">
                    <div class="card-top" @click="toggleCard('recurring-expenses')">
                        <div class="icon-circle red">
                            <svg viewBox="0 0 24 24" class="card-icon" fill="none">
                                <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.8" />
                                <path d="M8 2V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M16 2V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M8 11H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                            </svg>
                        </div>

                        <div>
                            <p class="card-label">RECURRING EXPENSES &amp; HIDDEN SUBSCRIPTIONS</p>
                            <p class="card-subtext">Repeated same-amount charges by date</p>
                        </div>
                    </div>
                    <button class="collapse-button" @click.stop="toggleCard('recurring-expenses')" aria-label="Toggle recurring expenses section">
                        {{ isExpanded('recurring-expenses') ? '−' : '+' }}
                    </button>

                    <div v-if="recurringExpenses.length" class="recurring-list">
                        <div v-for="item in recurringExpenses" :key="item.key" class="category-item">
                            <div class="split-line">
                                <p class="item-title">{{ item.category }}</p>
                                <p class="item-value">{{ formatCurrency(item.amount) }}</p>
                            </div>
                            <p class="support-text">
                                Day {{ formatOrdinalDay(item.day) }} for {{ item.monthCount }} months
                            </p>
                        </div>
                    </div>
                    <p v-else class="empty-note">No recurring expense pattern detected yet.</p>

                    <button class="why-button" @click="openExplanation('recurring-expenses')">
                        <svg class="why-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"></circle>
                            <path d="M9.8 9.5C9.8 8.3 10.8 7.5 12 7.5C13.2 7.5 14.2 8.3 14.2 9.5C14.2 10.4 13.7 11 12.8 11.5C12.2 11.9 12 12.2 12 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                            <circle cx="12" cy="16.5" r="1" fill="currentColor"></circle>
                        </svg>
                        Why this?
                    </button>
                </section>

                <section class="insight-bubble" :class="{ collapsed: !isExpanded('weekday-spending') }">
                    <div class="card-top" @click="toggleCard('weekday-spending')">
                        <div class="icon-circle blue">
                            <svg viewBox="0 0 24 24" class="card-icon" fill="none">
                                <path d="M6 5V19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M12 9V19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                                <path d="M18 13V19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                            </svg>
                        </div>

                        <div>
                            <p class="card-label">DAY-OF-THE-WEEK SPENDING HABITS</p>
                            <p class="card-subtext">Average expense and share by weekday</p>
                        </div>
                    </div>
                    <button class="collapse-button" @click.stop="toggleCard('weekday-spending')" aria-label="Toggle weekday spending section">
                        {{ isExpanded('weekday-spending') ? '−' : '+' }}
                    </button>

                    <div v-if="hasWeekdayData" class="weekday-list">
                        <div v-for="day in weekdaySpending" :key="day.label" class="category-item">
                            <div class="split-line">
                                <p class="item-title">{{ day.label }}</p>
                                <p class="item-value">{{ formatCurrency(day.average) }} avg</p>
                            </div>
                            <div class="progress-bar slim">
                                <div class="progress-fill weekday-fill" :style="{ width: `${day.sharePct}%` }"></div>
                            </div>
                            <p class="support-text">{{ formatPercent(day.sharePct) }} of total expense</p>
                        </div>
                    </div>
                    <p v-else class="empty-note">No weekday spending history yet.</p>

                    <button class="why-button" @click="openExplanation('weekday-spending')">
                        <svg class="why-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"></circle>
                            <path d="M9.8 9.5C9.8 8.3 10.8 7.5 12 7.5C13.2 7.5 14.2 8.3 14.2 9.5C14.2 10.4 13.7 11 12.8 11.5C12.2 11.9 12 12.2 12 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                            <circle cx="12" cy="16.5" r="1" fill="currentColor"></circle>
                        </svg>
                        Why this?
                    </button>
                </section>

            </div>
        </main>

        <NetCashFlowExplanation
            v-if="activeExplanation === 'net-cashflow'"
            :period-label="periodLabel"
            :income="periodIncome"
            :expenses="periodExpenses"
            :net-cashflow="periodNetCashFlow"
            :savings-rate="savingsRate"
            @close="closeExplanation"
        />

        <TopSpendingCategoriesExplanation
            v-if="activeExplanation === 'top-spending-categories'"
            :period-label="periodLabel"
            :top-categories="topExpenseCategories"
            :insight-text="topCategoryInsight"
            @close="closeExplanation"
        />


        <IncomeVolatilityExplanation
            v-if="activeExplanation === 'income-volatility'"
            :summary="incomeVolatilitySummary"
            :insight-text="incomeVolatilityInsight"
            @close="closeExplanation"
        />

        <CategoryVolatilityExplanation
            v-if="activeExplanation === 'category-volatility'"
            :summary="categoryVolatilitySummary"
            :stable-category-label="stableCategoryLabel"
            :insight-text="categoryVolatilityInsight"
            @close="closeExplanation"
        />

        <RecurringExpensesExplanation
            v-if="activeExplanation === 'recurring-expenses'"
            :recurring-expenses="recurringExpenses"
            :insight-text="recurringExpenseInsight"
            @close="closeExplanation"
        />

        <WeekdaySpendingExplanation
            v-if="activeExplanation === 'weekday-spending'"
            :weekday-spending="weekdaySpending"
            :has-data="hasWeekdayData"
            :insight-text="weekdaySpendingInsight"
            @close="closeExplanation"
        />

        <BottomNav currentTab="insights" />
    </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue"
import NetCashFlowExplanation from "@/insight/NetCashFlowExplanation.vue"
import TopSpendingCategoriesExplanation from "@/insight/TopSpendingCategoriesExplanation.vue"
import IncomeVolatilityExplanation from "@/insight/IncomeVolatilityExplanation.vue"
import CategoryVolatilityExplanation from "@/insight/CategoryVolatilityExplanation.vue"
import RecurringExpensesExplanation from "@/insight/RecurringExpensesExplanation.vue"
import WeekdaySpendingExplanation from "@/insight/WeekdaySpendingExplanation.vue"
import { useTransactionsStore } from "@/stores/transactions"
import { useAuthStore } from "@/stores/AuthStore"
import { useCurrencyStore } from "@/stores/currency"

const WEEKDAY_LABELS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]

export default {
    name: "Insights",
    components: {
        BottomNav,
        NetCashFlowExplanation,
        TopSpendingCategoriesExplanation,
        IncomeVolatilityExplanation,
        CategoryVolatilityExplanation,
        RecurringExpensesExplanation,
        WeekdaySpendingExplanation
    },
    setup() {
        const store = useTransactionsStore()
        const authStore = useAuthStore()
        const currencyStore = useCurrencyStore()
        return { store, authStore, currencyStore }
    },
    data() {
        const now = new Date()
        return {
            selectedMonth: now.getMonth(),
            selectedYear: now.getFullYear(),
            activeExplanation: null,
            expandedCards: {
                "net-cashflow": true,
                "top-spending-categories": true,
                "income-volatility": true,
                "category-volatility": true,
                "recurring-expenses": true,
                "weekday-spending": true
            }
        }
    },
    computed: {
        monthOptions() {
            return [
                { value: 0, label: "January" },
                { value: 1, label: "February" },
                { value: 2, label: "March" },
                { value: 3, label: "April" },
                { value: 4, label: "May" },
                { value: 5, label: "June" },
                { value: 6, label: "July" },
                { value: 7, label: "August" },
                { value: 8, label: "September" },
                { value: 9, label: "October" },
                { value: 10, label: "November" },
                { value: 11, label: "December" }
            ]
        },
        availableYears() {
            const currentYear = new Date().getFullYear()
            const years = new Set([currentYear])

            this.normalizedTransactions.forEach(transaction => {
                years.add(transaction.parsedDate.getFullYear())
            })

            return Array.from(years).sort((a, b) => b - a)
        },
        normalizedTransactions() {
            return this.store.transactions
                .map(transaction => {
                    const parsedDate = this.getTransactionDate(transaction)
                    const numericAmount = Number(transaction?.amount)
                    const category = String(transaction?.category || "").trim() || "Uncategorized"
                    const type = String(transaction?.type || "").toLowerCase()

                    return {
                        parsedDate,
                        normalizedAmount: Number.isFinite(numericAmount) ? numericAmount : 0,
                        normalizedCategory: category,
                        normalizedType: type
                    }
                })
                .filter(transaction => {
                    if (!(transaction.parsedDate instanceof Date)) return false
                    if (Number.isNaN(transaction.parsedDate.getTime())) return false
                    if (!["income", "expense"].includes(transaction.normalizedType)) return false
                    return transaction.normalizedAmount >= 0
                })
        },
        periodDates() {
            const year = Number.isFinite(this.selectedYear) ? this.selectedYear : new Date().getFullYear()
            const month = Number.isFinite(this.selectedMonth) ? this.selectedMonth : new Date().getMonth()
            return { year, month }
        },
        periodLabel() {
            const { year, month } = this.periodDates
            return new Date(year, month, 1).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
            })
        },
        periodTransactions() {
            const { year, month } = this.periodDates

            return this.normalizedTransactions.filter(transaction => {
                const date = transaction.parsedDate
                return date.getFullYear() === year && date.getMonth() === month
            })
        },
        periodIncome() {
            return this.periodTransactions
                .filter(transaction => transaction.normalizedType === "income")
                .reduce((sum, transaction) => sum + transaction.normalizedAmount, 0)
        },
        periodExpenses() {
            return this.periodTransactions
                .filter(transaction => transaction.normalizedType === "expense")
                .reduce((sum, transaction) => sum + transaction.normalizedAmount, 0)
        },
        periodNetCashFlow() {
            return this.periodIncome - this.periodExpenses
        },
        savingsRate() {
            if (this.periodIncome <= 0) return null
            return (this.periodNetCashFlow / this.periodIncome) * 100
        },
        savingsRateText() {
            if (this.savingsRate === null) return "Savings rate: N/A"
            return `Savings rate: ${this.savingsRate.toFixed(1)}%`
        },
        savingsProgressWidth() {
            if (this.savingsRate === null) return "0%"
            return `${Math.max(0, Math.min(this.savingsRate, 100)).toFixed(1)}%`
        },
        spendingStatusTitle() {
            if (this.savingsRate === null) return "No income recorded"
            return this.periodNetCashFlow >= 0 ? "Living within your means" : "Spending above income"
        },
        spendingStatusSubtext() {
            if (this.savingsRate === null) {
                return "Add an income transaction to calculate savings rate."
            }

            if (this.periodNetCashFlow >= 0) {
                return "You kept money left over after expenses in this period."
            }

            return "Your expenses were higher than your income in this period."
        },
        netCashflowClass() {
            return this.periodNetCashFlow >= 0 ? "positive" : "negative"
        },
        topExpenseCategories() {
            const grouped = {}

            this.periodTransactions.forEach(transaction => {
                if (transaction.normalizedType !== "expense") return
                grouped[transaction.normalizedCategory] = (grouped[transaction.normalizedCategory] || 0) + transaction.normalizedAmount
            })

            const totalExpenses = Object.values(grouped).reduce((sum, amount) => sum + amount, 0)

            return Object.entries(grouped)
                .map(([category, total]) => {
                    const sharePct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
                    return {
                        category,
                        total,
                        sharePct: Number(sharePct.toFixed(1)),
                        shareText: `${sharePct.toFixed(1)}%`
                    }
                })
                .sort((a, b) => b.total - a.total)
                .slice(0, 4)
        },
        topCategoryInsight() {
            if (!this.topExpenseCategories.length) {
                return "You do not have expense transactions in this period yet, so there is no category concentration to review."
            }

            const [topCategory] = this.topExpenseCategories
            const topThreeShare = this.topExpenseCategories
                .slice(0, 3)
                .reduce((sum, item) => sum + item.sharePct, 0)

            if (topCategory.sharePct >= 45) {
                return `${topCategory.category} is dominating your spending at ${topCategory.shareText}. This is your first place to review for potential cutbacks.`
            }

            if (topThreeShare >= 80) {
                return `Your spending is concentrated in a few categories (${topThreeShare.toFixed(1)}% in the top three), so targeted adjustments there can make a large difference.`
            }

            return "Your spending is spread across categories rather than concentrated in one bucket, which suggests smaller improvements across multiple categories may work best."
        },
        incomeTrendSeries() {
            const buckets = this.buildRecentMonthBuckets(12)
            const bucketLookup = Object.fromEntries(buckets.map(bucket => [bucket.key, bucket]))

            this.normalizedTransactions.forEach(transaction => {
                if (transaction.normalizedType !== "income") return
                const key = this.buildMonthKey(transaction.parsedDate)
                if (bucketLookup[key]) {
                    bucketLookup[key].amount += transaction.normalizedAmount
                }
            })

            return buckets
        },
        incomeVolatilitySummary() {
            const hasData = this.incomeTrendSeries.some(point => point.amount > 0)
            if (!hasData) {
                return {
                    hasData: false,
                    highest: null,
                    lowest: null,
                    range: 0,
                    coefficient: 0
                }
            }

            const highest = this.incomeTrendSeries.reduce((lead, point) => {
                if (!lead || point.amount > lead.amount) return point
                return lead
            }, null)

            const lowest = this.incomeTrendSeries.reduce((lead, point) => {
                if (!lead || point.amount < lead.amount) return point
                return lead
            }, null)

            const amounts = this.incomeTrendSeries.map(point => point.amount)
            const average = amounts.reduce((sum, value) => sum + value, 0) / amounts.length
            const stdDev = this.getStandardDeviation(amounts)
            const coefficient = average > 0 ? stdDev / average : 0

            return {
                hasData: true,
                highest,
                lowest,
                range: highest.amount - lowest.amount,
                coefficient
            }
        },
        incomeVolatilityInsight() {
            if (!this.incomeVolatilitySummary.hasData) {
                return "No monthly income volatility can be measured yet. Add income transactions over multiple months to reveal lean and peak periods."
            }

            const cvPercent = this.incomeVolatilitySummary.coefficient * 100
            if (cvPercent >= 60) {
                return "Income is highly volatile month to month. Prioritize a larger emergency fund and conservative fixed commitments."
            }

            if (cvPercent >= 30) {
                return "Income has moderate volatility. Keep a buffer for weaker months and avoid anchoring your budget to peak months."
            }

            return "Income is fairly stable over recent months, which makes cash flow planning and goal setting more predictable."
        },
        categoryVolatilitySummary() {
            const buckets = this.buildRecentMonthBuckets(6)
            const monthKeys = buckets.map(bucket => bucket.key)
            const monthKeySet = new Set(monthKeys)
            const grouped = {}

            this.normalizedTransactions.forEach(transaction => {
                if (transaction.normalizedType !== "expense") return

                const key = this.buildMonthKey(transaction.parsedDate)
                if (!monthKeySet.has(key)) return

                if (!grouped[transaction.normalizedCategory]) {
                    grouped[transaction.normalizedCategory] = Object.fromEntries(monthKeys.map(monthKey => [monthKey, 0]))
                }

                grouped[transaction.normalizedCategory][key] += transaction.normalizedAmount
            })

            const categoryStats = Object.entries(grouped)
                .map(([category, totals]) => {
                    const values = monthKeys.map(monthKey => totals[monthKey] || 0)
                    const monthsWithSpend = values.filter(value => value > 0).length
                    const mean = values.reduce((sum, value) => sum + value, 0) / values.length
                    const stdDev = this.getStandardDeviation(values)
                    const coefficient = mean > 0 ? stdDev / mean : 0

                    return {
                        category,
                        monthsWithSpend,
                        mean,
                        coefficient
                    }
                })
                .filter(item => item.monthsWithSpend >= 2)

            return {
                hasData: categoryStats.length > 0,
                volatile: [...categoryStats]
                    .sort((a, b) => b.coefficient - a.coefficient)
                    .slice(0, 4),
                stable: [...categoryStats]
                    .sort((a, b) => a.coefficient - b.coefficient)
                    .slice(0, 3)
            }
        },
        stableCategoryLabel() {
            if (!this.categoryVolatilitySummary.stable.length) return ""
            return this.categoryVolatilitySummary.stable.map(item => item.category).join(", ")
        },
        categoryVolatilityInsight() {
            if (!this.categoryVolatilitySummary.hasData) {
                return "Not enough category history yet to identify volatility or fixed-cost patterns."
            }

            const lead = this.categoryVolatilitySummary.volatile[0]
            if (!lead) {
                return "Category variance is currently limited, which may indicate mostly fixed spending behavior."
            }

            if (lead.coefficient >= 0.6) {
                return `${lead.category} shows large swings month over month. This is a likely budget leak area to cap with a tighter limit.`
            }

            return "Category swings are moderate. Use the more volatile categories as discretionary control points, while stable categories represent your fixed-cost base."
        },
        recurringExpenses() {
            const grouped = new Map()

            this.normalizedTransactions.forEach(transaction => {
                if (transaction.normalizedType !== "expense") return
                if (transaction.normalizedAmount <= 0) return

                const amountFixed = transaction.normalizedAmount.toFixed(2)
                const day = transaction.parsedDate.getDate()
                const monthKey = this.buildMonthKey(transaction.parsedDate)
                const key = `${transaction.normalizedCategory}|${amountFixed}|${day}`

                if (!grouped.has(key)) {
                    grouped.set(key, {
                        key,
                        category: transaction.normalizedCategory,
                        amount: Number(amountFixed),
                        day,
                        months: new Set()
                    })
                }

                grouped.get(key).months.add(monthKey)
            })

            return Array.from(grouped.values())
                .filter(item => item.months.size >= 3)
                .map(item => ({
                    key: item.key,
                    category: item.category,
                    amount: item.amount,
                    day: item.day,
                    monthCount: item.months.size
                }))
                .sort((a, b) => b.monthCount - a.monthCount || b.amount - a.amount)
                .slice(0, 5)
        },
        recurringExpenseInsight() {
            if (!this.recurringExpenses.length) {
                return "No strong recurring charge pattern is detected yet. More monthly history will reveal subscriptions and fixed obligations."
            }

            const monthlyCommitted = this.recurringExpenses.reduce((sum, item) => sum + item.amount, 0)
            return `Detected recurring charges total about ${this.formatCurrency(monthlyCommitted)} per month. Review these first to catch silent auto-renewals.`
        },
        weekdaySpending() {
            const weekdays = WEEKDAY_LABELS.map((label, index) => ({
                label,
                index,
                total: 0,
                count: 0,
                average: 0,
                sharePct: 0
            }))

            let totalExpense = 0

            this.normalizedTransactions.forEach(transaction => {
                if (transaction.normalizedType !== "expense") return

                const dayIndex = transaction.parsedDate.getDay()
                weekdays[dayIndex].total += transaction.normalizedAmount
                weekdays[dayIndex].count += 1
                totalExpense += transaction.normalizedAmount
            })

            return weekdays.map(day => ({
                ...day,
                average: day.count > 0 ? day.total / day.count : 0,
                sharePct: totalExpense > 0 ? Number(((day.total / totalExpense) * 100).toFixed(1)) : 0
            }))
        },
        hasWeekdayData() {
            return this.weekdaySpending.some(day => day.total > 0)
        },
        weekdaySpendingInsight() {
            if (!this.hasWeekdayData) {
                return "No weekday pattern can be measured yet because expense activity is too limited."
            }

            const topDay = this.weekdaySpending.reduce((lead, day) => {
                if (!lead || day.total > lead.total) return day
                return lead
            }, null)

            const weekendTotal = this.weekdaySpending[0].total + this.weekdaySpending[6].total
            const total = this.weekdaySpending.reduce((sum, day) => sum + day.total, 0)
            const weekendShare = total > 0 ? (weekendTotal / total) * 100 : 0

            if (weekendShare >= 50) {
                return `${weekendShare.toFixed(1)}% of expense happens on weekends, with ${topDay.label} as the highest day. Weekend guardrails could reduce discretionary leakage.`
            }

            return `${topDay.label} has the heaviest spending pattern so far. Use this timing signal to set day-specific spending limits.`
        }
    },
    watch: {
        availableYears(years) {
            if (!years.includes(this.selectedYear)) {
                this.selectedYear = years[0]
            }
        },
        "authStore.currentUserId": {
            immediate: true,
            handler(userId) {
                this.store.fetchTransactions(userId)
                this.currencyStore.init(userId)
            }
        }
    },
    methods: {
        openExplanation(explanationKey) {
            this.activeExplanation = explanationKey
        },
        closeExplanation() {
            this.activeExplanation = null
        },
        toggleCard(cardKey) {
            this.expandedCards[cardKey] = !this.expandedCards[cardKey]
        },
        isExpanded(cardKey) {
            return this.expandedCards[cardKey] !== false
        },
        getTransactionDate(transaction) {
            let date = transaction?.date
            if (!date) return null
            if (date.toDate) return date.toDate()
            if (typeof date === "string") return new Date(date)
            if (date instanceof Date) return date
            return null
        },
        buildMonthKey(date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, "0")
            return `${year}-${month}`
        },
        buildRecentMonthBuckets(monthCount) {
            const buckets = []
            const now = new Date()

            for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
                const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
                buckets.push({
                    key: this.buildMonthKey(date),
                    label: date.toLocaleDateString("en-US", { month: "short" }),
                    longLabel: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                    amount: 0
                })
            }

            return buckets
        },
        getStandardDeviation(values) {
            if (!Array.isArray(values) || values.length === 0) return 0

            const mean = values.reduce((sum, value) => sum + value, 0) / values.length
            const variance = values.reduce((sum, value) => {
                const delta = value - mean
                return sum + delta * delta
            }, 0) / values.length

            return Math.sqrt(variance)
        },
        toSafeNumber(value) {
            const parsed = Number(value)
            return Number.isFinite(parsed) ? parsed : 0
        },
        formatCurrency(amount) {
            return this.currencyStore.formatAmount(amount, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        },
        formatSignedCurrency(amount) {
            return this.currencyStore.formatSignedValue(amount, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        },
        formatCompactCurrency(amount) {
            return this.currencyStore.formatAmount(amount, {
                notation: "compact",
                minimumFractionDigits: 0,
                maximumFractionDigits: 1
            })
        },
        formatPercent(value) {
            return `${Number(value || 0).toFixed(1)}%`
        },
        formatOrdinalDay(day) {
            const value = Number(day)
            const mod100 = value % 100
            if (mod100 >= 11 && mod100 <= 13) return `${value}th`
            switch (value % 10) {
                case 1:
                    return `${value}st`
                case 2:
                    return `${value}nd`
                case 3:
                    return `${value}rd`
                default:
                    return `${value}th`
            }
        }
    }
}
</script>

<style scoped>
.web-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f3f4f6;
    font-family: "Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif;
}

.page-header {
    padding: 20px;
    height: 76px;
    box-sizing: border-box;
    border-bottom: 1px solid #dfe6e3;
    background: #ffffff;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: nowrap;
}

.page-header h1 {
    margin: 0;
    font-size: 24px;
    color: #24302c;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
}

.header-controls {
    display: flex;
    align-items: center;
    width: auto;
    flex: 0 1 auto;
    min-width: 0;
}

.page-content {
  padding: 20px;
  flex: 1;
}

.period-selector {
    display: flex;
    flex-direction: row;
    gap: 8px;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    overflow-x: visible;
    background: #edf6f2;
    border: 1px solid #d4e4de;
    border-radius: 999px;
    padding: 6px;
}

.period-select {
    border: 1px solid #c6d8d1;
    border-radius: 12px;
    padding: 4px 8px;
    height: 34px;
    max-width: 130px;
    font-size: 13px;
    font-weight: 600;
    color: #24302c;
    background: #ffffff;
    cursor: pointer;
    box-sizing: border-box;
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

@media (max-width: 900px) {
    .header-controls {
        width: auto;
    }

    .period-selector {
        justify-content: flex-start;
        flex-wrap: nowrap;
    }
}

.range-caption {
    margin: 12px 0;
    color: #6b7280;
    font-size: 13px;
}

.loading-message {
    color: #6b7280;
    text-align: center;
    padding: 36px 0;
}

.insights-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.insight-bubble {
    background: #ffffff;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 8px 26px rgba(15, 23, 42, 0.06);
    position: relative;
}

.card-top {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding-right: 56px;
}

.collapse-button {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    border: 1px solid #d1d5db;
    background: #fff;
    color: #4b5563;
    font-size: 15px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
}

.insight-bubble.collapsed > :not(.card-top):not(.collapse-button):not(.why-button) {
    display: none;
}

.icon-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #d8ede3;
    color: #3b7a63;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-circle.amber {
    background: #fef3c7;
    color: #92400e;
}

.icon-circle.orange {
    background: #ffedd5;
    color: #9a3412;
}

.icon-circle.green {
    background: #dcfce7;
    color: #166534;
}

.icon-circle.slate {
    background: #e2e8f0;
    color: #334155;
}

.icon-circle.red {
    background: #fee2e2;
    color: #991b1b;
}

.icon-circle.blue {
    background: #dbeafe;
    color: #1d4ed8;
}

.icon-circle.deep-blue {
    background: #dbeafe;
    color: #1e3a8a;
}

.card-icon {
    width: 22px;
    height: 22px;
}

.card-label {
    margin: 0;
    font-size: 14px;
    font-weight: 800;
    color: #111827;
}

.card-subtext {
    margin: 2px 0 0;
    font-size: 12px;
    color: #6b7280;
}

.metric-row {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

.metric-block {
    background: #f9fafb;
    border-radius: 12px;
    padding: 10px;
}

.metric-label {
    margin: 0;
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.metric-value {
    margin: 6px 0 0;
    font-size: 14px;
    font-weight: 800;
    color: #111827;
}

.metric-block.income .metric-value,
.metric-block.positive .metric-value {
    color: #047857;
}

.metric-block.expense .metric-value,
.metric-block.negative .metric-value {
    color: #b91c1c;
}

.status-row {
    margin-top: 14px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
}

.status-title {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
}

.status-subtext {
    margin: 4px 0 0;
    font-size: 12px;
    color: #6b7280;
}

.savings-rate-value {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #334155;
    white-space: nowrap;
}

.progress-bar {
    margin-top: 12px;
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
}

.progress-bar.slim {
    height: 6px;
    margin-top: 8px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f8a73, #7cc39f);
    border-radius: 999px;
    transition: width 0.25s ease;
}

.progress-fill.category-fill {
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-fill.weekday-fill {
    background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.why-button {
        width: 24px;
        height: 24px;
        margin: 0;
        padding: 0;
        border: 1px solid #d1d5db;
        border-radius: 999px;
        background: #ffffff;
        color: #4b5563;
        font-size: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 18px;
        right: 50px;
}

.why-button::after {
        content: "?";
        font-size: 13px;
        font-weight: 700;
        line-height: 1;
}

.why-icon {
    display: none;
}

.empty-note {
    margin: 10px 0 0;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px;
    color: #64748b;
    font-size: 13px;
}

.category-list,
.volatility-list,
.recurring-list,
.weekday-list {
    margin-top: 12px;
    display: grid;
    gap: 8px;
}

.category-item {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #f8fafc;
    padding: 10px;
}

.split-line {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
}

.item-title {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
}

.item-value {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    white-space: nowrap;
}

.support-text {
    margin: 6px 0 0;
    font-size: 12px;
    color: #64748b;
}

.trend-chart {
    margin-top: 12px;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(56px, 1fr);
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
}

.seasonal-chart {
    margin-top: 10px;
}

.seasonal-line-svg {
    width: 100%;
    height: 170px;
    display: block;
}

.seasonal-line {
    stroke: #2563eb;
}

.seasonal-dot {
    fill: #1d4ed8;
}

.seasonal-axis-labels {
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
    padding: 0 3.89%;
}

.seasonal-axis-labels span {
    text-align: center;
    font-size: 10px;
    color: #4b5563;
}

.trend-column {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.trend-value {
    margin: 0 0 5px;
    font-size: 10px;
    color: #64748b;
}

.trend-bar-track {
    width: 18px;
    height: 92px;
    border-radius: 999px;
    background: #e5e7eb;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
}

.trend-bar {
    width: 100%;
    border-radius: 999px;
    min-height: 3px;
}

.trend-bar.expense {
    background: linear-gradient(180deg, #fb923c, #ea580c);
}

.trend-bar.season {
    background: linear-gradient(180deg, #60a5fa, #2563eb);
}

.trend-label {
    margin: 6px 0 0;
    font-size: 11px;
    color: #4b5563;
}

.stat-grid {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
}

.stat-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px;
    background: #f8fafc;
}

.stat-title {
    margin: 0;
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.stat-value {
    margin: 6px 0 0;
    font-size: 13px;
    font-weight: 700;
    color: #1f2937;
}

.stat-meta {
    margin: 4px 0 0;
    font-size: 12px;
    color: #64748b;
}

@media (max-width: 900px) {
    .stat-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 700px) {
    .metric-row {
        grid-template-columns: 1fr;
    }

    .status-row {
        flex-direction: column;
    }

    .savings-rate-value {
        white-space: normal;
    }
}


.progress-fill.goal-fill.at-risk {
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-fill.goal-fill.exceeded {
    background: linear-gradient(90deg, #ef4444, #f87171);
}

.progress-fill.goal-fill.met {
    background: linear-gradient(90deg, #4f8a73, #7cc39f);
}

.goal-progress-track {
    height: 10px;
    background: #d1d5db;
}

.goal-progress-fill {
    display: block;
}

.adjust-goals-btn {
    width: 100%;
    margin-top: 14px;
    padding: 10px 0;
    border: 1px solid #d1fae5;
    border-radius: 12px;
    background: #ecfdf5;
    color: #065f46;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.15s;
}

.adjust-goals-btn:hover {
    background: #d1fae5;
}
</style>
