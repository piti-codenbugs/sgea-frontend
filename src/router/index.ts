import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import WelcomeView from '../views/WelcomeView.vue'

const routes = [
  { path: '/', component: WelcomeView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
