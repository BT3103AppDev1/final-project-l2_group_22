<template>
  <div class="web-page">
    <header class="page-header">
      <h1>Settings</h1>
    </header>

    <main class="page-content">
      <p class="desc">Preferences</p>
      <div class="content settings-group">
        <div class="menu-item currency-item">
          <div class="menu-left">
            <div class="menu-icon-circle">
              <svg
                class="menu-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"></circle>
                <path d="M9 9.5C9 8.6 9.8 8 10.8 8H13.2C14.2 8 15 8.6 15 9.5C15 10.3 14.4 10.8 13.6 11L10.4 11.8C9.6 12 9 12.5 9 13.3C9 14.2 9.8 14.8 10.8 14.8H13.2C14.2 14.8 15 14.2 15 13.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                <path d="M12 6.8V8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                <path d="M12 16V17.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
              </svg>
            </div>

            <div class="menu-text">
              <p class="menu-title">Display Currency</p>
              <p class="menu-subtext">{{ exchangeRateText }}</p>
            </div>
          </div>

          <div class="currency-controls">
            <select
              class="currency-select"
              :value="currencyStore.selectedCurrency"
              :disabled="currencyStore.isLoading"
              @change="handleCurrencyChange($event.target.value)"
            >
              <option
                v-for="currency in currencyStore.supportedCurrencies"
                :key="currency.code"
                :value="currency.code"
              >
                {{ currency.code }} - {{ currency.label }}
              </option>
            </select>
          </div>
        </div>

        <button class="menu-item" @click="$router.push('/settings/categories')">
          <div class="menu-left">
            <div class="menu-icon-circle">
              <svg
                class="menu-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
                <path
                  d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </div>

            <div class="menu-text">
              <p class="menu-title">Categories</p>
              <p class="menu-subtext">Manage expense and income categories</p>
            </div>
          </div>

          <svg
            class="menu-arrow"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 7L15 12L10 17"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>

        <button class="menu-item" @click="$router.push('/goals')">
          <div class="menu-left">
            <div class="menu-icon-circle">
              <svg
                class="menu-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  stroke-width="2"
                ></circle>
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                  stroke="currentColor"
                  stroke-width="2"
                ></circle>
                <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
              </svg>
            </div>

            <div class="menu-text">
              <p class="menu-title">Goals</p>
              <p class="menu-subtext">Set spending caps and savings targets</p>
            </div>
          </div>

          <svg
            class="menu-arrow"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 7L15 12L10 17"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>

      </div>

      <p class="desc">Account</p>

      <div class="content settings-group">
        <button class="menu-item" @click="$router.push('/profile')">
          <div class="menu-left">
            <div class="menu-icon-circle">
              <svg
                class="menu-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>

                <path
                  d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </div>

            <div class="menu-text">
              <p class="menu-title">Profile</p>

              <p class="menu-subtext">Personal Information and preferences</p>
            </div>
          </div>

          <svg
            class="menu-arrow"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 7L15 12L10 17"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>

      </div>

      <p class="desc">Support</p>

      <div class="content settings-group">
        <button class="menu-item" @click="showHelpCenter = true">
          <div class="menu-left">
            <div class="menu-icon-circle">
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
            </div>

            <div class="menu-text">
              <p class="menu-title">Help Center</p>

              <p class="menu-subtext">FAQ and support articles</p>
            </div>
          </div>

          <svg
            class="menu-arrow"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 7L15 12L10 17"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>

        <div class="menu-item menu-item--static" aria-disabled="true">
          <div class="menu-left">
            <div class="menu-icon-circle">
              <svg
                class="info-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>

                <path
                  d="M12 9h.01"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>

                <path
                  d="M11 12h1v4h1"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </div>

            <div class="menu-text">
              <p class="menu-title">About</p>

              <p class="menu-subtext">Version 1.0</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showHelpCenter" class="modal-overlay" @click.self="showHelpCenter = false">
      <div class="help-modal" role="dialog" aria-modal="true" aria-label="Help center">
        <h2>Help Center</h2>
        <p>Need support? Email our team and we will get back to you.</p>
        <a class="help-email-link" href="mailto:groupl22bt3103@gmail.com">groupl22bt3103@gmail.com</a>
        <button class="help-close-btn" @click="showHelpCenter = false">Close</button>
      </div>
    </div>

    <BottomNav currentTab="settings" :disableNavigation="currencyStore.isLoading" />
  </div>
</template>

<script>
import BottomNav from "@/components/BottomNav.vue";
import { useAuthStore } from "@/stores/AuthStore";
import { useCurrencyStore } from "@/stores/currency";

export default {
  name: "Settings",

  components: {
    BottomNav,
  },

  setup() {
    const authStore = useAuthStore();
    const currencyStore = useCurrencyStore();
    return { authStore, currencyStore };
  },

  data() {
    return {
      showHelpCenter: false,
    };
  },

  computed: {
    exchangeRateText() {
      if (this.currencyStore.error) {
        return "Rate unavailable. Using last known value.";
      }
      return this.currencyStore.exchangeRateLabel;
    },
  },

  watch: {
    "authStore.currentUserId": {
      immediate: true,
      handler(userId) {
        this.currencyStore.init(userId);
      },
    },
  },

  methods: {
    async handleCurrencyChange(nextCurrency) {
      await this.currencyStore.setSelectedCurrency(nextCurrency, this.authStore.currentUserId);
    },
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
  height: 76px;
  box-sizing: border-box;
  border-bottom: 1px solid #dfe6e3;
  background: #ffffff;
  display: flex;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #24302c;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
}

.page-content {
  padding: 20px;
  flex: 1;
}

.desc {
  color: gray;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0 0 10px 4px;
}

.settings-group {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.menu-item {
  width: 100%;
  background: white;
  border: none;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.currency-item {
  cursor: default;
  align-items: flex-start;
  gap: 12px;
}

.currency-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.currency-select {
  border: 1px solid #d8dde3;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
  color: #2f3640;
  background: #fff;
}

.menu-item + .menu-item {
  border-top: 1px solid #ececec;
}

.menu-item--static {
  cursor: default;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon {
  width: 32px;
  height: 32px;
}

.menu-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.menu-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #2f3640;
}

.menu-subtext {
  margin: 2px 0 0 0;
  font-size: 14px;
  color: #7b8190;
}

.menu-arrow {
  width: 18px;
  height: 18px;
  color: #a3aab5;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .currency-item {
    flex-direction: column;
    align-items: stretch;
  }

  .currency-controls {
    min-width: 0;
    width: 100%;
  }
}

.why-icon,
.info-icon {
  width: 30px;
  height: 30px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.help-modal {
  width: min(420px, 92%);
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.help-modal h2 {
  margin: 0;
  color: #2f3640;
}

.help-modal p {
  margin: 12px 0 18px;
  color: #6b7280;
  line-height: 1.5;
}

.help-email-link {
  color: #1f2937;
  text-decoration: none;
  font-weight: 600;
}

.help-close-btn {
  width: 100%;
  border: none;
  background: transparent;
  color: #6b7280;
  margin-top: 10px;
  padding: 10px;
  cursor: pointer;
}
</style>
