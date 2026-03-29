import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Login from '../login/Login.vue'
import Register from '../login/Register.vue'
import ResetPassword from '../login/Reset-Password.vue'
import ChangeEmail from '../login/Change-Email.vue'
import Grand from '../Grand.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword,
    },
    {
      path: '/change-email',
      name: 'change-email',
      component: ChangeEmail,
    },
    {
      path: '/grand',
      name: 'grand',
      component: Grand,
      meta: { requiresAuth: true }
    },
  ],
})

function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribed = onAuthStateChanged(getAuth(), user => { unsubscribed(); resolve(user) }, reject);
  })
}

// Route guard to check for authenticated access for routes that require authentication

router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser();

  if (to.meta.requiresAuth && !user) {
    next('/login');
  }

  if (to.path === '/login' && user) {
    next('/grand');
  }

  next();
})

export default router
