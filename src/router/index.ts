import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/trips',
      name: 'trips',
      component: () => import('@/views/TripsView.vue'),
    },
    {
      path: '/trips/create',
      name: 'trip-create',
      component: () => import('@/views/TripCreateView.vue'),
    },
    {
      path: '/invitations',
      name: 'invitations',
      component: () => import('@/views/TripInvitationsView.vue'),
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: () => import('@/views/MyPageView.vue'),
    },
  ],
})

export default router
