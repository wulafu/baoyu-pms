import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/Login.vue'),
      meta: { public: true }
    },
    {
      path: '/mock-oauth',
      component: () => import('@/views/MockOAuth.vue'),
      meta: { public: true }
    },
    {
      path: '/channels/callback',
      component: () => import('@/views/ChannelsCallback.vue'),
      meta: { public: true } 
    },
    {
      path: '/',
      component: MainLayout,
      redirect: '/calendar',
      children: [
        {
          path: 'calendar',
          name: 'Calendar',
          component: () => import('@/views/Calendar.vue')
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('@/views/Orders.vue')
        },
        {
          path: 'channels',
          name: 'Channels',
          component: () => import('@/views/Channels.vue')
        },
        {
          path: 'rules',
          name: 'Rules',
          component: () => import('@/views/Rules.vue')
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/Settings.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (!token && !to.meta.public) {
    next('/login')
  } else {
    next()
  }
})

export default router
