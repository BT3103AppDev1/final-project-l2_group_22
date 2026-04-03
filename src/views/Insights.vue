<template>
  <div class="web-page">
    <header class="page-header">
      <h1>Insights</h1>
    </header>

    <main class="page-content">
      <!--Everything here is placeholder, need to work on backend logic. 
            Every Value here that needs to be derived from the backend will be commented-->
      <section class="insight-card">
        <div class="card-top">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" class="card-icon" fill="none">
              <path
                d="M7 10h10M7 14h6"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <rect
                x="5"
                y="4"
                width="14"
                height="16"
                rx="2"
                stroke="currentColor"
                stroke-width="1.8"
              />
            </svg>
          </div>

          <div class="title-text">
            <p class="card-label">TOP SPENDING CATEGORY</p>
            <p class="card-subtext">Where you spent the most this period</p>
          </div>
        </div>

        <div class="card-content">
          <div class="left">
            <h2>Groceries</h2>
            <!--Return Top category here-->
            <p class="left-subtext">8 transactions</p>
            <!--Return Amount of txn from Top category here-->
          </div>
          <div class="right">
            <h2 class="amount">$200.00</h2>
            <p class="right-subtext">20.0% of expenses</p>
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill"></div>
          <!--Need to return progress status in the CSS, update width-->
        </div>

        <button class="why-button">
          <svg
            class="why-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="8"
              stroke="currentColor"
              stroke-width="1.8"
            ></circle>
            <path
              d="M9.8 9.5C9.8 8.3 10.8 7.5 12 7.5C13.2 7.5 14.2 8.3 14.2 9.5C14.2 10.4 13.7 11 12.8 11.5C12.2 11.9 12 12.2 12 13"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            ></path>
            <circle cx="12" cy="16.5" r="1" fill="currentColor"></circle>
          </svg>
          Why this?
        </button>
      </section>

      <section class="insight-card">
        <!--Biggest Change Card-->
        <div class="card-top">
          <div class="icon-circle" style="color: red; background: #fdecec">
            <svg
              class="card-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 15L10 10L13 13L19 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M15 7H19V11"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </div>

          <div class="title-text">
            <p class="card-label">BIGGEST CHANGE</p>
            <p class="card-subtext">Largest Spending Change</p>
          </div>
        </div>

        <div class="left">
          <h2>Dining</h2>
          <!--Return Top category here-->
          <p class="left-subtext">Up 23% vs last period</p>
          <!--Return Amount of txn from Top category here-->
        </div>

        <div class="split-row">
          <div class="col-left">
            <p class="col-label">PREVIOUS PERIOD</p>
            <p class="col-value">$89.30</p>
          </div>

          <div class="col-right">
            <p class="col-label">CURRENT PERIOD</p>
            <p class="col-value">$156.45</p>
          </div>
        </div>

        <div class="change-content insight-box" style="background: #f2f2f2">
          <div class="left">
            <p class="left-subtext change">Change Amount:</p>
          </div>

          <div class="right">
            <p class="right-subtext change" style="color: red">$67.15</p>
          </div>
        </div>

        <div class="insight-box">
          <p class="insight-text">Insert Insight Here</p>
        </div>

        <button class="why-button">
          <svg
            class="why-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="8"
              stroke="currentColor"
              stroke-width="1.8"
            ></circle>
            <path
              d="M9.8 9.5C9.8 8.3 10.8 7.5 12 7.5C13.2 7.5 14.2 8.3 14.2 9.5C14.2 10.4 13.7 11 12.8 11.5C12.2 11.9 12 12.2 12 13"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            ></path>
            <circle cx="12" cy="16.5" r="1" fill="currentColor"></circle>
          </svg>
          Why this?
        </button>
      </section>

      <section class="insight-card">
        <!--Top Merchant Card-->
        <div class="card-top">
          <div class="icon-circle" style="color: #a855f7; background: #f3e8ff">
            <svg
              class="card-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 9L5.5 6H18.5L20 9"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M6 9V18H18V9"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M10 13H14V18H10V13Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              ></path>
            </svg>
          </div>

          <div class="title-text">
            <p class="card-label">TOP MERCHANT</p>
            <p class="card-subtext">Where you shopped the most</p>
          </div>
        </div>

        <div class="card-content">
          <div class="left">
            <h2>McDonalds</h2>
            <!--Return Top Merchant here-->
            <p class="left-subtext">8 transactions</p>
            <!--Return Amount of txn from Top category here-->
          </div>
          <div class="right">
            <h2 class="amount" style="color: #a855f7">$100.00</h2>
            <!--Return  Amount spent at Top Merchant here-->
            <p class="right-subtext">Total Spent</p>
          </div>
        </div>

        <div class="split-row">
          <div class="col-left">
            <p class="col-label">AVG PER VISIT</p>
            <p class="col-value">$12.40</p>
            <!--Return AVG Amount spent at Top Merchant here-->
          </div>

          <div class="col-right">
            <p class="col-label">VISITS THIS PERIOD</p>
            <!--Return visits at Top Merchant here-->
            <p class="col-value">7</p>
          </div>
        </div>

        <div class="insight-box">
          <p class="insight-text">Insert Insight Here</p>
        </div>

        <button class="why-button">
          <svg
            class="why-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="8"
              stroke="currentColor"
              stroke-width="1.8"
            ></circle>
            <path
              d="M9.8 9.5C9.8 8.3 10.8 7.5 12 7.5C13.2 7.5 14.2 8.3 14.2 9.5C14.2 10.4 13.7 11 12.8 11.5C12.2 11.9 12 12.2 12 13"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            ></path>
            <circle cx="12" cy="16.5" r="1" fill="currentColor"></circle>
          </svg>
          Why this?
        </button>
      </section>
    </main>

    <BottomNav currentTab="insights" />
  </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue";

