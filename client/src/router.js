import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    // Динамический импорт для ленивой загрузки
    component: () => import('@/Pages/Home/Home.vue')
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('@/Pages/Gallery/Gallery.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/Pages/Profile/Profile.vue')
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/Pages/Profile/users/ProfileUsersList.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/Pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router