import { createRouter, createWebHistory } from 'vue-router'
import AdminView from '../views/AdminView.vue'
import DashboardView from '../views/DashboardView.vue'
import InfoView from '../views/InfoView.vue'
import HistoryView from '../views/HistoryView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/riwayat', name: 'history', component: HistoryView },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true },
    },
    { path: '/info', name: 'info', component: InfoView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

const TOKEN_KEY = 'kaskita_bendahara_token'

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth || to.path.startsWith('/admin')) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      return next({ path: '/' })
    }
  }
  return next()
})

export default router
