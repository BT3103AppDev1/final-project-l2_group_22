import { createRouter, createWebHistory } from 'vue-router'
import Login from '../login/Login.vue'
import Register from '../login/Register.vue'
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
      path: '/grand',
      name: 'grand',
      component: Grand,
    },
  ],
})

export default router
