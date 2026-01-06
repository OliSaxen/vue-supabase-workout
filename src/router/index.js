import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'

// Lazy loading för bättre prestanda
const HomeView = () => import('@/views/HomeView.vue')
const EventsView = () => import('@/views/EventsView.vue')
const ProgressView = () => import('@/views/ProgressView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/events', name: 'Events', component: EventsView },
  { 
    path: '/progress', 
    name: 'Progress', 
    component: ProgressView,
    meta: { requiresAuth: true } // Kräver inloggning
  },
  { 
    path: '/profile', 
    name: 'Profile', 
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard för autentisering
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router