import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Request',
    component: () => import('@/views/RequestForm.vue'),
  },
  {
    path: '/projector',
    name: 'Projector',
    component: () => import('@/views/Projector.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
