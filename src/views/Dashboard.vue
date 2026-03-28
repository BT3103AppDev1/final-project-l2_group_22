<template>
    <div class="web-page">
        <header class="page-header">
            <h1>Welcome Back!</h1>
        </header>

        <main class="page-content">
          <!--Everything here is placeholder, need to work on backend logic. 
            Every Value here that needs to be derived from the backend will be commented
            In order to prevent breaking the entire page just edit lines that are commented-->
            <section class="cashflow-card">
                <div class="cashflow-content">
                    <p class = "cashflow-label">Net Cashflow</p>
                    <h2 class="cashflow-amount">$4,000.00</h2><!--Return net cashflow-->
                    <p class = "cashflow-subtext">Positive Balance this period</p>
                </div>

                <div class="cashflow-icon">$</div>
            </section>

            <section class="metric-row">
                <div class="metric-card">
                    <div class="stat-icon income-icon">↗</div>
                    <p class="card-label">Total Income</p>
                    <h3 class="income-text">$5000.00</h3><!--Return total income-->
                    <p class="small-text">3 transactions</p><!--Return total txn of income-->
                </div>

                <div class="metric-card">
                    <div class="stat-icon expense-icon">↘</div>
                    <p class="card-label">Total Expense</p><!--Return total expense-->
                    <h3 class="expense-text">$1000.00</h3><!--Return total txn for expense-->
                    <p class="small-text">5 transactions</p>
                </div>
            </section>

            <section class="category-card">
                <div class="category-header">
                    <div>
                    <p class="section-label">TOP SPENDING CATEGORY</p>
                    <h3 class="category-name">Groceries</h3><!--Return top category-->
                    </div>
                    <div class="category-icon">🧺</div><!--Return top category icon-->
                </div>

                <div class="category-body">
                    <div class="category-left">
                    <p class="category-amount">$200.00</p><!--Return top category amount-->
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    </div>

                    <div class="category-right">
                    <p class="category-percent">25.0%</p><!--Return top category amount over total expense-->
                    <p class="category-note">of total expenses</p>
                    </div>
                </div>
            </section>

            <section class="summary-card">
                <p class="section-label">PERIOD SUMMARY</p>

                <div class="summary-row">
                    <span>Total Transactions</span><!--Return total txn over period-->
                    <strong>8</strong>
                </div>

                <div class="summary-row">
                    <span>Average Income</span>
                    <strong class="income-text-small">$1000</strong><!--Return total income over period-->
                </div>

                <div class="summary-row">
                    <span>Average Expense</span>
                    <strong class="expense-text-small">$200</strong><!--Return total expenses over period-->
                </div>

                <div class="summary-row">
                    <span>Savings Rate</span>
                    <strong>80.0%</strong><!--Return total expenses over total income over period-->
                </div>
            </section>
        </main>

        <BottomNav currentTab="dashboard" />
    </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue"

export default {
    name:"Dashboard",
    components: {
        BottomNav
    }
}
</script>

<style scoped>
.web-page {
    min-height: 100vh;
    display:flex;
    flex-direction: column;
    background: #f2f2f2;
    font-family: "Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif;
}

.page-header {
    padding:20px;
    border-bottom: 2px solid darkgray;
}

.page-header h1 {
    margin: 0;
    font-size: 24px;
    color:black
}

.page-content {
    padding: 20px;
    flex: 1;
}

.cashflow-card {
  background: #7d9f91;
  border-radius: 18px;
  padding: 1px 20px 16px;
  position: relative;
  margin-bottom: 16px;
  color: white;
  
}

.cashflow-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  

}

.cashflow-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
}

.cashflow-label {
  color: whitesmoke;
  font-size: 32px;
  margin: 20px;
  margin-left: 0px;
}

.cashflow-amount {
  margin: 0 0 6px;
  font-size: 42px;
  font-weight: 700;
}

.cashflow-subtext {
  margin: 0;
  font-size: 13px;
  color: whitesmoke;
}

.metric-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 22px;
  font-weight: 700;
}

.income-icon {
  background: #e8f8ee;
  color: #16a34a;
}

.expense-icon {
  background: #fdecec;
  color: #ef4444;
}

.card-label {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  color: #9ca3af;
}

.income-text,
.expense-text {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
}

.income-text {
  color: #16a34a;
}

.expense-text {
  color: #ef4444;
}

.small-text {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.category-card,
.summary-card {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  margin-top: 16px;
}

.section-label {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: 0.4px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.category-name {
  margin: 0;
  font-size: 26px;
  font-weight: 1000;
  color: #111827;
}

.category-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #fff3eb;
  color: #f97316;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.category-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

.category-left {
  flex: 1;
}

.category-amount {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 700;
  color: #111827;
}

.progress-bar {
  width: 100%;
  max-width: 220px;
  height: 7px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  width: 20%;
  height: 100%;
  background: #7d9f91;
  border-radius: 999px;
}

.category-right {
  text-align: right;
}

.category-percent {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #f97316;
}

.category-note {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #eef2f7;
  font-size: 14px;
  color: #4b5563;
}

.summary-row:first-of-type {
  border-top: none;
  padding-top: 4px;
}

.income-text-small {
  color: #16a34a;
  font-weight: 700;
}

.expense-text-small {
  color: #ef4444;
  font-weight: 700;
}
</style>