import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'
import VirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useAuthStore } from './stores/AuthStore'

const pinia = createPinia()

const app = createApp(App)
  .use(pinia)
  .use(router)
  .use(VCalendar, {})
  .use(VirtualScroller)

const authStore = useAuthStore()
authStore.initializeAuth().then(() => {
  app.mount('#app')
})
