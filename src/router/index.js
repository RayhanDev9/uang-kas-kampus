import { createRouter, createWebHistory } from 'vue-router'
import AdminView from '../views/AdminView.vue'
import DashboardView from '../views/DashboardView.vue'
import InfoView from '../views/InfoView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/info', name: 'info', component: InfoView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
