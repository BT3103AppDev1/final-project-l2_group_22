import { createApp } from 'vue'
import { watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'
import VirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useAuthStore } from './stores/AuthStore'
import { useCurrencyStore } from './stores/currency'

const pinia = createPinia()

const app = createApp(App)
  .use(pinia)
  .use(router)
  .use(VCalendar, {})
  .use(VirtualScroller)

const authStore = useAuthStore()
const currencyStore = useCurrencyStore()

watch(
  () => authStore.currentUserId,
  (userId) => {
    currencyStore.init(userId)
  },
  { immediate: true }
)

authStore.initializeAuth().then(() => {
  app.mount('#app')
})
