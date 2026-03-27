import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'
import VirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(VCalendar, {})
  .use(VirtualScroller)
  .mount('#app')