export default {
  name: "Insights",
  components: {
    BottomNav,
  },
};
</script>

<style scoped>
.web-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f2f2f2;
  font-family: "Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif;
}

.page-header {
  padding: 20px;
  border-bottom: 2px solid darkgray;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: black;
}

.page-content {
  padding: 20px;
  flex: 1;
}

.insight-card {
  background: white;
  border-radius: 18px;
  padding: 1px 20px 16px;
  margin-bottom: 16px;
}

.card-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.title-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #dfe9e3;
  color: #7d9f91;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon {
  width: 26px;
  height: 26px;
}

.card-label {
  font-weight: bolder;
  font-size: 20px;
  margin: 10px 0 0 0;
}

.card-subtext {
  font-size: 12px;
  margin: 0;
  color: gray;
}
.card-content {
  display: flex;
  justify-content: space-between;
}
.left {
  text-align: left;
}
.right {
  text-align: right;
}

h2 {
  font-weight: 900;
  margin: 0;
  margin-top: 24px;
  font-weight: 900;
}

.left-subtext,
.right-subtext {
  margin: 0;
  margin-bottom: 10px;
  color: gray;
}

.amount {
  color: #7d9f91;
}

.progress-bar {
  width: 100%;
  height: 7px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  width: 20%; /* Here should be returned value from backend*/
  height: 100%;
  background: #7d9f91;
  border-radius: 999px;
}

.split-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.col-left,
.col-right {
  width: 50%;
  display: flex;
  flex-direction: column;
}

.col-label {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
}

.col-value {
  margin: 4px 0 0 0;
  font-size: 16px;
  font-weight: 800;
  color: #1f2937;
}

.why-button {
  width: 100%;
  margin-top: 12px;
  padding: 10px 0;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.why-button:hover {
  background: #f3f4f6;
}

.why-icon {
  width: 16px;
  height: 16px;
}

.insight-box {
  margin-top: 12px;
  padding: 12px 14px;
  background: #d6e1f6;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.insight-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #4b5563;
}

.change-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.change {
  font-size: 13px;
  margin: 0;
}
</style>
