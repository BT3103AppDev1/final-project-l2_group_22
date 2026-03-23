import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Transactions from '@/views/Transactions.vue'
import Insights from '@/views/Insights.vue'
import Settings from '@/views/Settings.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions
  },
  {
    path: '/insights',
    name: 'Insights',
    component: Insights
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/add-transaction',
    name: 'AddTransaction',
    component: () => import('@/views/AddTransaction.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router