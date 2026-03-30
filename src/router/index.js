import { createRouter, createWebHistory } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase'
import Login from '@/login/Login.vue'
import Register from '@/login/Register.vue'
import ResetPassword from '@/login/Reset-Password.vue'
import ChangeEmail from '@/login/Change-Email.vue'
import Dashboard from '@/views/Dashboard.vue'
import Transactions from '@/views/Transactions.vue'
import Insights from '@/views/Insights.vue'
import Settings from '@/views/Settings.vue'
import Profile from '@/views/Profile.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/change-email',
    name: 'ChangeEmail',
    component: ChangeEmail,
    meta: { requiresAuth: true }
  },
  {
    path: '/grand',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions,
    meta: { requiresAuth: true }
  },
  {
    path: '/insights',
    name: 'Insights',
    component: Insights,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions/add',
    name: 'AddTransaction',
    component: () => import('@/views/AddTransaction.vue'),
    props: route => ({ type: route.query.type }),
    meta: { requiresAuth: true }
  },
  {
    path: '/add-transaction',
    redirect: to => {
      return { path: '/transactions/add', query: to.query }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function getCurrentUser() {
  if (!auth) {
    return Promise.resolve(null)
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe()
        resolve(user)
      },
      reject
    )
  })
}

router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser()
  const authPages = ['/login', '/register', '/reset-password']

  if (to.path === '/') {
    next(user ? '/dashboard' : '/login')
    return
  }

  if (to.meta.requiresAuth && !user) {
    next('/login')
    return
  }

  if (authPages.includes(to.path) && user) {
    next('/dashboard')
    return
  }

  next()
})

export default router