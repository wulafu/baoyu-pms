import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/Login.vue'),
      meta: { public: true }
    },
    {
      path: '/guest',
      component: () => import('@/layouts/GuestLayout.vue'),
      redirect: '/guest/home',
      children: [
        {
          path: 'home',
          name: 'GuestHome',
          component: () => import('@/views/guest/Home.vue')
        },
        {
          path: 'room/:id',
          name: 'GuestRoomDetail',
          component: () => import('@/views/guest/RoomDetail.vue')
        },
        {
          path: 'guide/:id',
          name: 'GuestGuide',
          component: () => import('@/views/guest/Guide.vue')
        },
        {
          path: 'identity',
          name: 'GuestIdentity',
          component: () => import('@/views/guest/Identity.vue')
        },
        {
          path: 'orders',
          name: 'GuestOrders',
          component: () => import('@/views/guest/Orders.vue')
        },
        {
          path: 'mine',
          name: 'GuestMine',
          component: () => import('@/views/guest/Mine.vue')
        }
      ]
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      redirect: '/calendar',
      children: [
        {
          path: 'calendar',
          name: 'Calendar',
          component: () => import('@/views/Calendar.vue')
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('@/views/Orders.vue')
        },
        {
          path: '/orders/:id',
          name: 'OrderDetail',
          component: () => import('@/views/OrderDetail.vue')
        },
        {
          path: 'mine',
          name: 'Mine',
          component: () => import('@/views/Mine.vue')
        },
        {
          path: '/report',
          name: 'Report',
          component: () => import('@/views/Report.vue')
        },
        {
          path: '/housekeeping',
          name: 'Housekeeping',
          component: () => import('@/views/Housekeeping.vue')
        },
        {
          path: '/channels',
          name: 'Channels',
          component: () => import('@/views/Channels.vue')
        },
        {
          path: '/finance',
          name: 'Finance',
          component: () => import('@/views/Finance.vue')
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
