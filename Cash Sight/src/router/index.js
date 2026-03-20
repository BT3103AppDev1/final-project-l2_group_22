import { createRouter, createWebHistory } from 'vue-router'
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
    },
  ],
})

export default router
